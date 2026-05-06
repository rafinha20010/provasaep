'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  estoque_min: number;
  user_id: number;
}

interface ModalData {
  nome: string;
  descricao: string;
  preco: string;
  estoque: string;
  estoque_min: string;
}

const EMPTY_FORM: ModalData = {
  nome: '',
  descricao: '',
  preco: '',
  estoque: '',
  estoque_min: '',
};

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [form, setForm] = useState<ModalData>(EMPTY_FORM);
  const [erro, setErro] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Produto | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [user, setUser] = useState<{id: number, nome?: string}>({ id: 1 });

useEffect(() => {
  const stored = localStorage.getItem('user');
  if (stored) setUser(JSON.parse(stored));
}, []);

  async function carregarProdutos() {
    try {
      const res = await fetch('/api/produtos');
      const data = await res.json();
      setProdutos(data);
    } catch {
      setErro('Erro ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  function abrirNovo() {
    setEditando(null);
    setForm(EMPTY_FORM);
    setErro('');
    setModalAberto(true);
  }

  function abrirEditar(p: Produto) {
    setEditando(p);
    setForm({
      nome: p.nome,
      descricao: p.descricao,
      preco: String(p.preco),
      estoque: String(p.estoque),
      estoque_min: String(p.estoque_min),
    });
    setErro('');
    setModalAberto(true);
  }

  async function salvar() {
    setErro('');
    if (!form.nome || !form.preco) {
      setErro('Nome e preço são obrigatórios.');
      return;
    }
    setSalvando(true);
    try {
      const body = {
        nome: form.nome,
        descricao: form.descricao,
        preco: parseFloat(form.preco),
        estoque: parseInt(form.estoque) || 0,
        estoque_min: parseInt(form.estoque_min) || 0,
        user_id: user.id,
      };

      const url = editando ? `/api/produtos/${editando.id}` : '/api/produtos';
      const method = editando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setErro(data.error || 'Erro ao salvar.');
        return;
      }

      setModalAberto(false);
      await carregarProdutos();
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(p: Produto) {
    try {
      await fetch(`/api/produtos/${p.id}`, { method: 'DELETE' });
      setConfirmDelete(null);
      await carregarProdutos();
    } catch {
      setErro('Erro ao excluir.');
    }
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>▪ Gestão de Estoque</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.userLabel}>Olá, <strong>{user.nome || 'Usuário'}</strong></span>
          <a href="/login" className={styles.sairBtn}>Sair</a>
        </div>
      </header>

      <main className={styles.main}>
        {/* Título */}
        <div className={styles.topo}>
          <div>
            <h1 className={styles.titulo}>Cadastro de Produtos</h1>
            <p className={styles.subtitulo}>Gerencie o catálogo de produtos do sistema</p>
          </div>
        </div>

        {/* Barra de ações */}
        <div className={styles.barra}>
          <input
            className={styles.busca}
            type="text"
            placeholder="Buscar produto por nome..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          <div className={styles.barraBotoes}>
            <button className={styles.btnNovo} onClick={abrirNovo}>+ Novo Produto</button>
            <a href="/movimentacoes" className={styles.btnVoltar}>Movimentações</a>
          </div>
        </div>

        {/* Tabela */}
        <div className={styles.tableWrapper}>
          {loading ? (
            <div className={styles.loading}>Carregando...</div>
          ) : (
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Preço (R$)</th>
                  <th>Estoque</th>
                  <th>Estoque Mín.</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.vazio}>Nenhum produto encontrado.</td>
                  </tr>
                ) : (
                  produtosFiltrados.map(p => {
                    const baixo = p.estoque <= p.estoque_min;
                    return (
                      <tr key={p.id} className={baixo ? styles.rowBaixo : ''}>
                        <td>{p.id}</td>
                        <td>
                          {p.nome}
                          {baixo && <span className={styles.badge}>⚠ Estoque Baixo</span>}
                        </td>
                        <td>{p.descricao}</td>
                        <td>{Number(p.preco).toFixed(2)}</td>
                        <td className={baixo ? styles.estoqueBaixo : ''}>{p.estoque}</td>
                        <td>{p.estoque_min}</td>
                        <td className={styles.acoes}>
                          <button className={styles.btnEditar} onClick={() => abrirEditar(p)}>Editar</button>
                          <button className={styles.btnExcluir} onClick={() => setConfirmDelete(p)}>Excluir</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal Criar/Editar */}
      {modalAberto && (
        <div className={styles.overlay} onClick={() => setModalAberto(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editando ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button className={styles.fechar} onClick={() => setModalAberto(false)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.campo}>
                <label>Nome *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  placeholder="Nome do produto"
                />
              </div>
              <div className={styles.campo}>
                <label>Descrição</label>
                <input
                  type="text"
                  value={form.descricao}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Descrição do produto"
                />
              </div>
              <div className={styles.campoRow}>
                <div className={styles.campo}>
                  <label>Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.preco}
                    onChange={e => setForm({ ...form, preco: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className={styles.campo}>
                  <label>Estoque</label>
                  <input
                    type="number"
                    value={form.estoque}
                    onChange={e => setForm({ ...form, estoque: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className={styles.campo}>
                  <label>Estoque Mínimo</label>
                  <input
                    type="number"
                    value={form.estoque_min}
                    onChange={e => setForm({ ...form, estoque_min: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              {erro && <p className={styles.erroModal}>{erro}</p>}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setModalAberto(false)}>Cancelar</button>
              <button className={styles.btnSalvar} onClick={salvar} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {confirmDelete && (
        <div className={styles.overlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modalPequeno} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Confirmar Exclusão</h2>
              <button className={styles.fechar} onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p>Tem certeza que deseja excluir o produto <strong>{confirmDelete.nome}</strong>?</p>
              <p className={styles.avisoExclusao}>Esta ação não pode ser desfeita.</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className={styles.btnExcluirConfirm} onClick={() => excluir(confirmDelete)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}