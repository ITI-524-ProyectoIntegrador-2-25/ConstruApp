// src/components/layout/AccessLayout.jsx
import React, { useRef } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { SwitchTransition, CSSTransition } from 'react-transition-group'
import Banner from '../pages/access/scripts/Banner'

export default function AccessLayout() {
  const location = useLocation()
  const nodeRef  = useRef(null)

  return (
    <div className="container">
      <div className="row">
        {/* Banner siempre visible */}
        <div className="col-md-7 d-none d-md-block">
          <Banner />
        </div>
        {/* Aquí inyectamos los formularios con animación */}
        <div className="col-12 col-md-5">
          <SwitchTransition mode="out-in">
            <CSSTransition
              key={location.pathname}
              nodeRef={nodeRef}
              classNames="fade"
              timeout={400}
              mountOnEnter
              unmountOnExit
            >
              <div ref={nodeRef}>
                <Outlet />
              </div>
            </CSSTransition>
          </SwitchTransition>
        </div>
      </div>
    </div>
  )
}
