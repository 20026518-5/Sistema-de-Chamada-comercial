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
      <div className="login">
        <div className="login-area">
          <img src={logo} alt="Logo do sistema" />
        </div>

        <form onSubmit={handleSubmit}>
          <h1>Entrar</h1>
          <input type="text" placeholder="email@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="*******" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">{loadingAuth ? 'Carregando...' : 'Acessar'}</button>
        </form>

        <Link to="/register">Criar uma conta</Link>

        <div className="theme-selector" style={{ marginTop: '20px', borderTop: '1px solid #DDD', paddingTop: '10px' }}>
          <label style={{ fontSize: '0.8em', color: '#666' }}>Personalizar Tema:</label>
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            style={{ width: '100%', marginTop: '5px', padding: '8px', borderRadius: '4px' }}
          >
            <option value="light">Claro (Padrão)</option>
            <option value="dark">Escuro</option>
            <option value="jade">Verde Jade</option>
          </select>
        </div>
      </div>
    </div>
  );
}
