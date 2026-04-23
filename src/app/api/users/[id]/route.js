import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [rows] = await pool.query(
      'SELECT id, nome, email FROM user WHERE id = ?', [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar usuário', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nome, email, senha } = body;

    if (!nome || !email) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome e email' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      'UPDATE user SET nome = ?, email = ?, senha = ? WHERE id = ?',
      [nome, email, senha ?? null, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Usuário atualizado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const [result] = await pool.query('DELETE FROM user WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Usuário deletado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar usuário', details: error.message },
      { status: 500 }
    );
  }
}