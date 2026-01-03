import { useContext } from 'react';
import avatarImg from '../../assets/avatar.png';   
import { AuthContext } from '../../contexts/auth';
import { FiHome, FiSettings, FiUser, FiLogOut, FiUsers } from 'react-icons/fi'; // Importação corrigida
import { Link } from 'react-router-dom';
import './header.css';

export default function Header() {
  const { user, logOut } = useContext(AuthContext);

  return (
    <div className='sidebar'>
      <div>
        <img src={user.avatarUrl === null ? avatarImg : user.avatarUrl} alt='foto do usuario' />
      </div>
      
      {/* 1. Chamados */}
      <Link to='/dashboard'>
        <FiHome color='#fff' size={24} />
        Chamados
      </Link>

      {/* 2. Servidores (Ajustado conforme sua solicitação anterior) */}
      <Link to='/servidores'>
        <FiUsers color='#fff' size={24} />
        Servidores
      </Link>

      {/* 3. Perfil (Usando ícone de usuário para evitar confusão) */}
      <Link to='/profile'>
        <FiUser color='#fff' size={24} />
        Perfil
      </Link>

      {/* 4. Configurações de Setores (Apenas para Admin) */}
      {user.isadm && (
        <Link to='/settings'>
          <FiSettings color='#fff' size={24} />
          Configurações
        </Link>
      )}

      {/* 5. Botão de Sair */}
      <button onClick={() => logOut()} className="logout-btn" style={{ background: 'transparent', border: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <FiLogOut color='#fff' size={24} />
        <span style={{ color: '#FFF', marginLeft: '0.7em', fontSize: '1.1em' }}>Sair</span>
      </button>
    </div>
  )
}
