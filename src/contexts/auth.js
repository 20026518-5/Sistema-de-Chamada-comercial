import { useState, createContext, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../services/firebaseConnection';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail 
} from 'firebase/auth';

export const AuthContext = createContext({});


function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email); // Funcionalidade 2
}

  useEffect(() => {
    async function loadUser(){
      const storageUser = localStorage.getItem('@userdata');
      if(storageUser){
        setUser(JSON.parse(storageUser));
      }
      setLoading(false);
    }
    loadUser();
  }, [])

 async function signUp(email, password, nome, secretaria, departamento) {
  setLoadingAuth(true);
  await createUserWithEmailAndPassword(auth, email, password)
    .then(async (value) => {
      let uid = value.user.uid;
      await setDoc(doc(db, "users", uid), {
        nome: nome,
        avatarUrl: null,
        isadm: false,
        secretaria: secretaria,
        departamento: departamento
      })
      .then(async () => {
        await sendEmailVerification(value.user); // Funcionalidade 1
        
        let data = {
          uid: uid,
          nome: nome,
          email: value.user.email,
          avatarUrl: null,
          isadm: false,
          secretaria: secretaria,
          departamento: departamento
        };
        setUser(data);
        storageUser(data);
        setLoadingAuth(false);
        toast.success("Bem vindo! Verifique seu e-mail para validar a conta.");
      })
    })
    .catch((error) => {
      console.log(error);
      setLoadingAuth(false);
      toast.error("Erro ao cadastrar.");
    })
}

  async function signIn(email, password) {
    setLoadingAuth(true);
    try {
      const value = await signInWithEmailAndPassword(auth, email, password);
      const uid = value.user.uid;

      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      const data = {
        uid: uid,
        nome: docSnap.data().nome,
        email: value.user.email,
        avatarUrl: docSnap.data().avatarUrl,
        secretaria: docSnap.data().secretaria,
        departamento: docSnap.data().departamento,
        isadm: docSnap.data().isadm, // Busca o campo isadm do banco
      };

      setUser(data);
      storageUser(data);
      setLoadingAuth(false);
      toast.success('Bem-vindo de volta');
      navigate('/dashboard');

    } catch (err) {
      console.error(err);
      toast.error('Ops, algo deu errado.');
      setLoadingAuth(false);
    }
  }

  function storageUser(data){
    localStorage.setItem('@userdata', JSON.stringify(data));
  }

  async function logOut() {
    await signOut(auth);
    localStorage.removeItem('@userdata');
    setUser(null);
  }

  return(
    <AuthContext.Provider value={{ signed: !!user, user, signIn, signUp, loadingAuth, loading, logOut, setUser, storageUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;
