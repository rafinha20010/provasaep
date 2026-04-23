import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, u.nome AS user_nome, p.nome AS produto_nome
      FROM movimentacao m
      JOIN user u ON m.user_id = u.id
      JOIN produto p ON m.produto_id = p.id
      ORDER BY m.data DESC
    `);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar movimentações', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { tipo, quantidade, user_id, produto_id } = body;

    if (!tipo || !quantidade || !user_id || !produto_id) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: tipo, quantidade, user_id e produto_id' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      'INSERT INTO movimentacao (data, tipo, quantidade, user_id, produto_id) VALUES (NOW(), ?, ?, ?, ?)',
      [tipo, quantidade, user_id, produto_id]
    );

    return NextResponse.json(
      { message: 'Movimentação registrada com sucesso', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao registrar movimentação', details: error.message },
      { status: 500 }
    );
  }
}