import { addDoc, collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../components/Header";
import Title from "../../components/Title";
import Loading from "../../components/Loading";
import { AuthContext } from "../../contexts/auth";
import { db } from "../../services/firebaseConnection";
import './new.css';

export default function New(){
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [customers, setCustomers] = useState([]);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [customerSelected, setCustomerSelected] = useState(0);
  const [assunto, setAssunto] = useState('suporte');
  const [complemento, setComplemento] = useState('');
  const [status, setStatus] = useState('Em aberto');
  const [editId, setEditId] = useState(false);

  useEffect(() => {
      const loadId = async (list) => {
    try {
      const docRef = doc(db, 'chamados', id);
      const snapshot = await getDoc(docRef);
      setAssunto(snapshot.data().assunto);
      setComplemento(snapshot.data().complemento);
      setStatus(snapshot.data().status);
      
      let clienteIndex = list.findIndex(item => item.id === snapshot.data().clienteId);
      setCustomerSelected(clienteIndex !== -1 ? clienteIndex : 0);
      setEditId(true);
    } catch (error) {
      toast.error('Chamado não encontrado');
      setEditId(false);
    }
  }
    
    async function loadingCustomers(){
      try {
        // [CORREÇÃO] Mudamos de 'customers' para 'setores' para buscar o que foi cadastrado
        const listRef = collection(db, 'setores');
        const snapshot = await getDocs(listRef);
        let list = [];

        snapshot.forEach((doc) => {
          list.push({ 
            id: doc.id, 
            // [ADAPTAÇÃO] Como não existe 'nomeEmpresa' em setores, criamos uma string combinada
            nomeEmpresa: `${doc.data().secretaria} - ${doc.data().departamento}` 
          });
        });

        if(snapshot.docs.length === 0){
          setCustomers([ { id: '1', nomeEmpresa: 'NENHUM SETOR CADASTRADO' } ]);
          setLoadingCustomer(false);
          return;
        }

        setCustomers(list);
        setLoadingCustomer(false);

        if(id) await loadId(list);

      } catch (error) {
        console.log(error); // Adicionado log para ajudar em debugs
        setLoadingCustomer(false);
        setCustomers([ { id: '1', nomeEmpresa: 'ERRO AO BUSCAR' } ]);
      }
    }
    
    if(user.isadm || id){
        loadingCustomers();
    } else {
        setLoadingCustomer(false);
    }
  }, [id, user.isadm]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      if(editId){
        const docRef = doc(db, 'chamados', id);
        const updateData = {
          assunto: assunto,
          status: status,
          complemento: complemento,
          updatedBy: user.nome, // Auditoria
          updatedAt: new Date() // Auditoria
        };

        if(user.isadm){
            updateData.cliente = customers[customerSelected].nomeEmpresa;
            updateData.clienteId = customers[customerSelected].id;
        }

        await updateDoc(docRef, updateData);
        toast.info('Chamado atualizado!');
        navigate('/dashboard');
        return;
      }

      const novoChamado = {
        created: new Date(),
        assunto: assunto,
        status: status,
        complemento: complemento,
        userId: user.uid,
        userName: user.nome,
        secretaria: user.secretaria,
        departamento: user.departamento
      };

      if(user.isadm){
        novoChamado.cliente = customers[customerSelected].nomeEmpresa;
        novoChamado.clienteId = customers[customerSelected].id;
      } else {
        novoChamado.cliente = user.nome;
        novoChamado.clienteId = user.uid;
      }

      await addDoc(collection(db, 'chamados'), novoChamado);
      toast.success('Chamado registrado!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao registrar.');
    }
  }

  return (
    <div>
      <Header />
      <div className="content">
        <Title name={ id ? 'Editando Chamado' : 'Novo Chamado' }>
          <FiPlusCircle size={25} />
        </Title>
        <div className="container">
          <form className="form-profile" onSubmit={handleRegister}>
            {user.isadm && (
              <>
                <label>Unidade / Cliente:</label>
                { loadingCustomer ? (
                  <div className="loading-field">
                    <Loading size={20} color="#121212" />
                    <span>Buscando unidades...</span>
                  </div>
                ) : (
                  <select value={customerSelected} onChange={(e) => setCustomerSelected(e.target.value)}>
                    {customers.map((item, index) => (
                      <option key={index} value={index}>{item.nomeEmpresa}</option>
                    ))}
                  </select>
                )}
              </>
            )}

            <label>Assunto:</label>
            <select onChange={(e) => setAssunto(e.target.value)} value={assunto}>
              <option value='suporte'>Suporte</option>
              <option value='visita tecnica'>Visita Técnica</option>
              <option value='financeiro'>Financeiro</option>
            </select>

            {user.isadm && (
              <>
                <label>Status</label>
                <div className="status">
                  <input type='radio' name='status' value='Em aberto' checked={status === 'Em aberto'} onChange={(e) => setStatus(e.target.value)} />
                  <span>Em Aberto</span>
                  <input type='radio' name='status' value='atendido' checked={status === 'atendido'} onChange={(e) => setStatus(e.target.value)} />
                  <span>Atendido</span>
                  <input type='radio' name='status' value='Em progresso' checked={status === 'Em progresso'} onChange={(e) => setStatus(e.target.value)} />
                  <span>Em progresso</span>
                </div>
              </>
            )}

            <label>Complemento</label>
            <textarea placeholder="Descreva seu problema" onChange={(e) => setComplemento(e.target.value)} value={complemento} />
            <button type="submit">{id ? 'Atualizar Chamado' : 'Registrar Chamado'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
