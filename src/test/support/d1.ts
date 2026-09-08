import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const MIGRATIONS_DIR = join(process.cwd(), "drizzle");
const STATEMENT_SEPARATOR = "--> statement-breakpoint";

type Row = Record<string, unknown>;

/**
 * A `D1Database` stand-in backed by Node's built-in SQLite. Drizzle talks to the
 * real query planner, so repository tests exercise the SQL the app ships rather
 * than a hand-written chain of mocks.
 */
export type TestD1 = D1Database & { close: () => void };

function toRawRows(rows: Row[]): unknown[][] {
  return rows.map((row) => Object.keys(row).map((column) => row[column]));
}

function migrationStatements(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((entry) => entry.endsWith(".sql"))
    .sort()
    .flatMap((file) => readFileSync(join(MIGRATIONS_DIR, file), "utf8").split(STATEMENT_SEPARATOR))
    .map((statement) => statement.trim())
    .filter(Boolean);
}

export function createTestD1(): TestD1 {
  const sqlite = new DatabaseSync(":memory:");
  for (const statement of migrationStatements()) sqlite.exec(statement);

  function prepare(sql: string) {
    return bindStatement(sql, []);
  }

  function bindStatement(sql: string, params: unknown[]) {
    const statement = {
      bind: (...next: unknown[]) => bindStatement(sql, next),
      async all() {
        const results = sqlite.prepare(sql).all(...(params as never[])) as Row[];
        return { results, success: true, meta: {} };
      },
      async raw() {
        const { results } = await statement.all();
        return toRawRows(results);
      },
      async first(column?: string) {
        const { results } = await statement.all();
        const row = results[0];
        if (!row) return null;
        return column === undefined ? row : row[column];
      },
      async run() {
        const { changes, lastInsertRowid } = sqlite.prepare(sql).run(...(params as never[]));
        return { results: [], success: true, meta: { changes: Number(changes), last_row_id: Number(lastInsertRowid) } };
      },
    };
    return statement;
  }

  const database = {
    prepare,
    async batch(statements: { run: () => Promise<unknown> }[]) {
      const results = [];
      for (const statement of statements) results.push(await statement.run());
      return results;
    },
    async exec(sql: string) {
      sqlite.exec(sql);
      return { count: 0, duration: 0 };
    },
    async dump() {
      return new ArrayBuffer(0);
    },
    withSession() {
      return database;
    },
    close: () => sqlite.close(),
  };

  return database as unknown as TestD1;
}
