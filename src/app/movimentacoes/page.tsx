'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

interface Produto {
  id: number;
  nome: string;
  estoque: number;
  estoque_min: number;
}

interface Movimentacao {
  id: number;
  data: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  produto_id: number;
  produto_nome: string;
  user_nome: string;
}

// Bubble Sort por nome
function bubbleSortPorNome(arr: Produto[]): Produto[] {
  const sorted = [...arr];
  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = 0; j < sorted.length - 1 - i; j++) {
      if (sorted[j].nome.localeCompare(sorted[j + 1].nome) > 0) {
        [sorted[j], sorted[j + 1]] = [sorted[j + 1], sorted[j]];
      }
    }
  }
  return sorted;
}

function formatarData(dataStr: string) {
  const d = new Date(dataStr);
  return d.toLocaleDateString('pt-BR');
}

export default function MovimentacoesPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const [form, setForm] = useState({
    produto_id: '',
    tipo: 'entrada',
    quantidade: '',
  });

  const [user, setUser] = useState<{ id: number; nome?: string }>({ id: 1 });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  async function carregarDados() {
    try {
      const [resProd, resMov] = await Promise.all([
        fetch('/api/produtos'),
        fetch('/api/movimentacao'),
      ]);
      const [dataProd, dataMov] = await Promise.all([
        resProd.json(),
        resMov.json(),
      ]);
      setProdutos(dataProd);
      setMovimentacoes(dataMov);
    } catch {
      setErro('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const produtosOrdenados = bubbleSortPorNome(produtos);
  const produtosBaixoEstoque = produtos.filter(p => p.estoque <= p.estoque_min);

  function abrirModal() {
    setForm({ produto_id: '', tipo: 'entrada', quantidade: '' });
    setErro('');
    setModalAberto(true);
  }

  async function salvar() {
    setErro('');
    if (!form.produto_id || !form.quantidade) {
      setErro('Selecione o produto e informe a quantidade.');
      return;
    }
    const qtd = parseInt(form.quantidade);
    if (isNaN(qtd) || qtd <= 0) {
      setErro('A quantidade deve ser maior que zero.');
      return;
    }

    setSalvando(true);
    try {
      const res = await fetch('/api/movimentacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: form.tipo,
          quantidade: qtd,
          produto_id: parseInt(form.produto_id),
          user_id: user.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErro(data.error || 'Erro ao salvar movimentação.');
        return;
      }

      setModalAberto(false);
      await carregarDados();
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <span className={styles.logo}>▪ Gestão de Estoque</span>
        <div className={styles.headerRight}>
          <span className={styles.userLabel}>
            Olá, <strong>{user.nome || 'Usuário'}</strong>
          </span>
          <a href="/login" className={styles.sairBtn}>Sair</a>
        </div>
      </header>

      <main className={styles.main}>
        {/* Título */}
        <div className={styles.topo}>
          <h1 className={styles.titulo}>Gestão de Movimentações</h1>
          <p className={styles.subtitulo}>Registre movimentações de entrada e saída</p>
        </div>

        {/* Alerta de estoque baixo */}
        {produtosBaixoEstoque.length > 0 && (
          <div className={styles.alerta}>
            <p className={styles.alertaTitulo}>⚠ Alertas de Estoque:</p>
            {produtosBaixoEstoque.map(p => (
              <p key={p.id} className={styles.alertaItem}>
                &ldquo;{p.nome}&rdquo; está abaixo do mínimo ({p.estoque}/{p.estoque_min})
              </p>
            ))}
          </div>
        )}

        {/* Barra de ações — tabela de produtos */}
        <div className={styles.barra}>
          <span className={styles.barraInfo}>
            Produtos ordenados alfabeticamente (Bubble Sort)
          </span>
          <div className={styles.barraBotoes}>
            <button className={styles.btnNovo} onClick={abrirModal}>
              + Nova Movimentação
            </button>
            <a href="/produtos" className={styles.btnVoltar}>Voltar</a>
          </div>
        </div>

        {/* Tabela de Produtos */}
        <div className={styles.tableWrapper}>
          {loading ? (
            <div className={styles.loading}>Carregando...</div>
          ) : (
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Est. Mínimo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {produtosOrdenados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.vazio}>Nenhum produto cadastrado.</td>
                  </tr>
                ) : (
                  produtosOrdenados.map(p => {
                    const baixo = p.estoque <= p.estoque_min;
                    return (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.nome}</td>
                        <td>{p.estoque}</td>
                        <td>{p.estoque_min}</td>
                        <td>
                          {baixo ? (
                            <span className={styles.badgeBaixo}>Abaixo do mínimo</span>
                          ) : (
                            <span className={styles.badgeNormal}>Normal</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Histórico de Movimentações */}
        <div>
          <p className={styles.secaoTitulo}>Histórico de Movimentações</p>
          <p className={styles.secaoSubtitulo}>Últimas movimentações registradas</p>
        </div>

        <div className={styles.tableWrapper}>
          {loading ? (
            <div className={styles.loading}>Carregando...</div>
          ) : (
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={styles.vazio}>Nenhuma movimentação registrada.</td>
                  </tr>
                ) : (
                  movimentacoes.map(m => (
                    <tr key={m.id}>
                      <td>{formatarData(m.data)}</td>
                      <td>{m.produto_nome}</td>
                      <td>
                        {m.tipo === 'entrada' ? (
                          <span className={styles.badgeEntrada}>Entrada</span>
                        ) : (
                          <span className={styles.badgeSaida}>Saída</span>
                        )}
                      </td>
                      <td>{m.quantidade}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal Nova Movimentação */}
      {modalAberto && (
        <div className={styles.overlay} onClick={() => setModalAberto(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Nova Movimentação</h2>
              <button className={styles.fechar} onClick={() => setModalAberto(false)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.campo}>
                <label>Produto *</label>
                <select
                  value={form.produto_id}
                  onChange={e => setForm({ ...form, produto_id: e.target.value })}
                >
                  <option value="">Selecione um produto</option>
                  {produtosOrdenados.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (estoque: {p.estoque})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.campo}>
                <label>Tipo *</label>
                <select
                  value={form.tipo}
                  onChange={e => setForm({ ...form, tipo: e.target.value })}
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>

              <div className={styles.campo}>
                <label>Quantidade *</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantidade}
                  onChange={e => setForm({ ...form, quantidade: e.target.value })}
                  placeholder="0"
                />
              </div>

              {erro && <p className={styles.erroModal}>{erro}</p>}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={() => setModalAberto(false)}>
                Cancelar
              </button>
              <button className={styles.btnSalvar} onClick={salvar} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}