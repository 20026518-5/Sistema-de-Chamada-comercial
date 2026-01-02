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
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

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
      toast.success("Unidade cadastrada!");
      setSecretaria('');
      setListaDepartamentos([]);
      loadSetores();
    } catch (error) { toast.error("Erro ao salvar."); }
  }

  async function handleDeleteSec(nomeSec) {
    if(!window.confirm(`Excluir "${nomeSec}" e todos os departamentos?`)) return;
    try {
      const batch = writeBatch(db);
      const itens = setores.filter(s => s.secretaria === nomeSec);
      itens.forEach(item => batch.delete(doc(db, 'setores', item.id)));
      await batch.commit();
      toast.success("Excluído com sucesso!");
      loadSetores();
    } catch (error) { toast.error("Erro ao excluir."); }
  }

  async function handleUpdateSec(antigoNome) {
    if(novoNomeSec === '' || novoNomeSec === antigoNome) { setEditandoSec(null); return; }
    try {
      const batch = writeBatch(db);
      const itens = setores.filter(s => s.secretaria === antigoNome);
      itens.forEach(item => batch.update(doc(db, 'setores', item.id), { secretaria: novoNomeSec }));
      await batch.commit();
      toast.success("Atualizado!");
      setEditandoSec(null);
      loadSetores();
    } catch (error) { toast.error("Erro ao atualizar."); }
  }

  async function handleUpdateDep(id) {
    if(novoNomeDep === '') return;
    try {
      await updateDoc(doc(db, 'setores', id), { departamento: novoNomeDep });
      toast.success("Departamento atualizado!");
      setEditandoId(null);
      loadSetores();
    } catch (error) { toast.error("Erro ao atualizar."); }
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

        {/* Container Flex para os dois blocos principais */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* BLOCO 1: CADASTRO (Lado Esquerdo) */}
          <div className="container" style={{ flex: '1', minWidth: '320px', margin: 0 }}>
            <h2 style={{ marginBottom: '15px', fontSize: '1.1em' }}>Novo Cadastro</h2>
            <div className="form-profile">
              <label>Nome da Unidade</label>
              <input type="text" value={secretaria} onChange={(e) => setSecretaria(e.target.value)} placeholder="Ex: Secretaria de Saúde" />
              
              <div style={{ marginTop: '10px' }}>
                <label>Departamentos</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" value={departamentoInput} onChange={(e) => setDepartamentoInput(e.target.value)} style={{ flex: 1, marginBottom: 0 }} placeholder="Adicionar departamento" />
                  <button onClick={(e) => { e.preventDefault(); if(departamentoInput) { setListaDepartamentos([...listaDepartamentos, departamentoInput]); setDepartamentoInput(''); } }} style={{ width: '40px', height: '40px', backgroundColor: '#181c2e' }}>
                    <FiPlus size={18} color="#FFF" />
                  </button>
                </div>
              </div>

              {listaDepartamentos.length > 0 && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#eee', borderRadius: '4px', maxHeight: '150px', overflowY: 'auto' }}>
                  {listaDepartamentos.map((dep, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #ddd' }}>
                      <span style={{ fontSize: '0.85em' }}>{dep}</span>
                      <FiX color="red" cursor="pointer" onClick={() => setListaDepartamentos(listaDepartamentos.filter((_, idx) => idx !== i))} />
                    </div>
                  ))}
                </div>
              )}
              
              <button onClick={handleSaveAll} style={{ marginTop: '15px', backgroundColor: '#1fcc44', padding: '10px' }}>Salvar Unidade</button>
            </div>
          </div>

          {/* BLOCO 2: LISTAGEM (Lado Direito) */}
          <div className="container" style={{ flex: '2', minWidth: '450px', margin: 0, maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '1.1em' }}><FiList size={18} style={{ marginRight: 8 }} /> Unidades Cadastradas</h2>
            
            {loading ? <span>Carregando...</span> : Object.keys(setoresAgrupados).length === 0 ? <span>Nenhum registro.</span> : 
              Object.keys(setoresAgrupados).map((nomeSec) => (
                <div key={nomeSec} style={{ marginBottom: '20px', background: '#FFF', padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }}>
                  
                  {/* Título da Secretaria Editável */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #181c2e', paddingBottom: '5px', marginBottom: '10px' }}>
                    {editandoSec === nomeSec ? (
                      <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
                        <input type="text" value={novoNomeSec} onChange={(e) => setNovoNomeSec(e.target.value)} style={{ marginBottom: 0, height: '30px' }} />
                        <button onClick={() => handleUpdateSec(nomeSec)} style={{ background: '#1fcc44', border: 0, borderRadius: '4px' }}><FiCheck color="#FFF" /></button>
                        <button onClick={() => setEditandoSec(null)} style={{ background: '#999', border: 0, borderRadius: '4px' }}><FiX color="#FFF" /></button>
                      </div>
                    ) : (
                      <>
                        <h4 style={{ margin: 0, ...cellTextStyle, fontWeight: 'bold' }}>{nomeSec}</h4>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <FiEdit2 size={16} color="#181c2e" cursor="pointer" onClick={() => { setEditandoSec(nomeSec); setNovoNomeSec(nomeSec); }} />
                          <FiTrash2 size={16} color="#FD441B" cursor="pointer" onClick={() => handleDeleteSec(nomeSec)} />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Tabela Interna compacta */}
                  <table style={{ margin: 0, fontSize: '0.85em' }}>
                    <tbody>
                      {setoresAgrupados[nomeSec].map((item) => (
                        <tr key={item.id}>
                          <td style={cellTextStyle}>
                            {editandoId === item.id ? (
                              <input type="text" value={novoNomeDep} onChange={(e) => setNovoNomeDep(e.target.value)} style={{ marginBottom: 0, height: '25px' }} />
                            ) : item.departamento}
                          </td>
                          <td style={{ width: '80px', textAlign: 'right' }}>
                            {editandoId === item.id ? (
                              <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                <FiCheck size={16} color="green" cursor="pointer" onClick={() => handleUpdateDep(item.id)} />
                                <FiX size={16} color="gray" cursor="pointer" onClick={() => setEditandoId(null)} />
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <FiEdit2 size={14} color="#F6A935" cursor="pointer" onClick={() => { setEditandoId(item.id); setNovoNomeDep(item.departamento); }} />
                                <FiTrash2 size={14} color="#FD441B" cursor="pointer" onClick={() => deleteDoc(doc(db, 'setores', item.id)).then(() => loadSetores())} />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            }
          </div>

        </div> {/* Fim do Flex Container */}
      </div>
    </div>
  );
}
