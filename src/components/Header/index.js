import { useContext } from 'react';
import avatarImg from '../../assets/avatar.png';   
import { AuthContext } from '../../contexts/auth';
import { FiHome, FiSettings, FiUser, FiLogOut, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './header.css';

export default function Header() {
  const { user, logout } = useContext(AuthContext); 

  return (
    <div className='sidebar'>
      <div>
        <img src={user.avatarUrl === null ? avatarImg : user.avatarUrl} alt='foto do usuario' />
      </div>
      
      <Link to='/dashboard'>
        <FiHome color='#fff' size={24} />
        Chamados
      </Link>

      <Link to='/customers'>
        <FiUsers color='#fff' size={24} />
        Clientes
      </Link>

      <Link to='/profile'>
        <FiUser color='#fff' size={24} />
        Perfil
      </Link>

      {user.isadm && (
        <Link to='/settings'>
          <FiSettings color='#fff' size={24} />
          Secretarias
        </Link>
      )}

      {/* Classe renomeada para evitar conflito com o CSS do Perfil */}
      <button onClick={ () => logout() } className="sidebar-logout">
        <FiLogOut color='#fff' size={24} />
        <span>Sair</span>
      </button>
    </div>
  )
}
