import { useEffect, useState } from 'react'
import Editor from './components/editor'
import StatusBar from './components/status-bar'
import { getItems } from './utils/firebase'
import './styles.scss'
import TitleBar from './components/title-bar'

export default function App() {
  const [user, setUser] = useState(null)
  // Need better editing state management
  const [tool, setTool] = useState(null)
  const [itemData, setItemData] = useState(null)
  
  useEffect(() => {
    // onAuthStateChanged(auth, (newUser) => {
    //   if (newUser) setUser(newUser)
    //   else setUser(null)
    // });

    // Load item data
    async function loadItems() {
      setItemData(await getItems())
    }
    loadItems()
  }, [])
  
  return (
    <div className='App'>
      <TitleBar user={user} setUser={setUser} />
      
      <Editor
        user={user}
        itemData={itemData}
        tool={tool}
        />

      <StatusBar tool={tool} setTool={setTool} />
    </div>
  );
}
