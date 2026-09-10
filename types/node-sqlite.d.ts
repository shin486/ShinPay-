// Minimal type declaration for Node.js's experimental built-in SQLite module.
// These types are intentionally loose since node:sqlite is still experimental.

declare module 'node:sqlite' {
  export interface StatementResultingChanges {
    changes: number | bigint;
    lastInsertRowid: number | bigint;
  }

  export class StatementSync {
    run(...anonymousParameters: unknown[]): StatementResultingChanges;
    get(...anonymousParameters: unknown[]): Record<string, unknown> | undefined;
    all(...anonymousParameters: unknown[]): Record<string, unknown>[];
    keys(): string[];
    sourceSQL(): string;
  }

  export class DatabaseSync {
    constructor(
      location: string | { filename: string },
      options?: Record<string, unknown>
    );
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}