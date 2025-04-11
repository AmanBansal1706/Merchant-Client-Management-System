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
  background: linear-gradient(135deg, var(--bg-primary), #eef2ff);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0) 70%);
    animation: rotate 30s linear infinite;
    z-index: 0;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

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
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  transform: translateY(0);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 30px rgba(0, 0, 0, 0.1);
  }

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    padding: 30px;
    border-radius: var(--radius-lg);
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    padding: 25px 20px;
    border-radius: var(--radius-md);
  }

  /* Small Mobile (320px and below) */
  @media screen and (max-width: 320px) {
    padding: 20px 15px;
  }
`;

const MainHeading = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 40px;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, var(--accent), var(--highlight));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 30px;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    font-size: 1.75rem;
    margin-bottom: 25px;
  }
`;

const FormHeading = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 30px;
  letter-spacing: -0.01em;

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
  gap: 24px;

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    gap: 20px;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    gap: 18px;
  }
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  display: block;
  letter-spacing: -0.01em;

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 6px;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    font-size: 0.85rem;
    margin-bottom: 5px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  font-size: 1rem;
  color: var(--text-primary);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  outline: none;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);

  &:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
    opacity: 0.7;
  }

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
  }

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    padding: 12px 14px;
    font-size: 0.95rem;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    padding: 11px 12px;
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
  border-radius: var(--radius-md);
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s;
  }

  &:hover {
    background: var(--highlight);
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3);
  }

  &:hover::before {
    transform: translateX(100%);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: var(--titanium);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
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
  color: var(--error);
  font-size: 0.9rem;
  text-align: center;
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--error);

  /* Tablet (768px and below) */
  @media screen and (max-width: 768px) {
    font-size: 0.85rem;
    margin-top: 8px;
    padding: 8px;
  }

  /* Mobile (480px and below) */
  @media screen and (max-width: 480px) {
    font-size: 0.8rem;
    margin-top: 6px;
    padding: 6px;
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
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoggingIn}
              autoComplete="username"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoggingIn}
              autoComplete="current-password"
              placeholder="Enter your password"
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
