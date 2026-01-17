import { useContext, useState, useEffect } from 'react';
import './header.css';
import { AuthContext } from '../../contexts/auth';
import avatar from '../../assets/avatar.png';
import { Link } from 'react-router-dom';
import { FiHome, FiUser, FiSettings, FiLogOut } from "react-icons/fi";

export default function Header(){
  const { user, logOut } = useContext(AuthContext);
  const [theme, setTheme] = useState(localStorage.getItem('@theme') || 'light');

  // Efeito para aplicar o tema em todas as páginas onde o Header aparece
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('@theme', theme);
  }, [theme]);

  return(
    <div className="sidebar">
      <div className='sidebar-content-top'>
        <div className="avatar-area">
          <img src={user.avatarUrl === null ? avatar : user.avatarUrl} alt="Foto avatar" />
        </div>
        
        {/* Seletor de Tema na Sidebar */}
        <div className="theme-selector-sidebar">
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
            <option value="jade">Jade</option>
          </select>
        </div>
      </div>

      <Link to="/dashboard">
        <FiHome color="#FFF" size={24} />
        Chamados
      </Link>

      <Link to="/customers">
        <FiUser color="#FFF" size={24} />
        Clientes
      </Link>

      <Link to="/profile">
        <FiSettings color="#FFF" size={24} />
        Configurações
      </Link>
      
      {/* Botão de sair movido para o Header para facilitar acesso */}
      <button onClick={logOut} className="link-logout">
        <FiLogOut color="#FFF" size={24} />
        Sair
      </button>
    </div>
  )
}
