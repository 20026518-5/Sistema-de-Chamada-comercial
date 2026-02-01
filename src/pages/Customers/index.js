import { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiUser, FiTrash } from 'react-icons/fi';
import { db } from '../../services/firebaseConnection';
import { addDoc, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/auth';
import { useNavigate } from 'react-router-dom';

export default function Customers(){
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [nomeSecretaria, setNomeSecretaria] = useState('');
  const [nomeDepartamento, setNomeDepartamento] = useState('');
  const [setores, setSetores] = useState([]);

  // Effect 1: Proteção da Rota (Apenas Admin)
  useEffect(() => {
    if(!user.isadm){
      toast.error("Você não tem permissão para acessar esta página.");
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Effect 2: Carregar Setores
  useEffect(() => {
    async function loadSetores(){
      const querySnapshot = await getDocs(collection(db, "setores"));
      let lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({
          id: doc.id,
          secretaria: doc.data().secretaria,
          departamento: doc.data().departamento
        })
      })
      setSetores(lista);
    }
    
    // Só carrega se for admin, para evitar erros de permissão no console
    if(user.isadm){
        loadSetores();
    }
  }, [user.isadm]);

  async function handleRegister(e){
    e.preventDefault();
    if(nomeSecretaria !== '' && nomeDepartamento !== ''){
      await addDoc(collection(db, "setores"), {
        secretaria: nomeSecretaria,
        departamento: nomeDepartamento
      })
      .then(() => {
        setNomeSecretaria('');
        setNomeDepartamento('');
        toast.info("Setor cadastrado com sucesso!");
        // Atualiza a lista localmente
        setSetores([...setores, {secretaria: nomeSecretaria, departamento: nomeDepartamento}]);
        // Opcional: recarregar a página para limpar estados ou garantir sincronia
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
    await deleteDoc(doc(db, "setores", id))
    .then(()=>{
        toast.success("Deletado com sucesso!");
        setSetores(setores.filter(item => item.id !== id));
    })
    .catch((error) => {
        console.log(error);
        toast.error("Erro ao deletar.");
    })
  }

  // Se não for admin, não renderiza nada enquanto redireciona
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
