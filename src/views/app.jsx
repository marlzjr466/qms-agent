
import { useEffect } from 'react'

// views
import Login from '@views/login'
import Dashboard from '@views/dashboard'

// components
import Nav from '@components/nav'

// utilities
import { storage } from '@utilities/helper'

function App () {
  const { metaStates, metaMutations, metaActions } = window.$reduxMeta.useMeta()

  const meta = {
    ...metaStates({
      mode: 'app/mode',
      showTransferModal: 'app/showTransferModal',
      user: 'login/user'
    }),

    ...metaMutations('app', ['SET_USER']),

    ...metaActions('login', ['getUser'])
  }

  useEffect(() => {
    initUser()
  }, [])

  const initUser = async () => {
    const userId = storage.get('user')

    if (userId) {
      await meta.getUser(userId)
    }
  }

  return (
    <>
      <div className="main-container">
        <div className={`theme-default ${meta.mode}`}>
          <div className={`agent-container`}>
            <Nav />

            {
              meta.user 
                ? <Dashboard />
                : <Login />
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default App