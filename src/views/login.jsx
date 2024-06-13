import { useEffect, useState } from "react"

// utilities
import { storage } from '@utilities/helper'

// components
import NoData from '@components/no-data'

function Login () {
  const { metaStates, metaActions } = window.$reduxMeta.useMeta()

  const meta = {
    ...metaStates('login', ['counters']),

    ...metaActions('login', [
      'getCounters',
      'handleLogin'
    ])
  }

  const [selected, setSelected] = useState([])
  const [selectedId, setSelectedId] = useState(0)
  async function search () {
    await meta.getCounters()

    const temp = []
    meta.counters.forEach((_, i) => {
      temp[i] = false
    })

    setSelected(temp)
  }

  useEffect(() => {
    search()
  }, [])

  const selectCounter = (item, i) => {
    if (item.status) {
      return
    }

    const temp = selected
    let id = item.id, bool = true

    if (temp[i]) {
      bool = false
      id = 0
    }

    temp.fill(false)
    temp[i] = bool

    setSelectedId(id)
    setSelected(temp)
  }

  const handleLogin = async () => {
    try {
      if (!selectedId) {
        return
      }
      
      await meta.handleLogin(selectedId)
      storage.set('user', selectedId)
    } catch (error) {
      console.log('handleLogin error:', error)
    }
  }

  return (
    <>
      <div className="login-container">
        <div className="login-container__title">
          Agent Dashboard
        </div>

        <div className="login-container__label">
          Choose account to login:
        </div>

        {
          meta.counters.length
            ? <ul className="login-container__list">
              {
                meta.counters.map((item, i) => {
                  return (
                    <li
                      key={i}
                      className={`
                        ${ item.status ? 'disabled': '' }
                        ${ selected[i] ? 'selected': '' }
                      `}
                      counter-name={item.name}
                      counter-value={`C-${item.id}`}
                      onClick={() => selectCounter(item, i)}
                    ></li>
                  )
                })
              }
            </ul>
            : <NoData label="No available accounts"/>
        }

        <button
          className={`
            login-container__btn
            ${ selectedId ? '' : 'disabled' }
          `}
          onClick={handleLogin}
        >Login</button>
      </div>
    </>
  )
}

export default Login