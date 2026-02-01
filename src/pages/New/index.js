import { addDoc, collection, doc, getDoc, getDocs, updateDoc, query, orderBy, limit, startAt, endAt } from "firebase/firestore";
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
  const [customerSelected, setCustomerSelected] = useState(''); // [CORREÇÃO] Agora armazena o ID, não o índice
  const [assunto, setAssunto] = useState('suporte');
  const [complemento, setComplemento] = useState('');
  const [status, setStatus] = useState('Em aberto');
  const [editId, setEditId] = useState(false);
  
  // [NOVO] Estado para o filtro de busca
  const [busca, setBusca] = useState('');

  useEffect(() => {
    // Carrega o chamado se for edição
    async function loadId(list) {
      try {
        const docRef = doc(db, 'chamados', id);
        const snapshot = await getDoc(docRef);
        setAssunto(snapshot.data().assunto);
        setComplemento(snapshot.data().complemento);
        setStatus(snapshot.data().status);
        
        // [CORREÇÃO] Define o ID do cliente selecionado diretamente
        const storedId = snapshot.data().clienteId;
        setCustomerSelected(storedId);
        setEditId(true);

        // [SEGURANÇA] Se o cliente salvo não estiver na lista inicial (top 20), precisamos buscá-lo
        const clienteNaLista = list.some(item => item.id === storedId);
        if(!clienteNaLista && storedId){
           const docCliente = await getDoc(doc(db, 'setores', storedId));
           if(docCliente.exists()){
             const clienteFaltante = {
                id: docCliente.id,
                nomeEmpresa: `${docCliente.data().secretaria} - ${docCliente.data().departamento}`
             };
             setCustomers(old => [...old, clienteFaltante]);
           }
        }

      } catch (error) {
        toast.error('Chamado não encontrado');
        setEditId(false);
      }
    }
    
    // Função de carregar clientes com Filtro
async function loadingCustomers(filtro = ''){
      try {
        const listRef = collection(db, 'setores');
        let q;

        if(filtro !== ''){
          // Mantemos a query de busca visual
          q = query(listRef, orderBy('secretaria'), startAt(filtro), endAt(filtro + '\uf8ff'), limit(20));
        } else {
          q = query(listRef, orderBy('secretaria'), limit(20));
        }

        const snapshot = await getDocs(q);
        let list = [];
        
        snapshot.forEach((doc) => {
          // [ALTERAÇÃO] Filtro de Soft Delete
          // Se o setor foi "excluído" (ativo: false), ele não entra na lista
          if(doc.data().ativo !== false){
             list.push({ 
               id: doc.id, 
               nomeEmpresa: `${doc.data().secretaria} - ${doc.data().departamento}` 
             });
          }
        });

        if(list.length === 0){
          // Ajuste visual caso a filtragem remova tudo
          if(snapshot.docs.length > 0 && list.length === 0){
             // Se o banco retornou dados mas todos eram inativos
             setCustomers([]); 
          } else {
             setCustomers([]);
          }
          return;
        }

        setCustomers(list);
        
        // Seleciona o primeiro automaticamente se não houver seleção prévia
        if(!customerSelected && list.length > 0) {
            setCustomerSelected(list[0].id);
        }

        setLoadingCustomer(false);
        
        if(id) await loadId(list);

      } catch (error) {
        console.log(error);
        setLoadingCustomer(false);
        setCustomers([ { id: '1', nomeEmpresa: 'ERRO AO BUSCAR' } ]);
      }
    }
    
    if(user.isadm || id){
        loadingCustomers(busca);
    } else {
        setLoadingCustomer(false);
    }
  }, [id, user.isadm, busca]); // [ATENÇÃO] 'busca' na dependência recarrega ao digitar

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // [CORREÇÃO] Encontra o objeto completo do cliente baseando-se no ID selecionado
      const clienteObj = customers.find(c => c.id === customerSelected);
      
      // Validação extra caso a lista esteja vazia ou erro
      if(!clienteObj && user.isadm) {
        toast.error('Selecione um cliente válido');
        return;
      }

      if(editId){
        const docRef = doc(db, 'chamados', id);
        const updateData = {
          assunto: assunto,
          status: status,
          complemento: complemento,
          updatedBy: user.nome,
          updatedAt: new Date()
        };

        if(user.isadm){
            updateData.cliente = clienteObj.nomeEmpresa;
            updateData.clienteId = clienteObj.id;
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
        novoChamado.cliente = clienteObj.nomeEmpresa;
        novoChamado.clienteId = clienteObj.id;
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
                
                {/* [NOVO] Input de Filtro para buscar no banco */}
                <input 
                  type="text" 
                  placeholder="Filtrar por nome da secretaria..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  style={{ marginBottom: '5px' }}
                />

                { loadingCustomer ? (
                  <div className="loading-field">
                    <Loading size={20} color="#121212" />
                    <span>Buscando unidades...</span>
                  </div>
                ) : (
                  <select value={customerSelected} onChange={(e) => setCustomerSelected(e.target.value)}>
                    {customers.map((item) => (
                      <option key={item.id} value={item.id}>{item.nomeEmpresa}</option>
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
