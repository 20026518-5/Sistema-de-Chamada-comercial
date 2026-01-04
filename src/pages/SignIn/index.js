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

  // Aplica o tema sempre que ele for alterado
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
      <div className="login">
        <div className="login-area">
          <img src={logo} alt="Logo do sistema" />
        </div>

        <form onSubmit={handleSubmit}>
          <h1>Entrar</h1>
          <input 
            type="text" 
            placeholder="email@email.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="*******" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button type="submit">
            {loadingAuth ? 'Carregando...' : 'Acessar'}
          </button>
        </form>

        <Link to="/register">Criar uma conta</Link>

        {/* --- Espaço para escolher o Tema --- */}
        <div className="theme-selector" style={{ marginTop: '20px', textAlign: 'center' }}>
          <label style={{ fontSize: '0.8em', display: 'block', marginBottom: '5px' }}>
            Escolha o tema:
          </label>
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #DDD' }}
          >
            <option value="light">Padrão (Claro)</option>
            <option value="dark">Escuro</option>
            <option value="jade">Verde Jade</option>
          </select>
        </div>
      </div>
    </div>
  );
}
