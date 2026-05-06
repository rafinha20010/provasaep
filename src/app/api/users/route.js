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

export async function POST(request) {
  try {
    const body = await request.json();
    const { nome, email, senha } = body;

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome, email e senha' },
        { status: 400 }
      );
    }

    const [existe] = await pool.query('SELECT id FROM user WHERE email = ?', [email]);
    if (existe.length > 0) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      );
    }

    const [result] = await pool.query(
      'INSERT INTO user (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senha]
    );

    return NextResponse.json(
      { message: 'Usuário criado com sucesso', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('ERRO DETALHADO:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário', details: error.message },
      { status: 500 }
    );
  }
}