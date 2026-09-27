import json
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PLAN = ROOT / "docs" / "audits" / "seo-metadata-plan-20260910.json"
APPLY = Path(__file__).with_name("2026-09-10-seo-metadata-apply.sql")
ROLLBACK = Path(__file__).with_name("2026-09-10-seo-metadata-rollback.sql")


def sql_without_cli_commands(path: Path) -> str:
    return "\n".join(line for line in path.read_text(encoding="utf-8").splitlines() if not line.startswith("."))


def row_for(conn: sqlite3.Connection, entry: dict) -> tuple[str | None, str | None]:
    slug, locale = entry["slug"], entry["locale"]
    if entry["type"] == "product" and locale == "en":
        return conn.execute("SELECT seoTitle, seoDescription FROM products WHERE slug=?", (slug,)).fetchone()
    if entry["type"] == "product":
        return conn.execute("SELECT t.seoTitle,t.seoDescription FROM product_translations t JOIN products p ON p.id=t.productId WHERE p.slug=? AND t.locale=?", (slug, locale)).fetchone()
    if entry["type"] == "category" and locale == "en":
        return conn.execute("SELECT seoTitle, seoDescription FROM product_categories WHERE slug=?", (slug,)).fetchone()
    if entry["type"] == "category":
        return conn.execute("SELECT t.seoTitle,t.seoDescription FROM product_category_translations t JOIN product_categories p ON p.id=t.categoryId WHERE p.slug=? AND t.locale=?", (slug, locale)).fetchone()
    if entry["type"] == "blog" and locale == "en":
        return conn.execute("SELECT seoTitle, seoDescription FROM blog_posts WHERE slug=?", (slug,)).fetchone()
    return conn.execute("SELECT t.seoTitle,t.seoDescription FROM blog_post_translations t JOIN blog_posts p ON p.id=t.postId WHERE p.slug=? AND t.locale=?", (slug, locale)).fetchone()


def main() -> None:
    plan = json.loads(PLAN.read_text(encoding="utf-8"))
    for entry in plan["updates"]:
        if entry.get("seoTitle"):
            rendered = entry["seoTitle"] + plan["limits"]["renderedBrandSuffix"]
            assert len(rendered) <= plan["limits"]["titleMax"], (entry["slug"], len(rendered))
        if entry.get("seoDescription"):
            assert plan["limits"]["descriptionMin"] <= len(entry["seoDescription"]) <= plan["limits"]["descriptionMax"], (entry["slug"], len(entry["seoDescription"]))
    conn = sqlite3.connect(":memory:")
    conn.executescript("""
      CREATE TABLE products(id INTEGER PRIMARY KEY, slug TEXT UNIQUE, seoTitle TEXT, seoDescription TEXT, updatedAt TEXT);
      CREATE TABLE product_translations(id INTEGER PRIMARY KEY, productId INTEGER, locale TEXT, seoTitle TEXT, seoDescription TEXT, updatedAt TEXT);
      CREATE TABLE product_categories(id INTEGER PRIMARY KEY, slug TEXT UNIQUE, seoTitle TEXT, seoDescription TEXT, updatedAt TEXT);
      CREATE TABLE product_category_translations(id INTEGER PRIMARY KEY, categoryId INTEGER, locale TEXT, seoTitle TEXT, seoDescription TEXT, updatedAt TEXT);
      CREATE TABLE blog_posts(id INTEGER PRIMARY KEY, slug TEXT UNIQUE, seoTitle TEXT, seoDescription TEXT, updatedAt TEXT);
      CREATE TABLE blog_post_translations(id INTEGER PRIMARY KEY, postId INTEGER, locale TEXT, seoTitle TEXT, seoDescription TEXT, updatedAt TEXT);
    """)
    ids: dict[tuple[str, str], int] = {}
    next_id = 1
    for entry in plan["updates"]:
        parent_type = entry["type"]
        parent_key = (parent_type, entry["slug"])
        if parent_key not in ids:
            ids[parent_key] = next_id
            table = {"product": "products", "category": "product_categories", "blog": "blog_posts"}[parent_type]
            conn.execute(f"INSERT INTO {table}(id,slug,seoTitle,seoDescription,updatedAt) VALUES(?,?,?,?,datetime('now'))", (next_id, entry["slug"], f"old title {next_id}", f"old description {next_id}"))
            next_id += 1
        if entry["locale"] != "en":
            table, fk = {
                "product": ("product_translations", "productId"),
                "category": ("product_category_translations", "categoryId"),
                "blog": ("blog_post_translations", "postId"),
            }[parent_type]
            exists = conn.execute(f"SELECT 1 FROM {table} WHERE {fk}=? AND locale=?", (ids[parent_key], entry["locale"])).fetchone()
            if not exists:
                conn.execute(f"INSERT INTO {table}({fk},locale,seoTitle,seoDescription,updatedAt) VALUES(?,?,?,?,datetime('now'))", (ids[parent_key], entry["locale"], f"old title {next_id}", f"old description {next_id}"))

    originals = {f'{e["type"]}:{e["slug"]}:{e["locale"]}': row_for(conn, e) for e in plan["updates"]}
    conn.executescript(sql_without_cli_commands(APPLY))
    assert conn.execute("SELECT COUNT(*) FROM seo_metadata_backup_20260910").fetchone()[0] == len(plan["updates"])
    for entry in plan["updates"]:
        title, description = row_for(conn, entry)
        assert title == entry.get("seoTitle", originals[f'{entry["type"]}:{entry["slug"]}:{entry["locale"]}'][0])
        assert description == entry.get("seoDescription", originals[f'{entry["type"]}:{entry["slug"]}:{entry["locale"]}'][1])
    conn.executescript(sql_without_cli_commands(ROLLBACK))
    for entry in plan["updates"]:
        assert row_for(conn, entry) == originals[f'{entry["type"]}:{entry["slug"]}:{entry["locale"]}']
    print(f"PASS: apply and rollback validated for {len(plan['updates'])} entity-locale records")


if __name__ == "__main__":
    main()
