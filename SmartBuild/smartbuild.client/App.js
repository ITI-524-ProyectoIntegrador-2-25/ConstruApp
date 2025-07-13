// src/App.js
import React, { useMemo } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';
import { SwitchTransition, CSSTransition } from 'react-transition-group';

// Ajusta las rutas a como quedan en tu nuevo árbol
import Banner         from './src/components/pages/access/scripts/Banner';
import LoginForm      from './src/components/pages/access/scripts/LoginForm';
import ForgotPassword from './src/components/pages/access/scripts/ForgotPassword';
import Register       from './src/components/pages/access/scripts/Register';

export function AnimatedPanels() {
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
              <Route path="/"                element={<LoginForm />} />
              <Route path="/register"        element={<Register />} />
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
          {/* Banner visible en md+ */}
          <div className="col-md-7 d-none d-md-block">
            <Banner />
          </div>
          {/* Panel de login */}
          <div className="col-12 col-md-5">
            <AnimatedPanels />
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
