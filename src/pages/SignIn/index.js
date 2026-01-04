import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth';
import './signin.css';
import logo from '../../assets/logo.png';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Inicializa o tema buscando do localStorage ou padrão 'light'
  const [theme, setTheme] = useState(localStorage.getItem('@theme') || 'light');

  const { signIn, loadingAuth } = useContext(AuthContext);

  // Aplica o tema ao elemento raiz do HTML sempre que mudar
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
      
      {/* Seletor de Tema posicionado no canto superior direito */}
      <div className="theme-selector-wrapper">
        <label>TEMA</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
          <option value="jade">Verde Jade</option>
        </select>
      </div>

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
      </div>
    </div>
  );
}
