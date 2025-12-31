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
    async function loadingCustomers(){
      try {
        const listRef = collection(db, 'customers');
        const snapshot = await getDocs(listRef);
        let list = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, nomeEmpresa: doc.data().nomeEmpresa });
        });

        if(snapshot.docs.length === 0){
          setCustomers([ { id: '1', nomeEmpresa: 'FREELA' } ]);
          setLoadingCustomer(false);
          return;
        }

        setCustomers(list);
        setLoadingCustomer(false);
        if(id) await loadId(list);
      } catch (error) {
        setLoadingCustomer(false);
        setCustomers([ { id: '1', nomeEmpresa: 'ERRO AO BUSCAR' } ]);
      }
    }
    loadingCustomers();
  }, [id]);

  const loadId = async (list) => {
    try {
      const docRef = doc(db, 'chamados', id);
      const snapshot = await getDoc(docRef);
      setAssunto(snapshot.data().assunto);
      setComplemento(snapshot.data().complemento);
      setStatus(snapshot.data().status);
      let clienteIndex = list.findIndex(item => item.id === snapshot.data().clienteId);
      setCustomerSelected(clienteIndex);
      setEditId(true);
    } catch (error) {
      toast.error('Chamado não encontrado');
      setEditId(false);
    }
  }

  const handleRegister = async (e) => { // ASYNC ADICIONADO AQUI
    e.preventDefault();

    try {
      if(editId){
        const docRef = doc(db, 'chamados', id);
        await updateDoc(docRef, {
          cliente: customers[customerSelected].nomeEmpresa,
          clienteId: customers[customerSelected].id,
          assunto: assunto,
          status: status,
          complemento: complemento,
          userId: user.uid,
        });
        toast.info('Chamado atualizado!');
        navigate('/dashboard');
        return;
      }

      // NOVO CHAMADO: Vincula Secretaria e Departamento do Usuário
      await addDoc(collection(db, 'chamados'), {
        created: new Date(),
        cliente: customers[customerSelected].nomeEmpresa,
        clienteId: customers[customerSelected].id,
        assunto: assunto,
        status: status,
        complemento: complemento,
        userId: user.uid,
        userName: user.nome,
        secretaria: user.secretaria,
        departamento: user.departamento
      });

      toast.success('Chamado registrado!');
      navigate('/dashboard');
    } catch (error) {
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
            <label>Cliente:</label>
            { loadingCustomer ? (
              <div className="loading-field">
                <Loading size={20} color="#121212" />
                <span>Buscando empresas...</span>
              </div>
            ) : (
              <select value={customerSelected} onChange={(e) => setCustomerSelected(e.target.value)}>
                {customers.map((item, index) => (
                  <option key={index} value={index}>{item.nomeEmpresa}</option>
                ))}
              </select>
            )}

            <label>Assunto:</label>
            <select onChange={(e) => setAssunto(e.target.value)} value={assunto}>
              <option value='suporte'>Suporte</option>
              <option value='visita tecnica'>Visita Técnica</option>
              <option value='financeiro'>Financeiro</option>
            </select>

            <label>Status</label>
            <div className="status">
              <input type='radio' name='status' value='Em aberto' checked={status === 'Em aberto'} onChange={(e) => setStatus(e.target.value)} />
              <span>Em Aberto</span>
              <input type='radio' name='status' value='atendido' checked={status === 'atendido'} onChange={(e) => setStatus(e.target.value)} />
              <span>Atendido</span>
              <input type='radio' name='status' value='Em progresso' checked={status === 'Em progresso'} onChange={(e) => setStatus(e.target.value)} />
              <span>Em progresso</span>
            </div>

            <label>Complemento</label>
            <textarea placeholder="Descreva seu problema" onChange={(e) => setComplemento(e.target.value)} value={complemento} />
            <button type="submit">Registrar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
