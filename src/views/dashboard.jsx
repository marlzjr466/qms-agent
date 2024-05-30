
import { useEffect } from 'react'

// utilities
import { formatQueueNumber, getDate } from '@utilities/helper'
import socket from '@utilities/socket'
import swal from '@utilities/swal'

// components
import ToogleSwitch from '@components/base/toggle-switch'
import NoData from '@components/no-data'

// hooks
// import useTextToSpeech from '@hooks/useTextToSpeech'

function Dashboard () {
  const { metaStates, metaMutations, metaActions } = window.$reduxMeta.useMeta()
  // const { speak } = useTextToSpeech()

  const meta = {
    ...metaStates({
      // app
      session: 'app/session',
      history: 'app/history',
      inqueues: 'app/inqueues',
      ticketsDoneCount: 'app/ticketsDoneCount',
      inqueuesCount: 'app/inqueuesCount',
      currentTicket: 'app/currentTicket',
      showTransferModal: 'app/showTransferModal',
      availCounters: 'app/availCounters',

      // login
      user: 'login/user'
    }),
    
    ...metaMutations('app', [
      'SET_SESSION',
      'SET_SHOW_TRANSFER_MODAL',
      'SET_AVAIL_COUNTERS'
    ]),

    // ...metaGetters('login', ['getAvailCounter']),
    
    ...metaActions('app', [
      'initSession',
      'getHistory',
      'getInQueues',
      'getTicket',
      'doneTicket',
      'transferTicket',
      'initCurrentTicket',
      'getAvailCounter'
    ])
  }

  useEffect(() => {
    initSession(
      meta.user.session
        ? true
        : false
    )

    search()
    meta.initCurrentTicket()
    meta.getAvailCounter()

    // socket listeners
    socket.on('refresh', () => {
      search()
    })

    // transfered ticket
    socket.on(`transfered-ticket:${meta.user.id}`, async data => {
      swal.info({
        title: 'Transfered Ticket',
        text: `Ticket number ${formatQueueNumber(data.ticket)} received from counter ${data.user_id.from}`
      })

      await meta.initCurrentTicket()
    })
  }, [])

  // functions
  const search = async () => {
    try {
      await meta.getHistory()
      await meta.getInQueues()
    } catch (error) {
      swal.error({ text: error.message })
    }
  }

  const initSession = async session => {
    try {
      await meta.initSession(session)
    } catch (error) {
      swal.error({ text: error.message })
    }
  }

  const getTicket = async () => {
    try {
      if (!meta.inqueues.length) {
        return
      }

      const type = meta.currentTicket ? 'next' : 'serve'
      await meta.getTicket(type)
    } catch (error) {
      swal.error({ text: error.message })
    }
  }

  const callAgain = () => {
    if (!meta.currentTicket) {
      return
    }

    socket.emit('call-again', {
      counter: meta.user.id,
      ticket: meta.currentTicket.ticket
    })
  }

  const initTransfer = async () => {
    try {
      if (!meta.currentTicket) {
        return
      }
      
      await meta.getAvailCounter()
      if (!meta.availCounters.length) {
        return swal.warning({
          title: 'Transfer not allowed',
          text: 'No available counter.'
        })
      }

      meta.SET_SHOW_TRANSFER_MODAL(true)
    } catch (error) {
      swal.error({ text: error.message })
    }
  }

  const transfer = (e, id) => {
    e.stopPropagation() // prevent clicking parent element

    swal.prompt({
      async onConfirm () {
        try {
          await meta.transferTicket({ user_id: id })
          meta.SET_SHOW_TRANSFER_MODAL(false)

          socket.emit('transfer-ticket', {
            user_id: {
              to: id,
              from: meta.user.id
            },
            ticket: meta.currentTicket.ticket
          })
          swal.success({ text: 'Transfered successfully!' })
        } catch (error) {
          swal.error({ text: error.message })
        }
      }
    })
  }

  const done = async () => {
    try {
      if (!meta.currentTicket) {
        return
      }

      await meta.doneTicket()
      search()
    } catch (error) {
      swal.error({ text: error.message })
    }
  }

  return (
    <>
      <div className="agent-container__content">
        <div className="tickets">
          <div className="tickets__current">
            <span>current ticket</span>
            {
              meta.currentTicket ? formatQueueNumber(meta.currentTicket.ticket) : <NoData />
            }
          </div>

          <div className="tickets__done">
            <span className="tickets__done--total" tickets-done={25}>
              today&lsquo;s history
            </span>

            {
              meta.history.length
                ? <ul className="tickets__done--list">
                  {
                    meta.history.map((item, i) => {
                      return (
                        <li
                          key={i}
                          ticket-time={getDate('hh:mm A', item.completed_at)}
                          ticket-number={formatQueueNumber(item.ticket)}
                        ></li>
                      )
                    })
                  }
                </ul>
                : <NoData />
            }
          </div>
        </div>

        <div className="body">
          <div className="body__head">
            <div className="body__head--info">
              <div
                className="body__head--info-item"
                info-item-value={meta.user.id}
              >
                counter
              </div>

              <div
                className="body__head--info-item"
                info-item-value={meta.ticketsDoneCount}
              >
                done tickets
              </div>

              <div
                className="body__head--info-item"
                info-item-value={meta.inqueuesCount}
              >
                inqueue
              </div>
            </div>
            
            <div className="body__head--status">
              start session:
              <ToogleSwitch
                model={meta.session}
                onToggle={value => initSession(value)}
              />
            </div>
          </div>

          <div className="body__content">
            <div className="body__content--actions">
              <span className="actions-label">
                actions
              </span>

              {
                meta.session
                  ? <div className="actions-btns">
                    <div
                      className={`
                        actions-btns__item
                        ${ meta.inqueues.length ? '' : 'disabled' }
                      `}
                      onClick={getTicket}
                    >
                      <span><i className="fa fa-arrow-right"></i></span>
                      { meta.currentTicket ? 'next ' : 'get ' }ticket
                    </div>
    
                    <div
                      className={`
                        actions-btns__item
                        ${ meta.currentTicket ? '' : 'disabled' }
                      `}
                      onClick={callAgain}
                    >
                      <span><i className="fa fa-phone"></i></span>
                      call again
                    </div>
    
                    {/* <div className="actions-btns__item">
                      <span><i className="fa fa-plus"></i></span>
                      cancel
                    </div> */}
    
                    <div
                      className={`
                        actions-btns__item
                        ${ meta.currentTicket ? '' : 'disabled' }
                      `}
                      onClick={initTransfer}
                    >
                      <span><i className="fa fa-arrow-down"></i></span>
                      transfer

                      {
                        meta.showTransferModal
                          ? <div className="counter-list">
                            {
                              meta.availCounters.map((item, i) => {
                                return (
                                  <div
                                    key={i}
                                    counter-name="counter"
                                    counter-id={item.id}
                                    className="counter-list__info"
                                    onClick={e => transfer(e, item.id)}
                                  ></div>
                                )
                              })
                            }
                          </div> : ''
                      }
                    </div>
    
                    <div
                      className={`
                        actions-btns__item
                        ${ meta.currentTicket ? '' : 'disabled' }
                      `}
                      onClick={done}
                    >
                      <span><i className="fa fa-check"></i></span>
                      done
                    </div>
                  </div>
                  : <NoData label="Session not started" />
              }
            </div>

            <div className="body__content--inqueue">
              <span className="inqueue-label">
                inqueue
              </span>

              {
                meta.inqueues.length
                  ? <ul className="inqueue-list">
                    {
                      meta.inqueues.map((item, i) => {
                        return (
                          <li key={i}>
                            <span className="ticket">{formatQueueNumber(item.ticket)}</span>
                            {getDate('hh:mm A', item.created_at)}

                            <span className="icon"></span>
                          </li>
                        )
                      })
                    }
                  </ul>
                  : <NoData />
              }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard