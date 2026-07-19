import { buildApp } from './app.js';
import { env } from './config/env.js';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ host: env.HOST, port: env.BACKEND_PORT });
  } catch (err) {
    app.log.error(err, '服务启动失败');
    process.exit(1);
  }
}

start();
