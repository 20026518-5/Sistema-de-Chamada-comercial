import { useEffect, useState, useContext } from "react"
import Header from "../../components/Header";
import Title from "../../components/Title";
import { FiDelete, FiEdit2, FiMessageSquare, FiPlus, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import './dashboard.css';
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query, startAfter, where } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { format } from "date-fns";
import Modal from "../../components/Modal";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";
import { AuthContext } from "../../contexts/auth";

const listRef = collection(db, 'chamados');

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [loadMore, setLoadMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [details, setDetails] = useState({});

  // Novos estados para Filtros de Admin
  const [filtroSecretaria, setFiltroSecretaria] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [listaSecretarias, setListaSecretarias] = useState([]);

  useEffect(() => {
    // Carrega a lista de secretarias disponíveis para o filtro do Admin
    async function loadFiltros() {
      const setoresRef = collection(db, 'setores');
      const snapshot = await getDocs(setoresRef);
      let lista = [];
      snapshot.forEach((doc) => {
        lista.push(doc.data().secretaria);
      });
      // Remove duplicatas
      setListaSecretarias([...new Set(lista)]);
    }

    async function loadChamados() {
      try {
        let q = listRef;

        if (!user?.isadm) {
          // Usuário comum vê apenas seus chamados
          q = query(q, where('userId', '==', user.uid));
        }

        q = query(q, orderBy('created', 'desc'), limit(5));

        const querySnapshot = await getDocs(q);
        setChamados([]); 
        await updateState(querySnapshot);
      } catch (error) {
        console.log("ERRO:", error);
        toast.error("Erro ao carregar chamados.");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadChamados();
      if(user.isadm) loadFiltros();
    }
  }, [user]);

  // Função para aplicar os filtros de busca (Admin)
  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setChamados([]);
    setIsEmpty(false);
    
    try {
      let q = listRef;

      if (!user?.isadm) {
        q = query(q, where('userId', '==', user.uid));
      } else {
        // Aplica filtros se existirem
        if (filtroSecretaria !== '') {
          q = query(q, where('secretaria', '==', filtroSecretaria));
        }
        if (filtroStatus !== '') {
          q = query(q, where('status', '==', filtroStatus));
        }
      }

      q = query(q, orderBy('created', 'desc'), limit(5));

      const querySnapshot = await getDocs(q);
      await updateState(querySnapshot);

    } catch (error) {
      console.log(error);
      toast.error("Erro ao filtrar chamados.");
    } finally {
      setLoading(false);
    }
  }

  const updateState = async (querySnapshot) => {
    const isCollectionEmpty = (querySnapshot.size === 0);
    if(!isCollectionEmpty){
      let list = [];
      querySnapshot.forEach((doc)=>{
        const data = doc.data();
        list.push({
          id: doc.id,
          ...data,
          createdFormat: data.created ? format(data.created.toDate(), 'dd/MM/yyyy') : '---',
          // Prepara data de atualização para auditoria se existir
          updatedFormat: data.updatedAt ? format(data.updatedAt.toDate(), 'dd/MM/yyyy HH:mm') : null
        })
      })
      setChamados((chamados) => [...chamados, ...list]);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } else {
      setIsEmpty(true);
    }
    setLoadMore(false);
  }

  const handleMore = async () => {
    setLoadMore(true);
    let q = listRef;
    
    if (!user.isadm) {
      q = query(q, where('userId', '==', user.uid));
    } else {
      if (filtroSecretaria !== '') q = query(q, where('secretaria', '==', filtroSecretaria));
      if (filtroStatus !== '') q = query(q, where('status', '==', filtroStatus));
    }

    q = query(q, orderBy('created','desc'), startAfter(lastDoc), limit(5));
    
    const querySnapshot = await getDocs(q);
    await updateState(querySnapshot);
  }

  const toggleModal = (item) => {
    setShowModal(!showModal);
    setDetails(item);
  }

  const handleDelete = async (item) => {
    const diferencaMinutos = (new Date() - item.created.toDate()) / (1000 * 60);
    if (!user.isadm && diferencaMinutos > 15) {
      toast.error('O prazo de 15 minutos expirou.');
      return;
    }

    await deleteDoc(doc(db, 'chamados', item.id))
    .then(() => {
      toast.success('Deletado!');
      setChamados(chamados.filter(c => c.id !== item.id));
    })
    .catch(() => toast.error('Erro ao deletar.'));
  }

  if (loading) return <div className="container dashboard"><Loading size={40} color="#121212" /></div>;

  return (
    <div>
      <Header />
      <div className='content'>
        <Title name='Chamados'><FiMessageSquare size={25}/></Title>
      
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', marginBottom: '1.5em' }}>
          
          {/* BLOCO DE FILTROS (Apenas para Admin) */}
          {user.isadm ? (
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '300px' }}>
              <select 
                value={filtroSecretaria} 
                onChange={(e) => setFiltroSecretaria(e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--container-bg)', color: 'var(--text-color)' }}
              >
                <option value="">Todas Secretarias</option>
                {listaSecretarias.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>

              <select 
                value={filtroStatus} 
                onChange={(e) => setFiltroStatus(e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--container-bg)', color: 'var(--text-color)' }}
              >
                <option value="">Todos Status</option>
                <option value="Em aberto">Em aberto</option>
                <option value="Em progresso">Em progresso</option>
                <option value="atendido">Atendido</option>
              </select>

              <button type="submit" style={{ backgroundColor: 'var(--sidebar-bg)', color: '#FFF', border: 0, padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
                <FiSearch size={18} />
              </button>
            </form>
          ) : (
            <div></div> /* Espaçador para manter o botão "Novo chamado" à direita */
          )}

          {!user.isadm && (
            <Link to='/new' className="new" style={{ margin: 0 }}>
              <FiPlus size={25} color='#fff'/>
              Novo chamado
            </Link>
          )}
        </div>
      
        {chamados.length === 0 ? (
          <div className="container dashboard"><span>Nenhum chamado encontrado...</span></div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th scope="col">Cliente</th>
                  {user.isadm && (
                    <>
                      <th scope="col">Solicitante</th>
                      <th scope="col">Setor</th>
                    </>
                  )}
                  <th scope="col">Assunto</th>
                  <th scope="col">Status</th>
                  <th scope="col">Data</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>         
                { chamados.map((item, index) => (
                  <tr key={index}>
                    <td data-label='Cliente'>{item.cliente}</td>
                    {user.isadm && (
                      <>
                        <td data-label='Solicitante'>{item.userName}</td>
                        <td data-label='Setor'>{item.secretaria} / {item.departamento}</td>
                      </>
                    )}
                    <td data-label='Assunto'>{item.assunto}</td>
                    <td data-label='Status'>
                      <span className="badge" style={{backgroundColor: item.status === 'Em aberto' ? '#5CB85C' : '#999'}}>
                        {item.status}
                      </span>
                    </td>
                    <td data-label='Data'>{item.createdFormat}</td>
                    <td data-label='Ações'>
                      <button onClick={() => toggleModal(item)} className="action" style={{backgroundColor:'#3583f6'}} title="Visualizar Detalhes"><FiSearch size={17} color='#fff' /></button>
                      <Link className="action" style={{backgroundColor:'#f6a935'}} to={`/new/${item.id}`} title="Editar Chamado"><FiEdit2 size={17} color='#fff'/></Link>
                      <button onClick={() => handleDelete(item)} className="action" style={{backgroundColor:'#FD441B'}} title="Excluir Chamado"><FiDelete size={17} color='#fff' /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isEmpty && !loadMore && <button onClick={handleMore} className='btn-more'>Buscar mais</button>}
          </>
        )}
      </div>
      {showModal && <Modal conteudo={details} buttomBack={() => setShowModal(!showModal)} />}
    </div>
  )
}
