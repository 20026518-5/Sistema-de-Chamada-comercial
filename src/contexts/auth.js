import { useState, createContext, useEffect } from 'react';
import { auth, db } from '../services/firebaseConnection';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext({});

function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser(){
      const storageUser = localStorage.getItem('@ticketsPRO');
      if(storageUser){
        setUser(JSON.parse(storageUser));
        setLoading(false);
      }
      setLoading(false);
    }
    loadUser();
  }, [])

  async function signIn(email, password){
    setLoadingAuth(true);
    await signInWithEmailAndPassword(auth, email, password)
    .then(async (value) => {
      let uid = value.user.uid;
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      let data = {
        uid: uid,
        nome: docSnap.data().nome,
        email: value.user.email,
        avatarUrl: docSnap.data().avatarUrl,
        isadm: docSnap.data().isadm,
        secretaria: docSnap.data().secretaria,
        departamento: docSnap.data().departamento
      };

      setUser(data);
      storageUser(data);
      setLoadingAuth(false);
      toast.success("Bem-vindo de volta!");
      navigate("/dashboard");
    })
    .catch((error) => {
      console.log(error);
      setLoadingAuth(false);
      toast.error("Ops, algo deu errado!");
    })
  }

  async function signUp(email, password, nome, secretaria, departamento){
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
          // Envia verificação de e-mail
          await sendEmailVerification(value.user);
          
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
          toast.success("Cadastro realizado! Verifique seu e-mail.");
          navigate("/dashboard");
        })
    })
    .catch((error) => {
        console.log(error);
        setLoadingAuth(false);
        toast.error("Erro ao cadastrar!");
    })
  }

  function storageUser(data){
    localStorage.setItem('@ticketsPRO', JSON.stringify(data));
  }

  async function logout(){
    await signOut(auth);
    localStorage.removeItem('@ticketsPRO');
    setUser(null);
  }

  // Função para recuperar senha
  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  return(
    <AuthContext.Provider 
      value={{ 
        signed: !!user, 
        user, 
        signIn, 
        signUp, 
        logout, 
        loadingAuth, 
        loading,
        resetPassword // Exportando a função
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;
