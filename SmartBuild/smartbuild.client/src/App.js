import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import Banner from './components/pages/Banner';
import LoginForm from './components/pages/LoginForm';
import ForgotPassword from './components/pages/ForgotPassword';
import Register from './components/pages/Register';
import './styles.css';

function AnimatedPanels() {
  const location = useLocation();
  const nodeRefs = useMemo(() => ({
    '/': React.createRef(),
    '/register': React.createRef(),
    '/forgot-password': React.createRef(),
  }), []);
  const ref = nodeRefs[location.pathname] || React.createRef();

  return (
    <div className="login-panel">
      <SwitchTransition mode="out-in">
        <CSSTransition
          key={location.pathname}
          nodeRef={ref}
          classNames="fade"
          timeout={400}
          mountOnEnter
          unmountOnExit
        >
          <div ref={ref} className="panel-content">
            <Routes location={location}>
              <Route path="/" element={<LoginForm />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <div className="row">
          {/* Banner: visible solo en pantallas ≥1400px (xxl) */}
          <div className="col-xxl-7 d-none d-xxl-block">
            <Banner />
          </div>
          {/* Panel: ocupa 100% en <1400px, 5/12 en ≥1400px */}
          <div className="col-12 col-xxl-5">
            <AnimatedPanels />
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}