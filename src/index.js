import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Importa o CSS global (que vi que você tem na lista de arquivos)
import App from './App'; // Importa o componente App que já configura as rotas e contextos

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
