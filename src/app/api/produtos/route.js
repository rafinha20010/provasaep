import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM produto');
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar produtos', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nome, descricao, preco, estoque, estoque_min, user_id } = body;

    if (!nome || preco === undefined || !user_id) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome, preco e user_id' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      'INSERT INTO produto (nome, descricao, preco, estoque, estoque_min, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, descricao ?? null, preco, estoque ?? 0, estoque_min ?? 0, user_id]
    );

    return NextResponse.json(
      { message: 'Produto criado com sucesso', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar produto', details: error.message },
      { status: 500 }
    );
  }
}