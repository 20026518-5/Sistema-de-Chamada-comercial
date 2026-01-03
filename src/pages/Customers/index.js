import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/auth';
import { db } from '../../services/firebaseConnection';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiUsers, FiSearch, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Servidores() {
  const { user } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState([]);
  const [listaSetores, setListaSetores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados dos Filtros
  const [buscaNome, setBuscaNome] = useState('');
  const [filtroSecretaria, setFiltroSecretaria] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');

  // Estado de Edição
  const [editandoId, setEditandoId] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editSec, setEditSec] = useState('');
  const [editDep, setEditDep] = useState('');

  // Bloqueio de segurança: Se não for ADM, não renderiza a página
  if (!user.isadm) {
    return (
      <div>
        <Header />
        <div className="content">
          <div className="container">
            <span>Acesso negado. Apenas administradores podem ver esta página.</span>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    async function loadDados() {
      try {
        // Busca Usuários
        const userSnapshot = await getDocs(collection(db, 'users'));
        let listUsers = [];
        userSnapshot.forEach((doc) => {
          listUsers.push({ id: doc.id, ...doc.data() });
        });
        setUsuarios(listUsers);

        // Busca Setores para os filtros (igual ao SignUp)
        const setorSnapshot = await getDocs(collection(db, 'setores'));
        let listSetores = [];
        setorSnapshot.forEach((doc) => {
          listSetores.push({ id: doc.id, ...doc.data() });
        });
        setListaSetores(listSetores);

      } catch (error) {
        console.log(error);
        toast.error("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    }
    loadDados();
  }, []);

  async function handleSaveEdit(id) {
    if(!editNome || !editSec || !editDep) return toast.warning("Preencha todos os campos.");
    try {
      await updateDoc(doc(db, 'users', id), {
        nome: editNome,
        secretaria: editSec,
        departamento: editDep
      });
      toast.success("Servidor atualizado!");
      
      // Atualiza a lista local
      setUsuarios(usuarios.map(u => u.id === id ? { ...u, nome: editNome, secretaria: editSec, departamento: editDep } : u));
      setEditandoId(null);
    } catch (error) {
      toast.error("Erro ao atualizar.");
    }
  }

  const secretariasUnicas = [...new Set(listaSetores.map(s => s.secretaria))];

  // Lógica de Filtragem em Tempo Real
  const usuariosFiltrados = usuarios.filter(u => {
    return (
      u.nome.toLowerCase().includes(buscaNome.toLowerCase()) &&
      (filtroSecretaria === '' || u.secretaria === filtroSecretaria) &&
      (filtroDepartamento === '' || u.departamento === filtroDepartamento)
    );
  });

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Consulta de Servidores">
          <FiUsers size={25} />
        </Title>

        {/* --- BLOCO DE PESQUISA E FILTROS --- */}
        <div className="container">
          <div className="form-profile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <label>Pesquisar por Nome</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input 
                  type="text" 
                  placeholder="Nome do servidor..." 
                  value={buscaNome}
                  onChange={(e) => setBuscaNome(e.target.value)}
                  style={{ marginBottom: 0 }}
                />
              </div>
            </div>

            <div>
              <label>Filtrar Secretaria</label>
              <select value={filtroSecretaria} onChange={(e) => { setFiltroSecretaria(e.target.value); setFiltroDepartamento(''); }}>
                <option value="">Todas as Secretarias</option>
                {secretariasUnicas.map(sec => <option key={sec} value={sec}>{sec}</option>)}
              </select>
            </div>

            <div>
              <label>Filtrar Departamento</label>
              <select 
                value={filtroDepartamento} 
                onChange={(e) => setFiltroDepartamento(e.target.value)}
                disabled={!filtroSecretaria}
              >
                <option value="">Todos os Departamentos</option>
                {listaSetores
                  .filter(s => s.secretaria === filtroSecretaria)
                  .map(item => <option key={item.id} value={item.departamento}>{item.departamento}</option>)
                }
              </select>
            </div>
          </div>
        </div>

        {/* --- LISTAGEM DE RESULTADOS --- */}
        <div className="container">
          {loading ? (
            <span>Carregando servidores...</span>
          ) : (
            <table>
              <thead>
                <tr>
                  <th scope="col">Nome</th>
                  <th scope="col">Secretaria</th>
                  <th scope="col">Departamento</th>
                  <th scope="col" style={{ width: '100px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Nome">
                      {editandoId === item.id ? (
                        <input type="text" value={editNome} onChange={(e) => setEditNome(e.target.value)} style={{ marginBottom: 0 }} />
                      ) : item.nome}
                    </td>
                    <td data-label="Secretaria">
                      {editandoId === item.id ? (
                        <select value={editSec} onChange={(e) => { setEditSec(e.target.value); setEditDep(''); }}>
                          {secretariasUnicas.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                        </select>
                      ) : item.secretaria}
                    </td>
                    <td data-label="Departamento">
                      {editandoId === item.id ? (
                        <select value={editDep} onChange={(e) => setEditDep(e.target.value)}>
                          {listaSetores.filter(s => s.secretaria === editSec).map(s => (
                            <option key={s.id} value={s.departamento}>{s.departamento}</option>
                          ))}
                        </select>
                      ) : item.departamento}
                    </td>
                    <td data-label="Ações">
                      {editandoId === item.id ? (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button className="action" style={{ backgroundColor: '#1fcc44' }} onClick={() => handleSaveEdit(item.id)}><FiCheck size={15} color="#FFF" /></button>
                          <button className="action" style={{ backgroundColor: '#999' }} onClick={() => setEditandoId(null)}><FiX size={15} color="#FFF" /></button>
                        </div>
                      ) : (
                        <button 
                          className="action" 
                          style={{ backgroundColor: '#F6A935' }}
                          onClick={() => {
                            setEditandoId(item.id);
                            setEditNome(item.nome);
                            setEditSec(item.secretaria);
                            setEditDep(item.departamento);
                          }}
                        >
                          <FiEdit2 size={15} color="#FFF" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
