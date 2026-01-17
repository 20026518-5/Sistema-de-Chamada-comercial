import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth';
import { toast } from 'react-toastify'; 
import './signin.css';
import logo from '../../assets/logo.png';
// Importando ícones para o rodapé
import { FiCode, FiLayers, FiCheckCircle, FiUserCheck, FiGithub } from 'react-icons/fi';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('@theme') || 'light');

  const { signIn, loadingAuth, resetPassword } = useContext(AuthContext);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('@theme', theme);
  }, [theme]);

  async function handleForgotPassword() {
    if (email === '') {
      toast.warning("Digite seu e-mail para recuperar a senha.");
      return;
    }
    
    await resetPassword(email)
      .then(() => {
        toast.success("E-mail de recuperação enviado!");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Erro ao enviar e-mail. Verifique o endereço.");
      });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (email !== '' && password !== '') {
      signIn(email, password);
    }
  }

  return (
    <div className="container-center">
      <div className="theme-selector-wrapper">
        <label>TEMA</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
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
          <button 
            type="button" 
            onClick={handleForgotPassword} 
            style={{ marginTop: 10, background: 'none', border: 0, color: 'var(--text-color)', cursor: 'pointer', fontSize: '0.8em' }}
          >
            Esqueci minha senha
          </button>
        </form>

        <Link to="/register">Criar uma conta</Link>
              
        {/* Rodapé com Ícones */}
        <footer className="footer-sistema">
          <p><FiCode /> Desenvolvido por: <strong>Bruna Eduarda</strong></p>
          <p><FiLayers /> Projeto original: <a href="https://github.com/suelen-m-m/chamada-3" target="_blank" rel="noreferrer">GitHub - Sistema de Chamados</a></p>
          <p><FiCheckCircle /> Licença: MIT</p>
          <p><FiUserCheck /> Adaptado por: <strong>Lucas Vinicius Sampaio Lima</strong></p>
          <p><FiGithub /> GitHub: <a href="https://github.com/20026518-5" target="_blank" rel="noreferrer">https://github.com/20026518-5</a></p>
        </footer>
      </div>
    </div>
  );
}
