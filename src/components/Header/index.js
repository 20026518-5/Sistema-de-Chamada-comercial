import { useContext } from 'react';
import './header.css';
import { AuthContext } from '../../contexts/auth';
import { ThemeContext } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { FiHome, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import avatarImg from '../../assets/avatar.png';

export default function Header(){
  // CORREÇÃO: Mudamos de 'signOut' para 'logout' para bater com o AuthContext
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

        <Link to="/customers">
          <FiUser color="#FFF" size={24} />
          <span>Secretarias</span>
        </Link>

        <Link to="/profile">
          <FiSettings color="#FFF" size={24} />
          <span>Perfil</span>
        </Link>

        {/* CORREÇÃO: Aqui chamamos a função logout() */}
        <button onClick={() => logout()} className="sidebar-logout">
          <FiLogOut color="#FFF" size={24} />
          <span>Sair</span>
        </button>
      </div>

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
