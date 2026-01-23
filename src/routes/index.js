import { Routes, Route } from 'react-router-dom';

import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Customers from '../pages/Customers';
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
      
      {/* CORREÇÃO: Alterado de /servidores para /customers para o botão funcionar */}
      <Route path="/customers" element={ <Private><Customers/></Private> } />
      
      <Route path="/new" element={ <Private><New/></Private> } />
      <Route path="/new/:id" element={ <Private><New/></Private> } />
      
      <Route path="/settings" element={ <Private><Settings/></Private> } />
    </Routes>
  )
}

export default RoutesApp;
