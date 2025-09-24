import { Injectable } from '@nestjs/common';
import { pool } from '@/lib/db.pool';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export type UserRow = {
  id: number;
  username: string;
  email: string;
  password_hash?: string;
  full_name: string;
  role: string;
  is_active: number;
  last_login: string | null;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class UsersService {
  async findById(id: number): Promise<UserRow | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [id]);
    return (rows as UserRow[])[0] || null;
  }

  async findByUsername(username: string): Promise<UserRow | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = ? LIMIT 1',
      [username],
    );
    return (rows as UserRow[])[0] || null;
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email],
    );
    return (rows as UserRow[])[0] || null;
  }

  async createUser(payload: {
    username: string;
    email: string;
    password_hash: string;
    full_name: string;
    role?: string;
  }): Promise<{ insertId: number }> {
    const { username, email, password_hash, full_name, role = 'user' } = payload;
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (username, email, password_hash, full_name, role, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [username, email, password_hash, full_name, role],
    );
    return { insertId: result.insertId };
  }

  async updateLastLogin(id: number): Promise<void> {
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
  }

  async listAll(): Promise<UserRow[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, username, email, full_name, role, is_active, last_login, created_at, updated_at
       FROM users ORDER BY id DESC`,
    );
    return rows as UserRow[];
  }

  async deleteById(id: number): Promise<void> {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
  }

  async updateUser(
    id: number,
    data: Partial<{
      username: string;
      email: string;
      full_name: string;
      role: string;
      is_active: number;
      password_hash: string;
    }>,
  ) {
    const fields: string[] = [];
    const params: (string | number)[] = [];

    for (const key of Object.keys(data) as (keyof typeof data)[]) {
      fields.push(`${key} = ?`);
      params.push(data[key]!);
    }

    if (fields.length === 0) return;

    params.push(id);
    await pool.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      params,
    );
  }
}
