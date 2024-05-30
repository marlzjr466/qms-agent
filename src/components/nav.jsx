import { useEffect, useState } from 'react'

// utilities
import socket from '@utilities/socket'
import swal from '@utilities/swal'
import { getDate, storage } from '@utilities/helper'

// images
import Logo from '@assets/images/logo.png'

function Nav () {
  const { metaStates, metaMutations, metaActions } = window.$reduxMeta.useMeta()

  const meta = {
    ...metaStates({
      user: 'login/user',
      session: 'app/session'
    }),
    ...metaMutations('login', ['SET_USER']),
    ...metaActions('login', ['handleLogout'])
  }
  
  const [date, setDate] = useState(getDate('MMMM Do YYYY, h:mm:ss a'))

  useEffect(() => {
    socket.on('current-date', date => {
      setDate(date)
    })
  }, [])

  const handleLogout = async () => {
    try {
      if (meta.session) {
        throw new Error('You still have ongoing session.')
      }

      await meta.handleLogout()

      // clear users info
      meta.SET_USER(null)
      storage.clear()
    } catch (error) {
      console.log('handleLogout error:', error.message)
      swal.warning({
        title: 'Unable to logout',
        text: error.message
      })
    }
  }

  return (
    <>
      <div className="agent-container__nav">
        <img className="agent-container__nav--logo" src={Logo} alt="Logo"/>

        <span className="agent-container__nav--date">{ date }</span>

        {
          meta.user &&
            <div className="agent-container__nav--info">
              <span
                onClick={handleLogout}
              >
                <i className="fa fa-power-off"></i>
                Logout
              </span>
            </div>
        }
      </div>
    </>
  )
}

export default Nav