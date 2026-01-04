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

  useEffect(() => {
    async function loadChamados() {
      try {
        let q;
        if (!user?.isadm) {
          q = query(listRef, where('userId', '==', user.uid), orderBy('created', 'desc'), limit(5));
        } else {
          q = query(listRef, orderBy('created', 'desc'), limit(5));
        }

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

    if (user) loadChamados();
  }, [user]);

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
    let q;
    if (!user.isadm) {
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
      
        {!user.isadm && (
          <Link to='/new' className="new">
            <FiPlus size={25} color='#fff'/>
            Novo chamado
          </Link>
        )}
      
        {chamados.length === 0 ? (
          <div className="container dashboard"><span>Nenhum chamado registrado...</span></div>
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
                      {/* Corrigido: Status 'atendido' ou 'Em progresso' com cor cinza mais legível em temas escuros */}
                      <span className="badge" style={{backgroundColor: item.status === 'Em aberto' ? '#5CB85C' : '#999'}}>
                        {item.status}
                      </span>
                    </td>
                    <td data-label='Data'>{item.createdFormat}</td>
                    <td data-label='Ações'>
                      <button onClick={() => toggleModal(item)} className="action" style={{backgroundColor:'#3583f6'}}><FiSearch size={17} color='#fff' /></button>
                      <Link className="action" style={{backgroundColor:'#f6a935'}} to={`/new/${item.id}`}><FiEdit2 size={17} color='#fff'/></Link>
                      <button onClick={() => handleDelete(item)} className="action" style={{backgroundColor:'#FD441B'}}><FiDelete size={17} color='#fff' /></button>
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
