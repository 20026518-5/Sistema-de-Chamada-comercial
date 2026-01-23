import { useState, createContext, useEffect } from 'react';

// Exportação do Contexto
export const ThemeContext = createContext({});

// Exportação do Provider (Componente)
export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem('sistema_theme') || 'light');

  useEffect(() => {
    // Aplica o atributo ao HTML e salva no navegador
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sistema_theme', theme);
  }, [theme]);

  function toggleTheme(newTheme) {
    setTheme(newTheme);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
