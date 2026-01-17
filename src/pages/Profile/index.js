import { FiSettings, FiUpload, FiCode, FiLayers, FiCheckCircle, FiUserCheck, FiGithub } from "react-icons/fi";
import Header from "../../components/Header";
import Title from "../../components/Title";
import avatar from '../../assets/avatar.png';
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/auth";
import './profile.css';
import { toast } from "react-toastify";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../services/firebaseConnection";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function Profile(){

  const { user,logOut,storageUser,setUser } = useContext(AuthContext);
  const [nome,setNome] = useState(user && user.nome);
  const [email,setEmail] = useState(user && user.email);
  const [imageAvatar,setImageAvatar] = useState(null);
  const [avatarUrl,setAvatarUrl] = useState(user && user.avatarUrl);
 
  const handleFile = (e) =>{
    if(e.target.files[0]) {
      const image = e.target.files[0];
      if(image.type ==='image/png'|| image.type ==='image/jpeg'){
        setImageAvatar(image);
        setAvatarUrl(URL.createObjectURL(image));
    }
  }else{
    toast.error('envie uma imagem do tipo PNG/JPEG');
    setImageAvatar(null);
    return;
  }
  }

  const handleUpload = async (e) =>{
    const currentUid = user.uid;
    const uploadRef = ref(storage,`images/${currentUid}/${imageAvatar.name}`);

    uploadBytes(uploadRef,imageAvatar)
    .then((snapshot)=>{
      getDownloadURL(snapshot.ref).then(async(dowloadUrl)=>{
        const docRef = doc(db,'users',user.uid);
        await updateDoc(docRef,{
          avatarUrl:dowloadUrl,
          nome:nome,
        })
        .then(()=>{
          let data ={
            ...user,
            nome:nome,
            avatarUrl:dowloadUrl,
          }
          setUser(data);
          storageUser(data);
          toast.success('atualizado com sucesso!')
        })
        .catch(()=>toast.error('não foi possível atualizar'))
      })
    })
    .catch(()=>toast.error('erro'))
  }

  const handleSubmit = async (e) =>{
    e.preventDefault();
    if(imageAvatar === null && nome !==''){
      const docRef = doc(db,'users',user.uid);
      updateDoc(docRef,{
        nome:nome,
      })
      .then(()=>{
        let data ={
          ...user,
          nome:nome,
        }
        setUser(data);
        storageUser(data);
        toast.success('atualizado com sucesso!');
      })
      .catch(()=>toast.error('não foi possível atualizar'))
  }
  else if (imageAvatar !== null && nome !==''){
    handleUpload();
  }
}

  // Estilo do rodapé interno
  const footerStyle = {
    marginTop: '50px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    color: 'var(--text-color)',
    opacity: 0.6,
    fontSize: '0.8rem',
    textAlign: 'center',
    width: '100%'
  };

  const footerItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    justifyContent: 'center'
  };

  return(
    <div>
      <Header/>

      <div className="content">
        <Title name="Minha conta">
          <FiSettings size={25} />
        </Title>

       <div className="container">
        <form className="form-profile" onSubmit={handleSubmit}>
          <label className="label-avatar">
            <span>
              <FiUpload color="#FFF" size={25} />
            </span>
            <input type="file" accept="image/*" onChange={handleFile}/> <br/>
            {avatarUrl === null ? (
              <img src={avatar} alt="Foto de perfil" width={150} height={150} />
            ) : (
              <img src={avatarUrl} alt="Foto de perfil" width={150} height={150} />
            )}
          </label>

          <label>Nome</label>
          <input 
          type="text" 
          value={nome} 
          onChange={(e)=>setNome(e.target.value)} 
          />

          <label>Email</label>
          <input 
          type="text" 
          value={email} 
          disabled={true} 
          />
          
          <button type="submit">Salvar</button>
        </form>
       </div>

       <footer>
         <button className="logout-btn" onClick={logOut}>Sair</button>
       </footer>

       {/* RODAPÉ INTERNO DISCRETO */}
       <div style={footerStyle}>
           <div style={footerItemStyle}><FiCode size={14}/> Dev: <strong>Bruna Eduarda</strong> | <FiLayers size={14}/> Projeto original GitHub</div>
           <div style={footerItemStyle}><FiUserCheck size={14}/> Adaptado por: <strong>Lucas Vinicius Sampaio Lima</strong></div>
           <div style={footerItemStyle}><FiGithub size={14}/> <a href="https://github.com/20026518-5" target="_blank" rel="noreferrer" style={{color: 'inherit'}}>GitHub: 20026518-5</a> | <FiCheckCircle size={14}/> Licença MIT</div>
        </div>

      </div>
    </div>
)}
