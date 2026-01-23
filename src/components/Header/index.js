import { useContext } from 'react';
import './header.css';
import { AuthContext } from '../../contexts/auth';
import { ThemeContext } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { FiHome, FiUser, FiUsers, FiSettings, FiLogOut } from "react-icons/fi"; // <--- Importe FiUsers
import avatarImg from '../../assets/avatar.png';

export default function Header(){
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  return(
    <>
      <div className="sidebar">
        <div>
          <img src={user.avatarUrl === null ? avatarImg : user.avatarUrl} alt="Foto do usuario" />
        </div>

        <Link to="/dashboard">
          <FiHome color="#FFF" size={24} />
          <span>Dashboard</span>
        </Link>

        {/* Botão para Secretarias */}
        <Link to="/customers">
          <FiUser color="#FFF" size={24} />
          <span>Secretarias</span>
        </Link>

        {/* --- NOVO BOTÃO: SERVIDORES --- */}
        <Link to="/servidores">
          <FiUsers color="#FFF" size={24} />
          <span>Servidores</span>
        </Link>

        <Link to="/profile">
          <FiSettings color="#FFF" size={24} />
          <span>Perfil</span>
        </Link>

        <button onClick={() => logout()} className="sidebar-logout">
          <FiLogOut color="#FFF" size={24} />
          <span>Sair</span>
        </button>
      </div>

      {/* Seletor de Tema Flutuante */}
      <div className="theme-floater">
        <label>Tema: </label>
        <select 
          value={theme} 
          onChange={(e) => toggleTheme(e.target.value)}
        >
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
        </select>
      </div>
    </>
  )
}
