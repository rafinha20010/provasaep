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
  const conn = await pool.getConnection();
  try {
    const body = await request.json();
    const { tipo, quantidade, user_id, produto_id, data } = body;

    if (!tipo || !quantidade || !user_id || !produto_id) {
      conn.release();
      return NextResponse.json(
        { error: 'Campos obrigatórios: tipo, quantidade, user_id e produto_id' },
        { status: 400 }
      );
    }

    const qtd = parseInt(quantidade);
    const tipoNormalizado = tipo.toLowerCase() === 'entrada' ? 'Entrada' : 'Saida';
    const dataFinal = data ? new Date(data + 'T12:00:00') : new Date();

    await conn.beginTransaction();

    const [rows] = await conn.query(
      'SELECT estoque FROM produto WHERE id = ? FOR UPDATE',
      [produto_id]
    );

    if (rows.length === 0) {
      await conn.rollback();
      conn.release();
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    const estoqueAtual = rows[0].estoque;

    if (tipoNormalizado === 'Saida' && estoqueAtual < qtd) {
      await conn.rollback();
      conn.release();
      return NextResponse.json(
        { error: `Estoque insuficiente. Disponível: ${estoqueAtual}` },
        { status: 400 }
      );
    }

    const delta = tipoNormalizado === 'Entrada' ? qtd : -qtd;
    await conn.query(
      'UPDATE produto SET estoque = estoque + ? WHERE id = ?',
      [delta, produto_id]
    );

    const [result] = await conn.query(
      'INSERT INTO movimentacao (data, tipo, quantidade, user_id, produto_id) VALUES (?, ?, ?, ?, ?)',
      [dataFinal, tipoNormalizado, qtd, user_id, produto_id]
    );

    await conn.commit();
    conn.release();

    return NextResponse.json(
      { message: 'Movimentação registrada com sucesso', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    await conn.rollback();
    conn.release();
    return NextResponse.json(
      { error: 'Erro ao registrar movimentação', details: error.message },
      { status: 500 }
    );
  }
}