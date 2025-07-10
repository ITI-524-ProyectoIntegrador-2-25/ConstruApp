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
        <div className="col-md-7 d-none d-md-block">
          <Banner />
        </div>
        <div className="col-12 col-md-5">
          <SwitchTransition mode="in-out">
            <CSSTransition
              key={location.pathname}
              nodeRef={nodeRef}
              classNames="fade"
              timeout={400}
              mountOnEnter
              unmountOnExit
              appear
              onEnter={node => { node.style.visibility = 'visible' }}
              onExited={node => { node.style.visibility = 'hidden' }}
            >
              <div ref={nodeRef} className="panel-content">
                <Outlet />
              </div>
            </CSSTransition>
          </SwitchTransition>
        </div>
      </div>
    </div>
  )
}
