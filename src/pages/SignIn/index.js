import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth';
import './signin.css';
import logo from '../../assets/logo.png';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('@theme') || 'light');

  const { signIn, loadingAuth } = useContext(AuthContext);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('@theme', theme);
  }, [theme]);

  function handleSubmit(e) {
    e.preventDefault();
    if (email !== '' && password !== '') {
      signIn(email, password);
    }
  }

  return (
    <div className="container-center">
    {/* Seletor posicionado de forma absoluta */}
    <div className="theme-selector-wrapper">
      <label style={{ fontSize: '0.7em', marginBottom: '4px', color: 'var(--text-color)' }}>TEMA</label>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Claro</option>
        <option value="dark">Escuro</option>
        <option value="jade">Verde Jade</option>
      </select>
    </div>

    <div className="login">
      <div className="login-area">
        <img src={logo} alt="Logo" />
      </div>
      <form onSubmit={handleSubmit}>
        <h1>Entrar</h1>
        {/* ... campos de input ... */}
        <button type="submit">{loadingAuth ? 'Carregando...' : 'Acessar'}</button>
      </form>
      <Link to="/register">Criar uma conta</Link>
    </div>
  </div>
)
