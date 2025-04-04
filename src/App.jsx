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
    --obsidian: #0a0f12;
    --titanium: #78858b;
    --emerald: #2a9d8f;
    --ivory: #f4f4f9;
    --shadow: rgba(0, 0, 0, 0.25);
    --highlight: #3dc4b5;
  }


  :root {
    --bg-primary: #f9f9f7;
    --bg-secondary: #ffffff;
    --text-primary: var(--obsidian);
    --accent: var(--emerald);
    --border: #d3d8dc;
  }

  body {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
    overflow-x: hidden;
  }

  * {
    box-sizing: border-box;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
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
