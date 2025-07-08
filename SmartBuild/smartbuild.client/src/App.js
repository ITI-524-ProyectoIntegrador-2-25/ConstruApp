import React, { useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import './styles.css'
import Banner from './components/pages/Banner'
import LoginForm from './components/pages/LoginForm'
import ForgotPassword from './components/pages/ForgotPassword'

function AnimatedPanels() {
  const location = useLocation()
  const nodeRef = useRef(null)

  return (
    <div className="login-panel">
      <TransitionGroup component={null}>
        <CSSTransition
          key={location.pathname}
          classNames="fade"
          timeout={400}
          nodeRef={nodeRef}
        >
          <div ref={nodeRef} className="panel-content">
            <Routes location={location}>
              <Route path="/" element={<LoginForm />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
          </div>
        </CSSTransition>
      </TransitionGroup>
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
