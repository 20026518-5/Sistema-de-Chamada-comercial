import { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConnection';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiSettings, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Settings() {
  const [secretaria, setSecretaria] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega os setores ao abrir a página
  useEffect(() => {
    async function loadSetores() {
      try {
        const querySnapshot = await getDocs(collection(db, 'setores'));
        let lista = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        setSetores(lista);
      } catch (error) {
        console.error("Erro ao buscar setores: ", error);
        toast.error("Erro ao carregar lista de setores.");
      } finally {
        setLoading(false);
      }
    }
    loadSetores();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();

    if (secretaria === '' || departamento === '') {
      toast.warning("Preencha todos os campos!");
      return;
    }

    try {
      // Adiciona no Banco de Dados
      const docRef = await addDoc(collection(db, 'setores'), {
        secretaria: secretaria,
        departamento: departamento
      });

      // Se chegou aqui, funcionou. Agora atualizamos a lista na tela
      const novoSetor = {
        id: docRef.id,
        secretaria: secretaria,
        departamento: departamento
      };

      setSetores([...setores, novoSetor]);
      setSecretaria('');
      setDepartamento('');
      toast.success("Setor cadastrado com sucesso!");

    } catch (error) {
      console.error("Erro ao cadastrar: ", error);
      toast.error("Falha ao salvar no banco de dados.");
    }
  }

  async function handleDelete(id) {
    try {
      const docRef = doc(db, 'setores', id);
      await deleteDoc(docRef);
      setSetores(setores.filter(item => item.id !== id));
      toast.success("Setor excluído!");
    } catch (error) {
      console.error("Erro ao deletar: ", error);
      toast.error("Erro ao excluir setor.");
    }
  }

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Configurações de Setores">
          <FiSettings size={25} />
        </Title>

        <div className="container">
          <form className="form-profile" onSubmit={handleAdd}>
            <label>Secretaria</label>
            <input 
              type="text" 
              value={secretaria} 
              onChange={(e) => setSecretaria(e.target.value)} 
              placeholder="Ex: Secretaria de Saúde" 
            />

            <label>Departamento</label>
            <input 
              type="text" 
              value={departamento} 
              onChange={(e) => setDepartamento(e.target.value)} 
              placeholder="Ex: Almoxarifado" 
            />

            <button type="submit">Cadastrar Setor</button>
          </form>
        </div>

        <div className="container">
          {loading ? (
            <span>Carregando setores...</span>
          ) : setores.length === 0 ? (
            <span>Nenhum setor cadastrado.</span>
          ) : (
            <table>
              <thead>
                <tr>
                  <th scope="col">Secretaria</th>
                  <th scope="col">Departamento</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {setores.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Secretaria">{item.secretaria}</td>
                    <td data-label="Departamento">{item.departamento}</td>
                    <td data-label="Ações">
                      <button 
                        className="action" 
                        style={{ backgroundColor: '#FD441B' }} 
                        onClick={() => handleDelete(item.id)}
                      >
                        <FiTrash2 size={15} color="#FFF" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
