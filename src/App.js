import { useEffect, useState } from 'react'
import Editor from './components/editor'
import StatusBar from './components/status-bar'
import MapEditContext from './utils/MapEditContext'
import { auth, getItems } from './utils/firebase'
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import './styles.scss'

export default function App() {
  const [user, setUser] = useState(null)
  // Need better editing state management
  const [tool, setTool] = useState(null)
  const [itemData, setItemData] = useState(null)
  const provider = new GoogleAuthProvider()
  
  useEffect(() => {
    onAuthStateChanged(auth, (newUser) => {
      if (newUser) setUser(newUser)
      else setUser(null)
    });

    // Load item data
    async function loadItems() {
      setItemData(await getItems())
    }
    loadItems()
  }, [])
  
  return (
    <MapEditContext.Provider value={{ editing: false }}>
      <div className='App'>
        <div style={{display: 'flex', alignItems: 'center', borderBottom: '1px solid #1B1F23', height: '50px'}}>
          <h1 style={{color: 'white', display: 'inline', margin: '0 10px', fontSize: '14px', fontWeight: 'normal', fontFamily: 'sans-serif'}}>{user?.displayName || 'Anon'}</h1>
          {user === null ? (
            <button onClick={() => { signInWithPopup(auth, provider) }}>Sign In</button>
          ) : (
            <button onClick={() => { signOut(auth) }}>Sign Out</button>
          )}
        </div>
        
        <Editor
          user={user}
          itemData={itemData}
          tool={tool}
          />

        <StatusBar tool={tool} setTool={setTool} />
      </div>
    </MapEditContext.Provider>
  );
}
