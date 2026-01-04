import { useContext } from 'react';
import avatarImg from '../../assets/avatar.png';   
import { AuthContext } from '../../contexts/auth';
import { FiHome, FiSettings, FiUser, FiLogOut, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './header.css';

export default function Header() {
  // Alterado de logOut para logout (minúsculo) para coincidir com o AuthContext
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

      <Link to='/servidores'>
        <FiUsers color='#fff' size={24} />
        Servidores
      </Link>

      <Link to='/profile'>
        <FiUser color='#fff' size={24} />
        Perfil
      </Link>

      {/* Aba de Secretarias visível apenas para Admin */}
      {user.isadm && (
        <Link to='/settings'>
          <FiSettings color='#fff' size={24} />
          Secretarias
        </Link>
      )}

      {/* Botão de Sair corrigido para chamar a função correta */}
      <button onClick={ () => logout() } className="logout-btn">
        <FiLogOut color='#fff' size={24} />
        <span>Sair</span>
      </button>
    </div>
  )
}
