/* eslint-disable react/no-unknown-property */
/* eslint-disable react-hooks/exhaustive-deps */

import { useCallback, useEffect } from 'react'

// utilities
import { formatQueueNumber } from '@utilities/helper'

// components
import Nav from '@components/nav'
import ToogleSwitch from '@components/base/toggle-switch'

// hooks
import useTextToSpeech from '@hooks/useTextToSpeech'

function App () {
  const { metaStates, metaMutations } = window.$reduxMeta.useMeta()
  const { speak } = useTextToSpeech()

  const meta = useCallback({
    ...metaStates('app', [
      'mode',
      'user'
    ]),
    ...metaMutations('app', ['SET_MODE'])
  })

  useEffect(() => {
    // do nothing

    // setTimeout(() => {
    //   meta.SET_MODE('dark')
    // }, 5000)
  }, [])

  return (
    <>
      <div className="main-container">
        <div className={`theme-default ${meta.mode}`}>
          <div className={`agent-container`}>
            <Nav />

            <div className="agent-container__content">
              <div className="tickets">
                <div className="tickets__current">
                  <span>current ticket</span>
                  0043
                </div>

                <div className="tickets__done">
                  <span className="tickets__done--total" tickets-done={25}>
                    history
                  </span>

                  <ul className="tickets__done--list">
                    {
                      Array(20).fill().map((_, i) => {
                        return (
                          <li
                            key={i}
                            ticket-time={'12:00 AM'}
                            ticket-number={formatQueueNumber(i+1)}
                          ></li>
                        )
                      })
                    }
                  </ul>
                </div>
              </div>

              <div className="body">
                <div className="body__head">
                  <div className="body__head--info">
                    <div
                      className="body__head--info-item"
                      info-item-value={1}
                    >
                      counter
                    </div>

                    <div
                      className="body__head--info-item"
                      info-item-value={20}
                    >
                      done tickets
                    </div>

                    <div
                      className="body__head--info-item"
                      info-item-value={20}
                    >
                      inqueue
                    </div>
                  </div>
                  
                  <div className="body__head--status">
                    start session:
                    <ToogleSwitch />
                  </div>
                </div>

                <div className="body__content">
                  <div className="body__content--actions">
                    <span className="actions-label">
                      actions
                    </span>

                    <div className="actions-btns">
                      <div
                        className="actions-btns__item"
                        onClick={() => {
                          speak('Ticket number 0042, please proceed to counter 1')
                        }}
                      >
                        <span><i className="fa fa-arrow-right"></i></span>
                        next ticket
                      </div>

                      <div
                        className="actions-btns__item"
                        onClick={() => {
                          speak('Ticket number 0009, please proceed to counter 1')
                        }}
                      >
                        <span><i className="fa fa-phone"></i></span>
                        call again
                      </div>

                      <div className="actions-btns__item">
                        <span><i className="fa fa-plus"></i></span>
                        cancel
                      </div>

                      <div className="actions-btns__item">
                        <span><i className="fa fa-arrow-down"></i></span>
                        transfer
                      </div>

                      <div className="actions-btns__item">
                        <span><i className="fa fa-check"></i></span>
                        done
                      </div>
                    </div>
                  </div>

                  <div className="body__content--inqueue">
                    <span className="inqueue-label">
                      inqueue
                    </span>

                    <ul className="inqueue-list">
                      {
                        Array(30).fill().map((_, i) => {
                          return (
                            <li key={i}>
                              <span className="ticket">{formatQueueNumber(i+21)}</span>
                              12:48 PM

                              <span className="icon"></span>
                            </li>
                          )
                        })
                      }
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App