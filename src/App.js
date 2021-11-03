import { useEffect, useState } from 'react'
import Editor from './components/editor'
import StatusBar from './components/status-bar'
import { getItems, getUserData } from './utils/firebase'
import './styles.scss'
import TitleBar from './components/title-bar'
import Tabs from './components/tabs'

export default function App() {
  const [user, setUser] = useState(null)
  const [itemData, setItemData] = useState(null)
  const [localUserData, setLocalUserData] = useState(null)
  const [tool, setTool] = useState(null)

  useEffect(() => {
    // Load item data
    (async function() {
      setItemData(await getItems())
    })()
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

      <StatusBar tool={tool} setTool={setTool} />
    </div>
  );
}
