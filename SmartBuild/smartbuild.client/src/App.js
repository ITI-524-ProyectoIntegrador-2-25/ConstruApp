import React, { useRef } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from 'react-router-dom'
import { SwitchTransition, CSSTransition } from 'react-transition-group'

import './styles.css'

import Banner from './components/pages/Banner'
import LoginForm from './components/pages/LoginForm'
import ForgotPassword from './components/pages/ForgotPassword'
import Register from './components/pages/Register'

function AnimatedPanels() {
  const location = useLocation()
  const nodeRef = useRef(null)

  return (
    <div className="login-panel">
      <SwitchTransition mode="out-in">
        <CSSTransition
          key={location.pathname}
          classNames="fade"
          timeout={400}
          mountOnEnter
          unmountOnExit
          nodeRef={nodeRef}
        >
          <div ref={nodeRef} className="panel-content">
            <Routes location={location}>
              <Route path="/" element={<LoginForm />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <Banner />
        <AnimatedPanels />
      </div>
    </BrowserRouter>
  )
}
