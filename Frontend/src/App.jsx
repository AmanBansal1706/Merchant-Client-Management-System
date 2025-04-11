import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { useSelector } from "react-redux";
import styled, { createGlobalStyle } from "styled-components";
import ClientList from "./pages/ClientList";
import AddClient from "./pages/AddClient";
import Login from "./pages/Login";
import ClientDetails from "./pages/ClientDetails";
import { Navigate } from "react-router-dom";

const GlobalStyles = createGlobalStyle`
  :root {
    /* Modern color palette */
    --obsidian: #1a1f2c;
    --titanium: #6b7280;
    --emerald: #10b981;
    --ivory: #f9fafb;
    --shadow: rgba(0, 0, 0, 0.15);
    --highlight: #059669;
    --error: #ef4444;
    --warning: #f59e0b;
    --info: #3b82f6;
    
    /* UI colors */
    --bg-primary: #f3f4f6;
    --bg-secondary: #ffffff;
    --text-primary: var(--obsidian);
    --text-secondary: var(--titanium);
    --accent: var(--emerald);
    --border: #e5e7eb;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    
    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-normal: 250ms ease;
    --transition-slow: 350ms ease;
    
    /* Border radius */
    --radius-sm: 0.25rem;
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;
    --radius-full: 9999px;
  }

  body {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * {
    box-sizing: border-box;
  }
  
  /* Modern scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: var(--bg-primary);
  }
  
  ::-webkit-scrollbar-thumb {
    background: var(--titanium);
    border-radius: var(--radius-full);
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }
  
  /* Focus styles */
  :focus {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  
  :focus:not(:focus-visible) {
    outline: none;
  }
  
  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary), #eef2ff);
  position: relative;
  overflow-y: auto;
`;

function App() {
  const token = useSelector((state) => state.token);

  return (
    <AppContainer>
      <GlobalStyles />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/clients"
            element={token ? <ClientList /> : <Navigate to="/" replace />}
          />
          <Route
            path="/add-client"
            element={token ? <AddClient /> : <Navigate to="/" replace />}
          />
          <Route
            path="/edit-client/:id"
            element={token ? <AddClient /> : <Navigate to="/" replace />}
          />
          <Route
            path="/client/:id"
            element={token ? <ClientDetails /> : <Navigate to="/" replace />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppContainer>
  );
}

export default App;
