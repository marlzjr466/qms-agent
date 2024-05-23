import { useEffect, useState } from 'react'

// utilities
import socket from '@utilities/socket'
import { getDate } from '@utilities/helper'

// images
import Logo from '@assets/images/logo.png'

function Nav () {
  const [date, setDate] = useState(getDate('MMMM Do YYYY, h:mm:ss a'))

  useEffect(() => {
    socket.on('current-date', date => {
      setDate(date)
    })
  }, [])

  return (
    <>
      <div className="agent-container__nav">
        <img className="agent-container__nav--logo" src={Logo} alt="Logo"/>

        <span className="agent-container__nav--date">{ date }</span>

        <div className="agent-container__nav--info">
          <span>
            <i className="fa fa-user"></i>
            Counter 1
          </span>

          <span>
            <i className="fa fa-power-off"></i>
            Logout
          </span>
        </div>
      </div>
    </>
  )
}

export default Nav