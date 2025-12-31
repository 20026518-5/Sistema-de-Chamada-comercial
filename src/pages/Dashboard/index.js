import { useEffect, useState } from "react"
import Header from "../../components/Header";

import Title from "../../components/Title";
import { FiDelete, FiEdit2, FiMessageSquare, FiPlus, FiSearch} from "react-icons/fi";
import { Link } from "react-router-dom";
import './dashboard.css';
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query, startAfter } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { format } from "date-fns/esm";
import Modal from "../../components/Modal";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";


const listRef = collection(db,'chamados');

export default  function Dashboard() {
  const [chamados,setChamados] = useState([]);
  const [loading,setLoading] = useState(true);
  const [isEmpty,setIsEmpty] = useState(false);
  const [loadMore,setLoadMore] = useState(false);
  const [lastDoc,setLastDoc] = useState([]);
  const [showModal,setShowModal] = useState(false);
  const [details,setDetails] = useState({});

// Na busca inicial dentro do useEffect
async function loadChamados() {
  try {
    let q;
    // Se não for admin, filtra apenas os chamados criados pelo usuário logado
    if (user.role !== 'admin') {
      q = query(listRef, 
                where('userId', '==', user.uid), 
                orderBy('created', 'desc'), 
                limit(5));
    } else {
      q = query(listRef, orderBy('created', 'desc'), limit(5));
    }
    // ... restante do carregamento
  } catch (error) { /* ... */ }
}

const handleDelete = async (item) => {
  const agora = new Date();
  const dataCriacao = item.created.toDate();
  const diferencaMinutos = (agora - dataCriacao) / (1000 * 60);

  // Regra: Usuário comum só apaga em 15 min. Admin TI apaga sempre.
  if (user.role !== 'admin' && diferencaMinutos > 15) {
    toast.error('O prazo de 15 minutos para exclusão expirou. Apenas o TI pode remover.');
    return;
  }

  const docRef = doc(db, 'chamados', item.id);
  await deleteDoc(docRef)
    .then(() => toast.success('Chamado deletado com sucesso'))
    .catch(() => toast.error('Ops, erro ao deletar'));
};

  const updateState = async (querySnapshot) =>{ //preenche a useState=chamados
    const isCollectionEmpty = (querySnapshot.size === 0);
    if(!isCollectionEmpty){
      let list = [];

      querySnapshot.forEach((doc)=>{
        list.push({
          id:doc.id,
          cliente:doc.data().cliente,
          clienteId:doc.data().clienteId,
          assunto:doc.data().assunto,
          status:doc.data().status,
          created:doc.data().created,
          createdFormat:format(doc.data().created.toDate(),'dd/MM/yyyy'),
          complemento:doc.data().complemento,
        })
      })
      setChamados((chamado)=>[...chamado,...list]);

      const lastItem = querySnapshot.docs[querySnapshot.docs.length -1];
      setLastDoc(lastItem);
    }else{
      setIsEmpty(true);
    }
    setLoadMore(false);
    
  }

  const handleMore = async () =>{
    setLoadMore(true);

    const q = query(listRef,orderBy('created','desc'),startAfter(lastDoc),limit(5));
    const querySnapshot = await getDocs(q);
    await updateState(querySnapshot);
  }

  const toggleModal = (item) =>{
    setShowModal(!showModal);
    console.log(item);
    setDetails(item);
  }

  const handleDelete = async (id) =>{
    const docRef = doc(db,'chamados',id)
    await deleteDoc(docRef)
    .then(()=>{
      toast.success('item deletado com sucesso')
    })
    .catch(()=>toast.error('Ops,erro ao deletar'))
  }

  if (loading) {
  return (
    <div className="container dashboard">
      <Loading size={40} color="#121212" />
    </div>
  );
}

  return (
    
    <div >
      <Header />
      <div className='content'>
        <Title name='Chamados'>
          <FiMessageSquare size={25}/> 
        </Title>
      
      
      
      {chamados.length === 0 ? 
      (
        <div className="container dashboard" >
          <span>Nenhum chamado registrado...</span>
          
          <Link to='/new' className="new">
            <FiPlus size={25}color='#fff'/>
            Novo chamado
          </Link>
          
        </div>
      ) 
      :
      (
          
        <>
        <Link to='/new' className="new">
          <FiPlus size={25}color='#fff'/>
          Novo chamado
        </Link>
        
          


        <table>

        <thead>
          <tr>
            <th scope="col">Cliente</th>
            <th scope="col">Assunto</th>
            <th scope="col">Status</th>
            <th scope="col">Cadastrado em</th>
            <th scope="col"> #</th>
          </tr>
        </thead>

          <tbody>         
            { chamados.map((item,index) =>
              {
                return(
                <tr key={index}>
                  <td data-label='Cliente'>{item.cliente}</td>
              <td data-label='Assunto'>{item.assunto}</td>
              <td data-label='Status'>
                <span className="badge" style={{backgroundColor:item.status === 'Em aberto'?'#5CB85C':'#ccc'}}>
                  {item.status}
                </span>
              </td>
              <td data-label='Cadastrado'>{item.createdFormat}</td>
              <td data-label='#'>
                <button onClick={()=>toggleModal(item)} className="action" style={{backgroundColor:'#3583f6'}}>
                  <FiSearch size={17} color='#fff' />
                </button>
                <button className="action" style={{backgroundColor:'#f6a935'}} >
                  <Link to={`/new/${item.id}`} >
                  <FiEdit2 size={17} color='#fff'/>
                  </Link>
                </button>
                <button onClick={()=>handleDelete(item.id)} className="action" style={{backgroundColor:'#FD441B'}}>
                  <FiDelete size={17} color='#fff' />
                </button>
              </td>
                </tr>
            )}
            )}
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
      )

      }
      </div>
      {showModal && (
        <Modal 
        conteudo={details}
        buttomBack={()=>setShowModal(!showModal)} />
      )}
      
    </div>
  )
}
