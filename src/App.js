import { useEffect, useState } from 'react'
import { getItems, getUserData } from './utils/firebase'

// import Editor from './components/editor'
// import StatusBar from './components/status-bar'
// import TitleBar from './components/title-bar'
// import Tabs from './components/tabs'

import MainWindow from './components/MainWindow'
import './styles.scss'

export default function App() {
  const [user, setUser] = useState(null)
  const [itemData, setItemData] = useState(null)
  const [localUserData, setLocalUserData] = useState(null)
  const [tool, setTool] = useState(null)
  // const [logs, setLogs] = useState([])

  useEffect(() => {
    // Load item data
    (async function() {
      setItemData(await getItems())
    })()

    /*
    // Create console.log function to intercept console logs.
    let oldCL = window.console.log
    window.console.log = function (message) {
      let log = typeof message == 'object' ? JSON.stringify(message, null, 2) : message
      setLogs((currLogs) => [log, ...currLogs])
      oldCL(log)
    }
    */
  }, [])

  // Load user data into local state when user changes.
  useEffect(() => {
    (async function () {
      // App loaded, user logged in, no local user data (either not loaded or null).
      if (user && (!localUserData || Object.keys(localUserData).length === 0))
        setLocalUserData(await getUserData(user.uid))
    })()
    // Im assuming localUserData is a dep in case we want to wipe while playing
  }, [user, localUserData])
  
  return (
    <div className='App'>
      <MainWindow
        user={user} setUser={setUser}
        localUD={localUserData} setLocalUD={setLocalUserData}
        itemData={itemData}
        tool={tool}
        />
    </div>

    // <div className='App'>
    //   <TitleBar user={user} setUser={setUser} />
    //   <Tabs />
      
    //   <Editor
    //     user={user}
    //     itemData={itemData}
    //     localUserData={localUserData}
    //     setLocalUserData={setLocalUserData}
    //     tool={tool}
    //     />

    //   <div className='console'>
    //     <div className='console-toolbar'>
    //       <div className='console-tab'>Terminal</div>
    //       <div className='console-tab'>Problems</div>
    //     </div>
    //     <div className='logs'>
    //       {logs.map((log, idx) => <pre className='log' key={idx}>{log}</pre>)}
    //     </div>
    //   </div>
    //   <StatusBar tool={tool} setTool={setTool} />
    // </div>
  );
}
