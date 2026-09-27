import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { hashPassword } from '../src/lib/password.js';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

test('migration preserves valid legacy IDs without extracting or executing pasted HTML', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE site_settings (id INTEGER PRIMARY KEY, googlePixelId TEXT)');
    const values = ['AW-123456789', 'G-TEST123456', '<script>AW-123</script>', 'AW-abc', null];
    const insert = db.prepare('INSERT INTO site_settings (id, googlePixelId) VALUES (?, ?)');
    values.forEach((value, index) => insert.run(index + 1, value));
    db.exec(readFileSync(new URL('../prisma/migrations/20260831120000_separate_google_ads_id/migration.sql', import.meta.url), 'utf8'));
    const rows = db.prepare('SELECT googlePixelId, googleAdsId FROM site_settings ORDER BY id').all();
    assert.equal(rows[0].googleAdsId, values[0]);
    assert.equal(rows[0].googlePixelId, null);
    rows.slice(1).forEach((row, index) => {
      assert.equal(row.googlePixelId, values[index + 1]);
      assert.equal(row.googleAdsId, null);
    });
  } finally { db.close(); }
});

test('pixel settings persist GA4 and Ads separately, reject scripts and support clearing', async () => {
  const app = await buildApp();
  try {
    await app.prisma.adminUser.create({data:{email:'pixels@example.com',passwordHash:await hashPassword('Test12345!'),role:'SUPER_ADMIN',isActive:true}});
    const login = await app.inject({method:'POST',url:'/api/auth/login',payload:{email:'pixels@example.com',password:'Test12345!'}});
    const cookie = `wp_session=${login.cookies.find(c=>c.name==='wp_session')!.value}`;
    const save = (payload: object, authenticated = true) => app.inject({method:'PATCH',url:'/api/admin/settings/pixels',headers:authenticated?{cookie}:{},payload});
    assert.equal((await save({googleAdsId:'AW-123'}, false)).statusCode, 401);
    const good = await save({googlePixelId:' G-TEST123456 ',googleAdsId:' AW-123456789 '});
    assert.equal(good.statusCode, 200);
    const publicSettings = (await app.inject('/api/settings/public')).json().data;
    assert.equal(publicSettings.googlePixelId, 'G-TEST123456');
    assert.equal(publicSettings.googleAdsId, 'AW-123456789');
    for (const payload of [{googlePixelId:'<script>gtag()</script>'},{googlePixelId:'AW-123'},{googleAdsId:'G-TEST123456'},{googleAdsId:'AW-123/label'},{googleAdsId:"AW-1');alert(1)"}]) {
      assert.equal((await save(payload)).statusCode, 400);
    }
    assert.equal((await app.prisma.siteSetting.findUniqueOrThrow({where:{id:1}})).googleAdsId,'AW-123456789');
    assert.equal((await save({googlePixelId:''})).statusCode, 200);
    const partial = await app.prisma.siteSetting.findUniqueOrThrow({where:{id:1}});
    assert.equal(partial.googlePixelId, '');
    assert.equal(partial.googleAdsId, 'AW-123456789');
    assert.equal((await save({googleAdsId:''})).statusCode, 200);
    assert.equal((await app.prisma.siteSetting.findUniqueOrThrow({where:{id:1}})).googleAdsId, '');
    for (const [path, field, value, other] of [
      ['ga4', 'googlePixelId', 'G-TEST123456', 'googleAdsId'],
      ['google-ads', 'googleAdsId', 'AW-123456789', 'googlePixelId'],
    ]) {
      const url = `/api/admin/settings/${path}`;
      assert.equal((await app.inject({method:'GET',url})).statusCode,401);
      assert.equal((await app.inject({method:'PATCH',url,payload:{[field]:value}})).statusCode,401);
      const before = await app.prisma.siteSetting.findUniqueOrThrow({where:{id:1}});
      const saved = await app.inject({method:'PATCH',url,headers:{cookie},payload:{[field]:value}});
      assert.equal(saved.statusCode,200);
      assert.deepEqual(saved.json().data,{[field]:value});
      const isolated = await app.inject({method:'GET',url,headers:{cookie}});
      assert.deepEqual(isolated.json().data,{[field]:value});
      for (const payload of [{}, {[field]:value,[other]:''}, {[field]:'<script>bad()</script>'}]) {
        assert.equal((await app.inject({method:'PATCH',url,headers:{cookie},payload})).statusCode,400);
      }
      assert.equal((await app.inject({method:'PATCH',url,headers:{cookie},payload:{[field]:''}})).statusCode,200);
      const after = await app.prisma.siteSetting.findUniqueOrThrow({where:{id:1}});
      assert.equal(after[other as 'googleAdsId'|'googlePixelId'],before[other as 'googleAdsId'|'googlePixelId']);
      assert.equal(after[field as 'googleAdsId'|'googlePixelId'],'');
    }
  } finally { await app.close(); }
});
