import { BrowserRouter } from 'react-router-dom';
import RoutesApp from './routes';
import AuthProvider from './contexts/auth';
import ThemeProvider from './contexts/ThemeContext'; // Importante: verifique se o caminho está correto
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider> {/* O ThemeProvider deve ficar AQUI */}
          <ToastContainer autoClose={3000} />
          <RoutesApp />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
