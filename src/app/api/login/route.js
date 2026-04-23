import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, senha } = body;

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: email e senha' },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      'SELECT id, nome, email FROM user WHERE email = ? AND senha = ?',
      [email, senha]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: 'Login realizado com sucesso', user: rows[0] },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao realizar login', details: error.message },
      { status: 500 }
    );
  }
}