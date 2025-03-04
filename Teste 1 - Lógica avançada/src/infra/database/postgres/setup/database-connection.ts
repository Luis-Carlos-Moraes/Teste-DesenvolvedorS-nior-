import { Pool, PoolConfig } from 'pg';

export class DatabaseConnection {
  private pool: Pool;

  constructor(config: PoolConfig) {
    this.pool = new Pool(config);
  }

  async connect(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await this.initializeDatabase(client);
    } finally {
      client.release();
    }
  }

  private async initializeDatabase(client: any): Promise<void> {
    await client.query(`
      CREATE TABLE IF NOT EXISTS transacoes (
        id SERIAL PRIMARY KEY,
        valor REAL,
        pagador TEXT,
        recebedor TEXT,
        timestamp TEXT
      )
    `);
  }

  getPool(): Pool {
    return this.pool;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}