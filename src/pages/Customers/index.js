import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/auth';
import { db } from '../../services/firebaseConnection';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiUsers, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import '../Profile/profile.css';

export default function Servidores() {
  const { user } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState([]);
  const [listaSetores, setListaSetores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [buscaNome, setBuscaNome] = useState('');
  const [filtroSecretaria, setFiltroSecretaria] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');

  // Edição
  const [editandoId, setEditandoId] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editSec, setEditSec] = useState('');
  const [editDep, setEditDep] = useState('');

  useEffect(() => {
    async function loadDados() {
      try {
        const userSnapshot = await getDocs(collection(db, 'users'));
        let listUsers = [];
        userSnapshot.forEach((doc) => {
          listUsers.push({ id: doc.id, ...doc.data() });
        });
        setUsuarios(listUsers);

        const setorSnapshot = await getDocs(collection(db, 'setores'));
        let listSetores = [];
        setorSnapshot.forEach((doc) => {
          listSetores.push({ id: doc.id, ...doc.data() });
        });
        setListaSetores(listSetores);
      } catch (error) {
        toast.error("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    }
    loadDados();
  }, []);

  async function handleSaveEdit(id) {
    try {
      await updateDoc(doc(db, 'users', id), {
        nome: editNome,
        secretaria: editSec,
        departamento: editDep
      });
      toast.success("Dados atualizados!");
      setUsuarios(usuarios.map(u => u.id === id ? { ...u, nome: editNome, secretaria: editSec, departamento: editDep } : u));
      setEditandoId(null);
    } catch (error) {
      toast.error("Erro ao salvar.");
    }
  }

  if (!user.isadm) {
    return (
      <div>
        <Header />
        <div className="content">
          <div className="container">
            <span>Acesso restrito a administradores.</span>
          </div>
        </div>
      </div>
    );
  }

  const secretariasUnicas = [...new Set(listaSetores.map(s => s.secretaria))];
  const usuariosFiltrados = usuarios.filter(u => {
    return u.nome.toLowerCase().includes(buscaNome.toLowerCase()) &&
           (filtroSecretaria === '' || u.secretaria === filtroSecretaria) &&
           (filtroDepartamento === '' || u.departamento === filtroDepartamento);
  });

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Consulta de Servidores"><FiUsers size={25} /></Title>

        <div className="container">
          <div className="form-profile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <label>Nome</label>
              <input 
                type="text" 
                placeholder="Pesquisar servidor..." 
                value={buscaNome} 
                onChange={(e) => setBuscaNome(e.target.value)} 
              />
            </div>
            <div>
              <label>Secretaria</label>
              <select 
                value={filtroSecretaria} 
                onChange={(e) => { setFiltroSecretaria(e.target.value); setFiltroDepartamento(''); }}
              >
                <option value="">Todas</option>
                {secretariasUnicas.map(sec => <option key={sec} value={sec}>{sec}</option>)}
              </select>
            </div>
            <div>
              <label>Departamento</label>
              <select 
                value={filtroDepartamento} 
                onChange={(e) => setFiltroDepartamento(e.target.value)} 
                disabled={!filtroSecretaria}
              >
                <option value="">Todos</option>
                {listaSetores.filter(s => s.secretaria === filtroSecretaria).map(item => <option key={item.id} value={item.departamento}>{item.departamento}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="container">
          {loading ? <span>Carregando...</span> : (
            <div className="painel-grid">
              {usuariosFiltrados.map((item) => (
                <div key={item.id} className="painel-item">
                  
                  {/* Campo Nome */}
                  <div className="painel-linha">
                    <label>Nome:</label>
                    {editandoId === item.id ? (
                      <input 
                        type="text" 
                        value={editNome} 
                        onChange={(e) => setEditNome(e.target.value)} 
                      />
                    ) : (
                      <span>{item.nome}</span>
                    )}
                  </div>

                  {/* Campo Secretaria */}
                  <div className="painel-linha">
                    <label>Secretaria:</label>
                    {editandoId === item.id ? (
                      <select value={editSec} onChange={(e) => { setEditSec(e.target.value); setEditDep(''); }}>
                        {secretariasUnicas.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                      </select>
                    ) : (
                      <span>{item.secretaria}</span>
                    )}
                  </div>

                  {/* Campo Departamento */}
                  <div className="painel-linha">
                    <label>Departamento:</label>
                    {editandoId === item.id ? (
                      <select value={editDep} onChange={(e) => setEditDep(e.target.value)}>
                        {listaSetores.filter(s => s.secretaria === editSec).map(s => <option key={s.id} value={s.departamento}>{s.departamento}</option>)}
                      </select>
                    ) : (
                      <span>{item.departamento}</span>
                    )}
                  </div>

                  {/* Botões de Ação */}
                  <div className="painel-actions">
                    {editandoId === item.id ? (
                      <>
                        <button className="action" style={{ backgroundColor: '#1fcc44' }} onClick={() => handleSaveEdit(item.id)}>
                          <FiCheck size={20} color="#FFF" />
                        </button>
                        <button className="action" style={{ backgroundColor: '#999' }} onClick={() => setEditandoId(null)}>
                          <FiX size={20} color="#FFF" />
                        </button>
                      </>
                    ) : (
                      <button className="action" style={{ backgroundColor: '#F6A935' }} onClick={() => { setEditandoId(item.id); setEditNome(item.nome); setEditSec(item.secretaria); setEditDep(item.departamento); }}>
                        <FiEdit2 size={20} color="#FFF" />
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
