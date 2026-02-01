import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth';
import { db } from '../../services/firebaseConnection';
import { collection, getDocs } from 'firebase/firestore';
import logo from '../../assets/logo.png';
import '../SignIn/signin.css'; 

export default function SignUp() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretaria, setSecretaria] = useState('');
  const [departamento, setDepartamento] = useState('');
  
  const [listaSetores, setListaSetores] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('@theme') || 'light');

  const { signUp, loadingAuth } = useContext(AuthContext);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('@theme', theme);
  }, [theme]);

 
   useEffect(() => {
    async function loadSetores() {
      const querySnapshot = await getDocs(collection(db, "setores"));
      let lista = [];
      
      querySnapshot.forEach((doc) => {
        // [ALTERAÇÃO] Só adiciona na lista se 'ativo' for diferente de false
        if (doc.data().ativo !== false) {
          lista.push({
            id: doc.id,
            secretaria: doc.data().secretaria,
            departamento: doc.data().departamento
          });
        }
      });
      
      setListaSetores(lista);
    }
    loadSetores();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (nome !== '' && email !== '' && password !== '' && secretaria !== '' && departamento !== '') {
      await signUp(email, password, nome, secretaria, departamento);
    } else {
      alert("Preencha todos os campos!");
    }
  }

  const secretariasUnicas = [...new Set(listaSetores.map(item => item.secretaria))];

  return (
    <div className="container-center">
      <div className="theme-selector-wrapper">
        <label>TEMA</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
          <option value="jade">Verde Jade</option>
        </select>
      </div>

      <div className="login" style={{ width: '700px' }}>
        <div className="login-area">
          <img src={logo} alt="Logo do sistema" />
        </div>

        <form onSubmit={handleSubmit}>
          <h1>Cadastrar Servidor</h1>
          <input 
            type="text" 
            placeholder="Seu nome completo" 
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
          />
          <input 
            type="text" 
            placeholder="email@institucional.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Sua senha" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <select 
            value={secretaria} 
            onChange={(e) => { setSecretaria(e.target.value); setDepartamento(''); }}
            style={{ marginBottom: '1rem', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
          >
            <option value="">Selecione sua Secretaria</option>
            {secretariasUnicas.map((sec, index) => (
              <option key={index} value={sec}>{sec}</option>
            ))}
          </select>
          <select 
            value={departamento} 
            onChange={(e) => setDepartamento(e.target.value)}
            disabled={!secretaria}
            style={{ marginBottom: '1rem', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-color)' }}
          >
            <option value="">Selecione seu Departamento</option>
            {listaSetores
              .filter(item => item.secretaria === secretaria)
              .map((item) => (
                <option key={item.id} value={item.departamento}>{item.departamento}</option>
              ))
            }
          </select>
          <button type="submit">
            {loadingAuth ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <Link to="/">Já possui uma conta? Entre aqui</Link>

        <footer className="footer-sistema">
          <p>Desenvolvido por: <strong>Bruna Eduarda</strong></p>
          <p>Projeto original: <a href="https://github.com/suelen-m-m/chamada-3" target="_blank" rel="noreferrer">GitHub - Sistema de Chamados</a></p>
          <p>Licença: Este projeto está licenciado sob a licença MIT.</p>
          <p>Adaptado por: <strong>Lucas Vinicius Sampaio Lima</strong></p>
          <p>GitHub: <a href="https://github.com/20026518-5" target="_blank" rel="noreferrer">https://github.com/20026518-5</a></p>
        </footer>
      </div>
    </div>
  );
}
