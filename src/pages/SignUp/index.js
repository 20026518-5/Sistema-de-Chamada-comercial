import { useState, useContext, useEffect } from 'react';
import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth';
import { db } from '../../services/firebaseConnection'; // Importação da conexão com banco
import { collection, getDocs } from 'firebase/firestore'; // Importação do Firestore
import '../SignIn/signin.css';

export default function SignUp() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [secretaria, setSecretaria] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [listaSetores, setListaSetores] = useState([]); // Estado para armazenar os setores do banco

  const { signUp, loadingAuth } = useContext(AuthContext); //

  // Busca as secretarias e departamentos cadastrados pelo Admin no Firestore
  useEffect(() => {
   async function getSetores() {
    try {
      const querySnapshot = await getDocs(collection(db, 'setores'));
      let lista = [];
      querySnapshot.forEach(doc => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      
      console.log("SETORES BUSCADOS:", lista); // Adicione este log para testar
      setListaSetores(lista);
    } catch (error) {
      console.log("ERRO AO BUSCAR SETORES NO SIGNUP: ", error);
    }
  }

  getSetores();
}, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (nome !== '' && email !== '' && senha !== '' && secretaria !== '' && departamento !== '') {
      await signUp(nome, email, senha, secretaria, departamento);
    } else {
      alert("Preencha todos os campos para continuar.");
    }
  }

  // Gera uma lista de secretarias únicas para o primeiro Select
  const secretariasUnicas = [...new Set(listaSetores.map(s => s.secretaria))];

  return (
    <div className="container-center">
      <div className="login">
        <div className="login-area">
          <img src={logo} alt="Logo do sistema de chamados" />
        </div>

        <form onSubmit={handleSubmit}>
          <h1>Nova conta</h1>
          <input 
            type="text" 
            placeholder="Seu nome" 
            value={nome}
            onChange={ (e) => setNome(e.target.value) }
          />

          <input 
            type="text" 
            placeholder="email@email.com" 
            value={email}
            onChange={ (e) => setEmail(e.target.value) }
          />

          <input 
            type="password" 
            placeholder="Sua senha" 
            value={senha}
            onChange={ (e) => setSenha(e.target.value) }
          />

          {/* Select de Secretaria - Apenas o que o Admin cadastrou */}
          <label style={{ alignSelf: 'flex-start', marginBottom: 5 }}>Secretaria:</label>
          <select 
            value={secretaria} 
            onChange={(e) => {
              setSecretaria(e.target.value);
              setDepartamento(''); // Limpa o departamento caso troque a secretaria
            }}
          >
            <option value="">Selecione uma secretaria</option>
            {secretariasUnicas.map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>

          {/* Select de Departamento - Filtra baseado na Secretaria escolhida */}
          <label style={{ alignSelf: 'flex-start', marginBottom: 5, marginTop: 10 }}>Departamento:</label>
          <select 
            value={departamento} 
            onChange={(e) => setDepartamento(e.target.value)}
            disabled={!secretaria} // Só habilita após escolher a secretaria
          >
            <option value="">Selecione o departamento</option>
            {listaSetores
              .filter(s => s.secretaria === secretaria)
              .map(item => (
                <option key={item.id} value={item.departamento}>{item.departamento}</option>
              ))
            }
          </select>

          <button type="submit">
            {loadingAuth ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <Link to="/">Já possui uma conta? Faça login</Link>

      </div>
    </div>
  );
}
