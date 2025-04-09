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

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    padding: 15px;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    padding: 10px;
  }
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

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    padding: 30px;
    border-radius: 10px;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    padding: 25px 20px;
    border-radius: 8px;
  }

  /* Small Mobile (320px and below) */
  @media screen and (max-width: 320px) {
    padding: 20px 15px;
  }
`;

const MainHeading = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 40px;
  letter-spacing: 1px;

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 30px;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    font-size: 1.6rem;
    margin-bottom: 25px;
  }
`;

const FormHeading = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent);
  text-align: center;
  margin-bottom: 30px;

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 25px;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    font-size: 1.2rem;
    margin-bottom: 20px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    gap: 18px;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    gap: 15px;
  }
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 6px;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 5px;
  }
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

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
    opacity: 0.7;
  }

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    padding: 11px 14px;
    font-size: 0.95rem;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    padding: 10px 12px;
    font-size: 0.9rem;
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

  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
    transform: none;
  }

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    padding: 12px;
    font-size: 1rem;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    padding: 11px;
    font-size: 0.95rem;
  }
`;

const ErrorMessage = styled.p`
  color: #e63946;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 10px;

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    font-size: 0.85rem;
    margin-top: 8px;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    font-size: 0.8rem;
    margin-top: 6px;
  }
`;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);
    try {
      await dispatch(login(username, password));
      navigate("/clients"); // Changed from "/" to "/clients"
    } catch (err) {
      setError("Invalid username or password. Use 'admin'/'password'.");
      setIsLoggingIn(false);
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
              disabled={isLoggingIn}
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoggingIn}
            />
          </div>
          <LoginButton type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? "Logging in..." : "Login"}
          </LoginButton>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </LoginContainer>
    </LoginWrapper>
  );
};

export default Login;
