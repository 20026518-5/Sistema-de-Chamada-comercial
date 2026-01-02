import { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConnection';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiSettings, FiTrash2, FiPlus, FiList, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Settings() {
  const [secretaria, setSecretaria] = useState('');
  const [departamentoInput, setDepartamentoInput] = useState('');
  const [listaDepartamentos, setListaDepartamentos] = useState([]);
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de Edição
  const [editandoId, setEditandoId] = useState(null);
  const [novoNomeDep, setNovoNomeDep] = useState('');
  const [editandoSec, setEditandoSec] = useState(null);
  const [novoNomeSec, setNovoNomeSec] = useState('');

  useEffect(() => {
    loadSetores();
  }, []);

  async function loadSetores() {
    setLoading(true);
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

  // Estilo para prevenir sobreposição de texto
  const cellTextStyle = {
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
    padding: '8px',
    fontSize: '0.9em'
  };

  async function handleSaveAll() {
    if (secretaria === '' || listaDepartamentos.length === 0) {
      toast.warning("Preencha a secretaria e adicione departamentos!");
      return;
    }
    try {
      const promises = listaDepartamentos.map(dep => 
        addDoc(collection(db, 'setores'), { 
          secretaria: secretaria.trim(), 
          departamento: dep.trim() 
        })
      );
      await Promise.all(promises);
      toast.success("Unidade cadastrada com sucesso!");
      setSecretaria('');
      setListaDepartamentos([]);
      loadSetores();
    } catch (error) { toast.error("Erro ao salvar no banco de dados."); }
  }

  async function handleDeleteSec(nomeSec) {
    if(!window.confirm(`Deseja excluir "${nomeSec}" e todos os seus departamentos?`)) return;
    try {
      const batch = writeBatch(db);
      const itens = setores.filter(s => s.secretaria === nomeSec);
      itens.forEach(item => batch.delete(doc(db, 'setores', item.id)));
      await batch.commit();
      toast.success("Unidade removida!");
      loadSetores();
    } catch (error) { toast.error("Erro ao excluir unidade."); }
  }

  async function handleUpdateSec(antigoNome) {
    if(novoNomeSec === '' || novoNomeSec === antigoNome) { setEditandoSec(null); return; }
    try {
      const batch = writeBatch(db);
      const itens = setores.filter(s => s.secretaria === antigoNome);
      itens.forEach(item => batch.update(doc(db, 'setores', item.id), { secretaria: novoNomeSec }));
      await batch.commit();
      toast.success("Nome da unidade atualizado!");
      setEditandoSec(null);
      loadSetores();
    } catch (error) { toast.error("Erro ao atualizar unidade."); }
  }

  async function handleUpdateDep(id) {
    if(novoNomeDep === '') return;
    try {
      await updateDoc(doc(db, 'setores', id), { departamento: novoNomeDep });
      toast.success("Departamento atualizado!");
      setEditandoId(null);
      loadSetores();
    } catch (error) { toast.error("Erro ao atualizar departamento."); }
  }

  const setoresAgrupados = setores.reduce((acc, item) => {
    if (!acc[item.secretaria]) acc[item.secretaria] = [];
    acc[item.secretaria].push(item);
    return acc;
  }, {});

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Configurações de Setores"><FiSettings size={25} /></Title>

        {/* --- BLOCO DE CADASTRO --- */}
        <div className="container">
          <div className="form-profile">
            <h2 style={{ marginBottom: '20px', fontSize: '1.3em', color: '#181c2e' }}>Cadastrar Nova Unidade</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Nome da Secretaria ou Autarquia</label>
              <input 
                type="text" 
                value={secretaria} 
                onChange={(e) => setSecretaria(e.target.value)} 
                placeholder="Digite o nome completo da unidade" 
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Adicionar Departamentos</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  value={departamentoInput} 
                  onChange={(e) => setDepartamentoInput(e.target.value)} 
                  style={{ flex: 1, marginBottom: 0 }} 
                  placeholder="Digite o nome do departamento e clique no +" 
                />
                <button 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if(departamentoInput) { 
                      setListaDepartamentos([...listaDepartamentos, departamentoInput]); 
                      setDepartamentoInput(''); 
                    } 
                  }} 
                  style={{ width: '50px', height: '43px', backgroundColor: '#181c2e', border: 0, borderRadius: '4px' }}
                >
                  <FiPlus size={20} color="#FFF" />
                </button>
              </div>
            </div>

            {/* Lista temporária (Bloco abaixo do enunciado de digitação) */}
            {listaDepartamentos.length > 0 && (
              <div style={{ marginTop: '10px', padding: '15px', background: '#f0f4f8', borderRadius: '5px', border: '1px solid #d1d9e0' }}>
                <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Departamentos pendentes de salvamento:</p>
                {listaDepartamentos.map((dep, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e1e4e8' }}>
                    <span style={{ fontSize: '0.95em' }}>{dep}</span>
                    <FiX color="red" cursor="pointer" onClick={() => setListaDepartamentos(listaDepartamentos.filter((_, idx) => idx !== i))} />
                  </div>
                ))}
              </div>
            )}
            
            <button onClick={handleSaveAll} style={{ marginTop: '20px', backgroundColor: '#1fcc44', padding: '12px', fontWeight: 'bold' }}>
              Finalizar Cadastro da Unidade
            </button>
          </div>
        </div>

        <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #ddd' }} />

        {/* --- LISTAGEM EM DOIS BLOCOS HORIZONTAIS --- */}
        <div className="container" style={{ background: 'transparent', padding: 0, boxShadow: 'none' }}>
          <Title name="Unidades Cadastradas"><FiList size={22} /></Title>
          
          {loading ? (
            <div className="container"><span>Carregando dados...</span></div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
              gap: '20px' 
            }}>
              {Object.keys(setoresAgrupados).map((nomeSec) => (
                <div key={nomeSec} style={{ 
                  background: '#FFF', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  border: '1px solid #ddd',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  alignSelf: 'start'
                }}>
                  
                  {/* Cabeçalho da Unidade */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #181c2e', paddingBottom: '10px', marginBottom: '15px' }}>
                    {editandoSec === nomeSec ? (
                      <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
                        <input type="text" value={novoNomeSec} onChange={(e) => setNovoNomeSec(e.target.value)} style={{ marginBottom: 0, height: '35px' }} />
                        <button onClick={() => handleUpdateSec(nomeSec)} style={{ background: '#1fcc44', border: 0, padding: '5px 10px', borderRadius: '4px' }}><FiCheck color="#FFF" /></button>
                        <button onClick={() => setEditandoSec(null)} style={{ background: '#999', border: 0, padding: '5px 10px', borderRadius: '4px' }}><FiX color="#FFF" /></button>
                      </div>
                    ) : (
                      <>
                        <h3 style={{ margin: 0, fontSize: '1.1em', ...cellTextStyle, fontWeight: 'bold' }}>{nomeSec}</h3>
                        <div style={{ display: 'flex', gap: '15px' }}>
                          <FiEdit2 size={18} color="#181c2e" cursor="pointer" title="Editar Unidade" onClick={() => { setEditandoSec(nomeSec); setNovoNomeSec(nomeSec); }} />
                          <FiTrash2 size={18} color="#FD441B" cursor="pointer" title="Excluir Unidade" onClick={() => handleDeleteSec(nomeSec)} />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Tabela de Departamentos */}
                  <table style={{ margin: 0, width: '100%' }}>
                    <thead>
                        <tr style={{ background: '#f8f8f8' }}>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Departamento</th>
                            <th style={{ textAlign: 'right', padding: '8px', width: '80px' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                      {setoresAgrupados[nomeSec].map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={cellTextStyle}>
                            {editandoId === item.id ? (
                              <input type="text" value={novoNomeDep} onChange={(e) => setNovoNomeDep(e.target.value)} style={{ marginBottom: 0, padding: '5px' }} />
                            ) : item.departamento}
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px' }}>
                            {editandoId === item.id ? (
                              <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                                <FiCheck size={18} color="green" cursor="pointer" onClick={() => handleUpdateDep(item.id)} />
                                <FiX size={18} color="gray" cursor="pointer" onClick={() => setEditandoId(null)} />
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <FiEdit2 size={15} color="#F6A935" cursor="pointer" title="Editar" onClick={() => { setEditandoId(item.id); setNovoNomeDep(item.departamento); }} />
                                <FiTrash2 size={15} color="#FD441B" cursor="pointer" title="Excluir" onClick={() => deleteDoc(doc(db, 'setores', item.id)).then(() => loadSetores())} />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
