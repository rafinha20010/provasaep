'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function CadastroPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function handleCadastro() {
    setErro('');
    setSucesso('');

    if (!nome || !email || !senha) {
      setErro('Preencha todos os campos.');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Erro ao cadastrar.');
        return;
      }

      setSucesso('Cadastro realizado com sucesso!');
      setNome('');
      setEmail('');
      setSenha('');
    } catch {
      setErro('Erro de conexão com o servidor.');
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <p className={styles.titulo}>Sistema de Gestão de Estoque</p>

        <div className={styles.campo}>
          <label className={styles.label}>Nome</label>
          <input
            className={styles.input}
            type="text"
            placeholder="Digite seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className={styles.campo}>
          <label className={styles.label}>E-mail</label>
          <input
            className={styles.input}
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.campo}>
          <label className={styles.label}>Senha</label>
          <input
            className={styles.input}
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        {erro && <p className={styles.erro}>{erro}</p>}
        {sucesso && <p className={styles.sucesso}>{sucesso}</p>}

        <button className={styles.botao} onClick={handleCadastro}>
          Cadastrar
        </button>

        <p className={styles.rodape}>
          Já tem conta? <a href="/login" className={styles.link}>Entrar</a>
        </p>
      </div>
    </div>
  );
}