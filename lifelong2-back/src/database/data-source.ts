import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { loadEnv } from '../config/env-loader';

loadEnv();

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'lifelong2',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  migrationsTableName: 'MIGRATIONS',
});
