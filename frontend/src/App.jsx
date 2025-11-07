// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/authContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './Components/Navbar';
import Dashboard from './pages/Dashboard.jsx';

const ProtectedLayout = ()=>{
  return (
    <>
    <Navbar />
    <Dashboard />
    </>
  )
}

// A component to protect routes
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <ProtectedLayout /> {/* <-- Use the layout here */}
          </PrivateRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <h1>Dashboard (Protected)</h1> {/* <== Placeholder */}
          </PrivateRoute>
        } 
      />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/" /> : <Register />} 
      />
    </Routes>
  );
}

export default App;