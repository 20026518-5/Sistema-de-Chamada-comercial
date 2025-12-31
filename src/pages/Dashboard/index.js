import { useEffect, useState, useContext } from "react"
import Header from "../../components/Header";
import Title from "../../components/Title";
import { FiDelete, FiEdit2, FiMessageSquare, FiPlus, FiSearch} from "react-icons/fi";
import { Link } from "react-router-dom";
import './dashboard.css';
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query, startAfter, where } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { format } from "date-fns";
import Modal from "../../components/Modal";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";
import { AuthContext } from "../../contexts/auth";

const listRef = collection(db,'chamados');

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [loadMore, setLoadMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [details, setDetails] = useState({});

  useEffect(() => {
    async function loadChamados() {
      try {
        let q;
        // Filtra por usuário se não for admin
        if (user?.role !== 'admin') {
          q = query(listRef, where('userId', '==', user.uid), orderBy('created', 'desc'), limit(5));
        } else {
          q = query(listRef, orderBy('created', 'desc'), limit(5));
        }

        const querySnapshot = await getDocs(q);
        setChamados([]); 
        await updateState(querySnapshot);
      } catch (error) {
        console.log("ERRO AO BUSCAR CHAMADOS: ", error);
        toast.error("Erro ao carregar os chamados.");
      } finally {
        setLoading(false);
      }
    }

    if (user) loadChamados();
  }, [user]);

  const updateState = async (querySnapshot) => {
    const isCollectionEmpty = (querySnapshot.size === 0);
    if(!isCollectionEmpty){
      let list = [];
      querySnapshot.forEach((doc)=>{
        list.push({
          id: doc.id,
          ...doc.data(),
          createdFormat: format(doc.data().created.toDate(), 'dd/MM/yyyy'),
        })
      })
      setChamados((chamados) => [...chamados, ...list]);
      const lastItem = querySnapshot.docs[querySnapshot.docs.length -1];
      setLastDoc(lastItem);
    } else {
      setIsEmpty(true);
    }
    setLoadMore(false);
  }

  const handleMore = async () => {
    setLoadMore(true);
    let q;
    if (user?.role !== 'admin') {
      q = query(listRef, where('userId', '==', user.uid), orderBy('created','desc'), startAfter(lastDoc), limit(5));
    } else {
      q = query(listRef, orderBy('created','desc'), startAfter(lastDoc), limit(5));
    }
    const querySnapshot = await getDocs(q);
    await updateState(querySnapshot);
  }

  const toggleModal = (item) => {
    setShowModal(!showModal);
    setDetails(item);
  }

  // APENAS UMA DECLARAÇÃO DE handleDelete
  const handleDelete = async (item) => {
    const agora = new Date();
    const dataCriacao = item.created.toDate();
    const diferencaMinutos = (agora - dataCriacao) / (1000 * 60);

    // Regra: usuário comum só apaga em 15min. Admin TI apaga sempre.
    if (user.role !== 'admin' && diferencaMinutos > 15) {
      toast.error('O prazo de 15 minutos para exclusão expirou.');
      return;
    }

    const docRef = doc(db, 'chamados', item.id)
    await deleteDoc(docRef)
    .then(() => {
      toast.success('Item deletado com sucesso');
      setChamados(chamados.filter(c => c.id !== item.id));
    })
    .catch(() => toast.error('Ops, erro ao deletar'))
  }

  if (loading) {
    return (
      <div className="container dashboard">
        <Loading size={40} color="#121212" />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className='content'>
        <Title name='Chamados'>
          <FiMessageSquare size={25}/> 
        </Title>
      
        {user.role !== 'admin' && (
          <Link to='/new' className="new">
            <FiPlus size={25} color='#fff'/>
            Novo chamado
          </Link>
        )}
      
        {chamados.length === 0 ? (
          <div className="container dashboard" >
            <span>Nenhum chamado registrado...</span>
          </div>
        ) : (
          <>
            <table>
  <thead>
    <tr>
      <th scope="col">Cliente</th>
      {/* 1. NOVAS COLUNAS PARA O ADMIN */}
      {user.role === 'admin' && (
        <>
          <th scope="col">Usuário</th>
          <th scope="col">Secretaria</th>
          <th scope="col">Departamento</th>
        </>
      )}
      <th scope="col">Assunto</th>
      <th scope="col">Status</th>
      <th scope="col">Cadastrado em</th>
      <th scope="col">#</th>
    </tr>
  </thead>
  <tbody>         
    { chamados.map((item, index) => (
      <tr key={index}>
        <td data-label='Cliente'>{item.cliente}</td>
        
        {/* 2. EXIBIR DADOS DO SOLICITANTE PARA O ADMIN */}
        {user.role === 'admin' && (
          <>
            <td data-label='Usuário'>{item.userName}</td>
            <td data-label='Secretaria'>{item.secretaria}</td>
            <td data-label='Departamento'>{item.departamento}</td>
          </>
        )}

        <td data-label='Assunto'>{item.assunto}</td>
        <td data-label='Status'>
          <span className="badge" style={{backgroundColor: item.status === 'Em aberto' ? '#5CB85C' : '#ccc'}}>
            {item.status}
          </span>
        </td>
        <td data-label='Cadastrado'>{item.createdFormat}</td>
        <td data-label='#'>
          <button onClick={() => toggleModal(item)} className="action" style={{backgroundColor:'#3583f6'}}>
            <FiSearch size={17} color='#fff' />
          </button>

          {/* 3. REMOVIDA A TRAVA QUE IMPEDIA O ADMIN DE EDITAR */}
          <Link className="action" style={{backgroundColor:'#f6a935'}} to={`/new/${item.id}`}>
            <FiEdit2 size={17} color='#fff'/>
          </Link>

          <button onClick={() => handleDelete(item)} className="action" style={{backgroundColor:'#FD441B'}}>
            <FiDelete size={17} color='#fff' />
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

            {loadMore && (
              <div style={{ marginTop: 15 }}>
                <Loading size={20} color="#121212" />
              </div>
            )}
            {!isEmpty && !loadMore && 
              <button onClick={handleMore} className='btn-more'>Buscar mais</button>
            }
          </>
        )}
      </div>
      {showModal && (
        <Modal 
          conteudo={details}
          buttomBack={() => setShowModal(!showModal)} 
        />
      )}
    </div>
  )
}
