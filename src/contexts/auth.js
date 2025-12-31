import { useState, createContext, useEffect } from 'react';
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import {auth,db} from '../services/firebaseConnection';
import {
  doc,      //acessar documento
  getDoc,  //pegar documento
  setDoc, //criar documento
} from 'firebase/firestore';
import {  useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const AuthContext = createContext({});

function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [loadingAuth,setLoadingAuth] = useState(false);
  const [loading,setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser(){
      const storageUser = localStorage.getItem('@userdata');

      if(storageUser){
        setUser(JSON.parse(storageUser))
        setLoading(false);
      }


      setLoading(false);

    }

    loadUser();
  }, [])

// Adicione secretaria e departamento aos parâmetros
async function signUp(name, email, password, secretaria, departamento) {
  setLoadingAuth(true);

  try {
    const value = await createUserWithEmailAndPassword(auth, email, password);
    const uid = value.user.uid;

    // Grava no Firestore com os novos campos e o papel 'user'
    await setDoc(doc(db, 'users', uid), {
      nome: name,
      avatarUrl: null,
      secretaria: secretaria,
      departamento: departamento,
      role: 'user', // Define como usuário comum por padrão
    });

    const data = {
      uid: uid,
      nome: name,
      email: email,
      avatarUrl: null,
      secretaria: secretaria,
      departamento: departamento,
      role: 'user',
    };

    setUser(data);
    storageUser(data);
    setLoadingAuth(false);
    toast.success('Cadastrado com sucesso');
    navigate('/dashboard');

  } catch (err) {
    console.error('Erro ao cadastrar:', err);
    toast.error('Erro ao cadastrar usuário.');
    setLoadingAuth(false);
  }
}

// Atualize o signIn para buscar esses novos campos também
async function signIn(email, password) {
  setLoadingAuth(true);

  try {
    const value = await signInWithEmailAndPassword(auth, email, password);
    const uid = value.user.uid;

    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    // Recupera todos os dados salvos no cadastro
    const data = {
      uid: uid,
      nome: docSnap.data().nome,
      email: value.user.email,
      avatarUrl: docSnap.data().avatarUrl,
      secretaria: docSnap.data().secretaria,
      departamento: docSnap.data().departamento,
      role: docSnap.data().role,
    };

    setUser(data);
    storageUser(data);
    setLoadingAuth(false);
    toast.success('Bem-vindo de volta');
    navigate('/dashboard');

  } catch (err) {
    console.error('Erro ao logar:', err);
    toast.error('Ops, algo deu errado. Verifique suas credenciais.');
    setLoadingAuth(false);
  }
}

  function storageUser(data){
    localStorage.setItem('@userdata',JSON.stringify(data));
  }

  async function logOut() {
    await signOut(auth);
    localStorage.removeItem('@userdata');
    setUser(null);
  }

return(
  <AuthContext.Provider 
    value={{
      signed: !!user,
      user,
      signIn,
      signUp, // Deve estar aqui
      loadingAuth,
      loading,
      logOut,
      storageUser,
      setUser,
    }}
  >
    {children}
  </AuthContext.Provider>
)
}

export default AuthProvider;
