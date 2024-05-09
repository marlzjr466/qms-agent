/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback } from 'react'

function App () {
  const { metaStates } = window.$reduxMeta.useMeta()

  const meta = useCallback({
    ...metaStates('app', ['mode'])
  })

  return (
    <>
      <div className="main-container">
        <div className={`${meta.mode}`}>
          <h1>Agent view</h1>
        </div>
      </div>
    </>
  )
}

export default App