import { Routes, Route } from 'react-router-dom';

import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Customers from '../pages/Customers';
import Servidores from '../pages/Servidores'; // <--- VERIFIQUE ESTA IMPORTAÇÃO
import New from '../pages/New';
import Settings from '../pages/Settings'; 
import Private from './private';

function RoutesApp(){
  return(
    <Routes>
      <Route path="/" element={ <SignIn/> } />
      <Route path="/register" element={ <SignUp/> } />

      <Route path="/dashboard" element={ <Private><Dashboard/></Private> } />
      <Route path="/profile" element={ <Private><Profile/></Private> } />
      
      {/* Rota de Secretarias (antiga Customers) */}
      <Route path="/customers" element={ <Private><Customers/></Private> } />

      {/* Rota de Servidores (VERIFIQUE SE ESTA LINHA EXISTE) */}
      <Route path="/servidores" element={ <Private><Servidores/></Private> } />
      
      <Route path="/new" element={ <Private><New/></Private> } />
      <Route path="/new/:id" element={ <Private><New/></Private> } />
      
      <Route path="/settings" element={ <Private><Settings/></Private> } />
    </Routes>
  )
}

export default RoutesApp;
