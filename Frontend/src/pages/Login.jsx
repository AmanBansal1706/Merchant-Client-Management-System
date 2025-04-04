import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { login } from "../redux/actions";

const LoginWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: #f9f9f7;
`;

const LoginContainer = styled.div`
  width: 100%;
  max-width: 480px;
  padding: 40px;
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 8px 24px var(--shadow), 0 20px 60px rgba(0, 0, 0, 0.1),
    0 0 120px rgba(212, 175, 55, 0.1); /* Golden glow effect */
  border: 1px solid var(--border);
  position: relative;
  backdrop-filter: blur(10px);

  &::before {
    content: "";
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, transparent, rgba(212, 175, 55, 0.1));
    border-radius: 14px;
    z-index: -1;
  }
`;

const MainHeading = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 40px;
  letter-spacing: 1px;
`;

const FormHeading = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent);
  text-align: center;
  margin-bottom: 30px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  color: var(--text-primary);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: var(--accent);
    box-shadow: 0 0 4px rgba(42, 157, 143, 0.2);
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 14px;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  background: var(--accent);
  color: var(--ivory);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 4px 12px var(--shadow);
  transition: background 0.3s ease, transform 0.2s ease;

  &:hover {
    background: var(--highlight);
    transform: translateY(-2px);
  }
`;

const ErrorMessage = styled.p`
  color: #e63946;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 10px;
`;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await dispatch(login(username, password));
      navigate("/clients"); // Changed from "/" to "/clients"
    } catch (err) {
      setError("Invalid username or password. Use 'admin'/'password'.");
    }
  };

  return (
    <LoginWrapper>
      <LoginContainer>
        <MainHeading>Client Management System</MainHeading>
        <FormHeading>Login into your account</FormHeading>
        <Form onSubmit={handleLogin}>
          <div>
            <Label>Username</Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <LoginButton type="submit">Login</LoginButton>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </LoginContainer>
    </LoginWrapper>
  );
};

export default Login;
