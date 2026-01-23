/* src/contexts/ThemeContext.js */
import { useState, createContext, useEffect } from 'react';

export const ThemeContext = createContext({});

export default function ThemeProvider({ children }) {
  // Tenta pegar do localStorage ou usa 'light' como padrão
  const [theme, setTheme] = useState(localStorage.getItem('sistema_theme') || 'light');

  useEffect(() => {
    // Atualiza o atributo no HTML e salva no storage
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
