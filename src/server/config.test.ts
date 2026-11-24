import { describe, expect, it } from 'vitest';
import { resolveDialect } from './config.ts';

describe('resolveDialect', () => {
  it('detects Postgres from postgres:// and postgresql:// URLs', () => {
    expect(resolveDialect({ url: 'postgres://u:p@host/db' })).toBe('postgres');
    expect(resolveDialect({ url: 'postgresql://u:p@host/db?sslmode=require' })).toBe('postgres');
  });

  it('keeps MySQL for mysql:// URLs and discrete DB_* settings', () => {
    expect(resolveDialect({ url: 'mysql://u:p@host:3306/db' })).toBe('mysql');
    expect(resolveDialect({ hasDbName: true })).toBe('mysql');
  });

  it('falls back to SQLite and honours an explicit DB_DIALECT', () => {
    expect(resolveDialect({})).toBe('sqlite');
    expect(resolveDialect({ explicit: 'sqlite', url: 'postgres://u:p@h/db' })).toBe('sqlite');
  });
});
