import { useState, useEffect, useContext } from 'react';
import { FiPlusCircle } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth';
import { db } from '../../services/firebaseConnection';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, query, orderBy, limit, startAt, endAt } from 'firebase/firestore';
import { toast } from 'react-toastify';

import Header from '../../components/Header';
import Title from '../../components/Title';
import './new.css';

export default function New(){
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loadCustomers, setLoadCustomers] = useState(true);
  const [customerSelected, setCustomerSelected] = useState(0);

  const [assunto, setAssunto] = useState('Suporte');
  const [status, setStatus] = useState('Em aberto');
  const [complemento, setComplemento] = useState('');
  const [idCustomer, setIdCustomer] = useState(false);

  // Estado para busca/filtro
  const [busca, setBusca] = useState('');

  useEffect(() => {
    async function loadCustomersList(filtro = ''){
      const listRef = collection(db, "customers");
      let q;

      if(filtro !== ''){
        // Busca por nome (startAt/endAt)
        q = query(listRef, orderBy('nomeFantasia'), startAt(filtro), endAt(filtro + '\uf8ff'), limit(20));
      } else {
        q = query(listRef, orderBy('nomeFantasia'), limit(20));
      }

      const querySnapshot = await getDocs(q);
      let lista = [];

      querySnapshot.forEach((doc) => {
        lista.push({
          id: doc.id,
          nomeFantasia: doc.data().nomeFantasia
        })
      })

      if(lista.length === 0){
        setCustomers([ { id: '1', nomeFantasia: 'FREELA' } ]);
        setLoadCustomers(false);
        return;
      }

      setCustomers(lista);
      setLoadCustomers(false);

      if(id){
        loadId(lista);
      }
    }

    async function loadId(lista){
      const docRef = doc(db, "chamados", id);
      await getDoc(docRef)
      .then((snapshot) => {
        setAssunto(snapshot.data().assunto);
        setStatus(snapshot.data().status);
        setComplemento(snapshot.data().complemento);

        let index = lista.findIndex(item => item.id === snapshot.data().clienteId);
        setCustomerSelected(index);
        setIdCustomer(true);
      })
      .catch((error) => {
        console.log(error);
        setIdCustomer(false);
      })
    }

    loadCustomersList(busca);

  }, [id, busca]);

  async function handleRegister(e){
    e.preventDefault();

    // Se estiver editando um chamado existente
    if(idCustomer){
      const docRef = doc(db, "chamados", id);
      await updateDoc(docRef, {
        cliente: customers[customerSelected].nomeFantasia,
        clienteId: customers[customerSelected].id,
        assunto: assunto,
        status: status,
        complemento: complemento,
        userId: user.uid,
      })
      .then(() => {
        toast.info("Chamado atualizado com sucesso!");
        setCustomerSelected(0);
        setComplemento('');
        navigate('/dashboard');
      })
      .catch((error) => {
        toast.error("Ops, erro ao atualizar esse chamado!");
        console.log(error);
      })
      return;
    }

    // --- LÓGICA DE TTL (DATA DE VALIDADE) ---
    // Define que o chamado vai expirar em 7 dias a partir de agora
    const diasParaExpirar = 7;
    const dataExpiracao = new Date(Date.now() + diasParaExpirar * 24 * 60 * 60 * 1000);

    // REGISTRAR NOVO CHAMADO
    await addDoc(collection(db, "chamados"), {
      created: new Date(),
      cliente: customers[customerSelected].nomeFantasia,
      clienteId: customers[customerSelected].id,
      assunto: assunto,
      status: status,
      complemento: complemento,
      userId: user.uid,
      // Campo especial para o Firebase deletar automaticamente:
      expireAt: dataExpiracao 
    })
    .then(() => {
      toast.success("Chamado registrado!");
      setComplemento('');
      setCustomerSelected(0);
      navigate('/dashboard');
    })
    .catch((error) => {
      toast.error("Ops, erro ao registrar!");
      console.log(error);
    })
  }

  // Monitora a mudança no select (combobox)
  function handleChangeCustomers(e){
    setCustomerSelected(e.target.value);
  }

  return(
    <div>
      <Header/>

      <div className="content">
        <Title name={id ? "Editando Chamado" : "Novo Chamado"}>
          <FiPlusCircle size={25} />
        </Title>

        <div className="container">
          <form className="form-profile" onSubmit={handleRegister}>
            
            <label>Cliente</label>
            {/* Campo de filtro para facilitar a busca */}
            <input 
              type="text" 
              placeholder="Filtrar clientes..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ marginBottom: 10 }}
            />

            {loadCustomers ? (
              <input type="text" disabled={true} value="Carregando clientes..." />
            ) : (
              <select value={customerSelected} onChange={handleChangeCustomers}>
                {customers.map((item, index) => {
                  return(
                    <option key={item.id} value={index}>
                      {item.nomeFantasia}
                    </option>
                  )
                })}
              </select>
            )}

            <label>Assunto</label>
            <select value={assunto} onChange={(e) => setAssunto(e.target.value)}>
              <option value="Suporte">Suporte</option>
              <option value="Visita Tecnica">Visita Técnica</option>
              <option value="Financeiro">Financeiro</option>
            </select>

            <label>Status</label>
            <div className="status">
              <input 
                type="radio"
                name="radio"
                value="Em aberto"
                onChange={(e) => setStatus(e.target.value)}
                checked={ status === 'Em aberto' }
              />
              <span>Em aberto</span>

              <input 
                type="radio"
                name="radio"
                value="Progresso"
                onChange={(e) => setStatus(e.target.value)}
                checked={ status === 'Progresso' }
              />
              <span>Progresso</span>

              <input 
                type="radio"
                name="radio"
                value="Atendido"
                onChange={(e) => setStatus(e.target.value)}
                checked={ status === 'Atendido' }
              />
              <span>Atendido</span>
            </div>

            <label>Complemento</label>
            <textarea
              type="text"
              placeholder="Descreva seu problema (opcional)."
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
            />

            <button type="submit">Registrar</button>
          </form>
        </div>
      </div>
    </div>
  )
}
