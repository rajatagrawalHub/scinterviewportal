import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainPage from './pages/MainPage';
import ChangePassword from './pages/ChangePassword';
import { useEffect, useState } from 'react';
import Logout from './pages/Logout';


function PrivateRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={<PrivateRoute><Dashboard /></PrivateRoute>}
        />
        <Route
          path="/"
          element={<PrivateRoute><Dashboard /></PrivateRoute>}
        />
        <Route  
          path="/main/:id"
          element={<PrivateRoute><MainPage /></PrivateRoute>}
        />
        <Route
          path="/change-password"
          element={<PrivateRoute><ChangePassword /></PrivateRoute>}
        />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  );
}

export default App;
