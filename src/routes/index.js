/* src/routes/index.js */
import { Routes, Route } from 'react-router-dom';

import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Servidores from '../pages/Customers'; // O componente que editamos chama Servidores
import Private from './private';

function RoutesApp(){
  return(
    <Routes>
      <Route path="/" element={ <SignIn/> } />
      <Route path="/register" element={ <SignUp/> } />
      
      <Route path="/dashboard" element={ <Private><Dashboard/></Private> } />
      <Route path="/profile" element={ <Private><Profile/></Private> } />
      
      {/* VERIFIQUE SE ESTA LINHA EXISTE E SE O CAMINHO ESTÁ CORRETO */}
      <Route path="/customers" element={ <Private><Servidores/></Private> } />
    </Routes>
  )
}

export default RoutesApp;
