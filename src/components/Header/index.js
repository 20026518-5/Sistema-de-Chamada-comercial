import { useContext } from 'react';
import { AuthContext } from '../../contexts/auth';
import { Link } from 'react-router-dom';
import { FiHome, FiUser, FiSettings, FiLogOut, FiUsers, FiBriefcase } from "react-icons/fi";
import avatar from '../../assets/avatar.png';
import './header.css';

export default function Header(){
  const { user, logout } = useContext(AuthContext);

  return(
    <div className="sidebar">
      <div>
        <img src={user.avatarUrl === null ? avatar : user.avatarUrl} alt="Foto avatar" />
      </div>

      <Link to="/dashboard">
        <FiHome color="#FFF" size={24} />
        Chamados
      </Link>

      {/* Opções exclusivas para Administradores */}
      {user.isadm && (
        <>
          <Link to="/customers">
            <FiBriefcase color="#FFF" size={24} />
            Secretarias
          </Link>

          <Link to="/servidores">
            <FiUsers color="#FFF" size={24} />
            Servidores
          </Link>
        </>
      )}

      <Link to="/profile">
        <FiSettings color="#FFF" size={24} />
        Perfil
      </Link>

      {/* Botão de Sair */}
      <button onClick={() => logout()} className="sidebar-logout">
        <FiLogOut color="#FFF" size={24} />
        Sair
      </button>
    </div>
  )
}
