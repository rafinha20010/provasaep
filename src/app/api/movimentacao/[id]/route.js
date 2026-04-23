import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [rows] = await pool.query(`
      SELECT m.*, u.nome AS user_nome, p.nome AS produto_nome
      FROM movimentacao m
      JOIN user u ON m.user_id = u.id
      JOIN produto p ON m.produto_id = p.id
      WHERE m.id = ?
    `, [id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Movimentação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar movimentação', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const [result] = await pool.query('DELETE FROM movimentacao WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Movimentação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Movimentação deletada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar movimentação', details: error.message },
      { status: 500 }
    );
  }
}