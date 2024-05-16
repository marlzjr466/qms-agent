/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect} from 'react'

// views
import Login from '@views/login'

function App () {
  const { metaStates, metaMutations } = window.$reduxMeta.useMeta()

  const meta = useCallback({
    ...metaStates('app', [
      'mode',
      'user'
    ]),
    ...metaMutations('app', ['SET_MODE'])
  })

  useEffect(() => {
    // do nothing
  }, [])

  return (
    <>
      <div className="main-container">
        <div className={`container ${meta.mode}`}>
          {/* <Login /> */}

          <div className={`${meta.mode}__agent-container`}>

          </div>
        </div>
      </div>
    </>
  )
}

export default App