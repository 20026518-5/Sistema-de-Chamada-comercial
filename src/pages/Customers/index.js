import { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiUser, FiTrash } from 'react-icons/fi';
import { db } from '../../services/firebaseConnection';
// [ALTERAÇÃO 1] Trocamos deleteDoc por updateDoc
import { addDoc, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/auth';
import { useNavigate } from 'react-router-dom';

export default function Customers(){
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [nomeSecretaria, setNomeSecretaria] = useState('');
  const [nomeDepartamento, setNomeDepartamento] = useState('');
  const [setores, setSetores] = useState([]);

  // Proteção da Rota (Apenas Admin)
  useEffect(() => {
    if(!user.isadm){
      toast.error("Você não tem permissão para acessar esta página.");
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Carregar Setores
  useEffect(() => {
    async function loadSetores(){
      const querySnapshot = await getDocs(collection(db, "setores"));
      let lista = [];
      
      querySnapshot.forEach((doc) => {
        // [ALTERAÇÃO 2] Filtro Lógico: Só mostra se 'ativo' não for falso
        // Isso garante que dados antigos (sem o campo) continuem aparecendo
        if(doc.data().ativo !== false){
            lista.push({
              id: doc.id,
              secretaria: doc.data().secretaria,
              departamento: doc.data().departamento
            })
        }
      })
      setSetores(lista);
    }
    
    if(user.isadm){
        loadSetores();
    }
  }, [user.isadm]);

  async function handleRegister(e){
    e.preventDefault();
    if(nomeSecretaria !== '' && nomeDepartamento !== ''){
      await addDoc(collection(db, "setores"), {
        secretaria: nomeSecretaria,
        departamento: nomeDepartamento,
        ativo: true // [ALTERAÇÃO 3] Define como ativo ao criar
      })
      .then(() => {
        setNomeSecretaria('');
        setNomeDepartamento('');
        toast.info("Setor cadastrado com sucesso!");
        window.location.reload(); 
      })
      .catch((error) => {
        console.log(error);
        toast.error("Erro ao cadastrar.");
      })
    } else {
      toast.error("Preencha todos os campos!");
    }
  }

  async function handleDelete(id){
    // [ALTERAÇÃO 4] Soft Delete: Atualiza para false em vez de deletar
    await updateDoc(doc(db, "setores", id), {
        ativo: false
    })
    .then(()=>{
        toast.success("Desativado com sucesso!");
        // Remove da lista visualmente
        setSetores(setores.filter(item => item.id !== id));
    })
    .catch((error) => {
        console.log(error);
        toast.error("Erro ao desativar.");
    })
  }

  if(!user.isadm) return null;

  return(
    <div>
      <Header/>
      <div className="content">
        <Title name="Secretarias e Departamentos">
          <FiUser size={25} />
        </Title>

        <div className="container">
          <form className="form-profile" onSubmit={handleRegister}>
            <label>Nome da Secretaria</label>
            <input 
              type="text" 
              placeholder="Ex: Secretaria de Saúde"
              value={nomeSecretaria}
              onChange={(e) => setNomeSecretaria(e.target.value)}
            />

            <label>Departamento</label>
            <input 
              type="text" 
              placeholder="Ex: Recursos Humanos"
              value={nomeDepartamento}
              onChange={(e) => setNomeDepartamento(e.target.value)}
            />

            <button type="submit">Cadastrar</button>
          </form>
        </div>

        <div className="container">
          <div className="painel-grid">
            {setores.map((item, index) => (
               <div className="painel-item" key={item.id || index}>
                 <div className="painel-linha">
                    <label>Secretaria:</label>
                    <span>{item.secretaria}</span>
                 </div>
                 <div className="painel-linha">
                    <label>Departamento:</label>
                    <span>{item.departamento}</span>
                 </div>
                 
                 <button 
                    onClick={() => handleDelete(item.id)}
                    style={{ marginTop: '10px', backgroundColor: '#ff3333', color: '#FFF', border: 0, padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', maxWidth: '40px' }}
                    title="Desativar Setor"
                 >
                    <FiTrash size={18} />
                 </button>
               </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  )
}
