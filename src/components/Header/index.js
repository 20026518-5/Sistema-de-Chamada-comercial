/* src/components/Header/index.js */
import { useContext } from 'react';
import './header.css';
import { AuthContext } from '../../contexts/auth';
import { ThemeContext } from '../../contexts/ThemeContext'; // Importe o contexto
import { Link } from 'react-router-dom';
import { FiHome, FiUser, FiSettings, FiLogOut, FiSun, FiMoon } from "react-icons/fi";
import avatarImg from '../../assets/avatar.png';

export default function Header(){
  const { user, signOut } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext); // Use o contexto de tema

  return(
    <div className="sidebar">
      <div>
        <img src={user.avatarUrl === null ? avatarImg : user.avatarUrl} alt="Foto do usuario" />
      </div>

      <Link to="/dashboard">
        <FiHome color="#FFF" size={24} />
        <span>Dashboard</span>
      </Link>

      <Link to="/customers">
        <FiUser color="#FFF" size={24} />
        <span>Clientes</span>
      </Link>

      <Link to="/profile">
        <FiSettings color="#FFF" size={24} />
        <span>Perfil</span>
      </Link>
      
      {/* --- SELETOR DE TEMA (Barra Suspensa / Dropdown Simples) --- */}
      <div className="theme-selector" style={{ padding: '16px', marginTop: 'auto' }}>
        <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>
          Tema
        </label>
        <select 
          value={theme} 
          onChange={(e) => toggleTheme(e.target.value)}
          style={{
            width: '100%',
            padding: '5px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#2b2b2b',
            color: '#FFF',
            cursor: 'pointer'
          }}
        >
          <option value="light">Claro ☀️</option>
          <option value="dark">Escuro 🌙</option>
        </select>
      </div>

      <button onClick={() => signOut()} className="sidebar-logout">
        <FiLogOut color="#FFF" size={24} />
        <span>Sair</span>
      </button>

    </div>
  )
}
