import { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConnection';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiSettings, FiTrash2, FiPlus, FiList } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Settings() {
  const [secretaria, setSecretaria] = useState('');
  const [departamentoInput, setDepartamentoInput] = useState('');
  const [listaDepartamentos, setListaDepartamentos] = useState([]);
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }
    loadSetores();
  }, []);

  function handleAddToList(e) {
    e.preventDefault();
    if (departamentoInput === '') {
      toast.warning("Digite o nome do departamento!");
      return;
    }
    setListaDepartamentos([...listaDepartamentos, departamentoInput]);
    setDepartamentoInput('');
  }

  function handleRemoveFromList(index) {
    let novaLista = listaDepartamentos.filter((_, i) => i !== index);
    setListaDepartamentos(novaLista);
  }

  async function handleSaveAll() {
    if (secretaria === '' || listaDepartamentos.length === 0) {
      toast.warning("Preencha a secretaria e adicione ao menos um departamento!");
      return;
    }

    try {
      const promises = listaDepartamentos.map(dep => {
        return addDoc(collection(db, 'setores'), {
          secretaria: secretaria.trim(),
          departamento: dep.trim()
        });
      });

      await Promise.all(promises);
      toast.success("Cadastrado com sucesso!");
      setSecretaria('');
      setListaDepartamentos([]);
      
      const querySnapshot = await getDocs(collection(db, 'setores'));
      let lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setSetores(lista);

    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar no banco.");
    }
  }

  async function handleDelete(id) {
    try {
      const docRef = doc(db, 'setores', id);
      await deleteDoc(docRef);
      setSetores(setores.filter(item => item.id !== id));
      toast.success("Item removido!");
    } catch (error) {
      toast.error("Erro ao excluir.");
    }
  }

  // Agrupa os dados para a listagem organizada
  const setoresAgrupados = setores.reduce((acc, item) => {
    if (!acc[item.secretaria]) {
      acc[item.secretaria] = [];
    }
    acc[item.secretaria].push(item);
    return acc;
  }, {});

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Configurações de Setores">
          <FiSettings size={25} />
        </Title>

        <div className="container">
          <div className="form-profile">
            <h2 style={{ marginBottom: '15px', fontSize: '1.2em' }}>Cadastrar Nova Unidade</h2>
            
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nome da Secretaria ou Autarquia</label>
            <input 
              type="text" 
              value={secretaria} 
              onChange={(e) => setSecretaria(e.target.value)} 
              placeholder="Ex: Secretaria de Educação ou Autarquia de Saneamento" 
            />

            <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Departamentos vinculados</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      value={departamentoInput} 
                      onChange={(e) => setDepartamentoInput(e.target.value)} 
                      placeholder="Adicionar departamento (ex: Protocolo)" 
                      style={{ flex: 1, marginBottom: 0 }}
                    />
                    <button onClick={handleAddToList} style={{ width: '50px', height: '43px', backgroundColor: '#181c2e', border: 0, borderRadius: '4px', cursor: 'pointer' }}>
                        <FiPlus size={20} color="#FFF" />
                    </button>
                </div>
            </div>

            {/* Pré-visualização antes de salvar */}
            {listaDepartamentos.length > 0 && (
                <div style={{ marginTop: '15px', padding: '15px', background: '#f0f4f8', borderRadius: '5px', border: '1px solid #d1d9e0' }}>
                    <p style={{ marginBottom: '10px' }}><strong>Itens a serem criados para "{secretaria}":</strong></p>
                    <ul style={{ listStyle: 'none' }}>
                        {listaDepartamentos.map((dep, index) => (
                            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e1e4e8' }}>
                                <span>• {dep}</span>
                                <button onClick={() => handleRemoveFromList(index)} style={{ color: '#ff4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Remover</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button onClick={handleSaveAll} style={{ marginTop: '25px', backgroundColor: '#1fcc44', fontWeight: 'bold' }}>
                Confirmar Cadastro da Unidade
            </button>
          </div>
        </div>

        <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #ddd' }} />

        {/* Listagem com Quebra de Linha e Separação por Blocos */}
        <div className="container">
          <Title name="Unidades e Departamentos Cadastrados">
            <FiList size={22} />
          </Title>

          {loading ? (
            <span>Carregando lista...</span>
          ) : Object.keys(setoresAgrupados).length === 0 ? (
            <span>Nenhum registro encontrado.</span>
          ) : (
            Object.keys(setoresAgrupados).map((nomeSec) => (
              <div key={nomeSec} style={{ 
                marginBottom: '40px', // Espaçamento (quebra de linha) entre secretarias
                background: '#FFF', 
                padding: '20px', 
                borderRadius: '8px', 
                border: '1px solid #eee',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)' 
              }}>
                <h3 style={{ 
                    color: '#181c2e', 
                    paddingBottom: '10px', 
                    borderBottom: '2px solid #181c2e', 
                    marginBottom: '15px',
                    fontSize: '1.3em'
                }}>
                    {nomeSec}
                </h3>
                
                <table style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th scope="col">Departamento</th>
                      <th scope="col" style={{ width: '80px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {setoresAgrupados[nomeSec].map((item) => (
                      <tr key={item.id}>
                        <td data-label="Departamento">{item.departamento}</td>
                        <td data-label="Ações">
                          <button className="action" style={{ backgroundColor: '#FD441B' }} onClick={() => handleDelete(item.id)}>
                            <FiTrash2 size={15} color="#FFF" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
