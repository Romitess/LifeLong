import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { loadEnv } from '../config/env-loader';

loadEnv();

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

export default new DataSource({
  type: 'mysql',
  host: requiredEnv('DB_HOST'),
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'root',
  password: requiredEnv('DB_PASSWORD'),
  database: process.env.DB_NAME ?? 'lifelong2',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  migrationsTableName: 'MIGRATIONS',
});
