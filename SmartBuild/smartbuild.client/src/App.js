// src/App.js
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles.css'
import Banner from './components/Banner'
import LoginForm from './components/LoginForm'
import ForgotPassword from './components/ForgotPassword'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de Olvidé mi contraseña */}
        <Route
          path="/forgot-password"
          element={
            <div className="container">
              <Banner />
              <div className="login-panel">
                <ForgotPassword />
              </div>
            </div>
          }
        />
        {/* Ruta del login */}
        <Route
          path="/"
          element={
            <div className="container">
              <Banner />
              <div className="login-panel">
                <LoginForm />
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
