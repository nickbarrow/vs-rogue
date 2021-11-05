import { useEffect, useState } from 'react'
import Editor from './components/editor'
import StatusBar from './components/status-bar'
import { getItems, getUserData } from './utils/firebase'
// import './styles.scss'
import './styles.css'
import TitleBar from './components/title-bar'
import Tabs from './components/tabs'

export default function App() {
  const [user, setUser] = useState(null)
  const [itemData, setItemData] = useState(null)
  const [localUserData, setLocalUserData] = useState(null)
  const [tool, setTool] = useState(null)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    // Load item data
    (async function() {
      setItemData(await getItems())
    })()

    // Create consolelog function to intercept console logs.
    window.consolelog = function (message) {
      let log = typeof message === 'object' ? JSON.stringify(message, null, 2) : message
      setLogs((currLogs) => [log, ...currLogs])
      console.log(log)
    }
  }, [])

  // Load user data into local state when user logs in.
  useEffect(() => {
    (async function () {
      if (user && !localUserData)
        setLocalUserData(await getUserData(user.uid))
    })()
  }, [user])
  
  return (
    <div className='App'>
      <TitleBar user={user} setUser={setUser} />
      <Tabs />
      
      <Editor
        user={user}
        itemData={itemData}
        localUserData={localUserData}
        setLocalUserData={setLocalUserData}
        tool={tool}
        />

      <div className='console'>
        <div className='console-toolbar'>
          <div className='console-tab'>Terminal</div>
          <div className='console-tab'>Problems</div>
        </div>
        <div className='logs'>
          {logs.map((log, idx) => <pre className='log' key={idx}>{log}</pre>)}
        </div>
      </div>
      <StatusBar tool={tool} setTool={setTool} />
    </div>
  );
}
