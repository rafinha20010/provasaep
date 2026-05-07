'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  async function handleLogin() {
    setErro('');

    if (!email || !senha) {
      setErro('Preencha todos os campos.');
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Erro ao fazer login.');
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/produtos';
    } catch {
      setErro('Erro de conexão com o servidor.');
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <p className={styles.titulo}>Sistema de Gestão de Estoque</p>

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

        <button className={styles.botao} onClick={handleLogin}>
          Entrar
        </button>
      </div>
    </div>
  );
}