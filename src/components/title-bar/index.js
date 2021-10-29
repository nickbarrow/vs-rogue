import { useEffect } from 'react'
import { auth } from '../../utils/firebase'
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth"
import { VscChromeMinimize, VscChromeRestore, VscChromeClose } from "react-icons/vsc"

export default function TitleBar (props) {
    const provider = new GoogleAuthProvider()
  
    // Define onAuthStateChanged on mount.
    useEffect(() => {
      onAuthStateChanged(auth, (newUser) => {
        if (newUser) props.setUser(newUser)
        else props.setUser(null)
      })
    }, [])

    return (
        <div className="title-bar">
            <div className='left'>
                <img className="logo" src="images/visual-studio-code.svg" alt="Visual Studio Code Logo" />
                <div className='btn'>File</div>
                <div className='btn'>Edit</div>
                <div className='btn'>View</div>
                <div className='btn'>Go</div>
                <div className='btn'>Run</div>
                <div className='btn'>Terminal</div>
                <div className='btn'>Help</div>
                <div className="btn">
                    {props.user?.displayName || 'Anon'}
                </div>
                {props.user === null ? (
                    <div className="btn" onClick={() => { signInWithPopup(auth, provider) }}>Sign In</div>
                ) : (
                    <div className="btn" onClick={() => { signOut(auth) }}>Sign Out</div>
                )}
            </div>
            

            <div className="right">
                <div className='btn window-control'><VscChromeMinimize /></div>
                <div className='btn window-control'><VscChromeRestore /></div>
                <div className='btn window-control'><VscChromeClose /></div>
            </div>
        </div>
    )
}