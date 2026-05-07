import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT id, nome, email FROM user');
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('ERRO DETALHADO:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuários', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Cadastro não permitido' },
    { status: 403 }
  );
}