import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [rows] = await pool.query('SELECT * FROM produto WHERE id = ?', [id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar produto', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nome, descricao, preco, estoque, estoque_min, user_id } = body;

    if (!nome || preco === undefined || !user_id) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome, preco e user_id' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      'UPDATE produto SET nome = ?, descricao = ?, preco = ?, estoque = ?, estoque_min = ?, user_id = ? WHERE id = ?',
      [nome, descricao ?? null, preco, estoque ?? 0, estoque_min ?? 0, user_id, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Produto atualizado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar produto', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const [result] = await pool.query('DELETE FROM produto WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Produto deletado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar produto', details: error.message },
      { status: 500 }
    );
  }
}