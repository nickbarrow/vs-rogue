import { useEffect, useState } from 'react'
import { auth } from '../utils/firebase'
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import styled, { css } from 'styled-components'

const PlayContainer = styled.div`
  height: 80%;
  width: 75%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  border: 1px solid #ffffff0a;
  border-radius: 10px;
  box-shadow: 0 0 12px 5px #00000069;
  background-color: #0000001c;
`;

export default function PlayGrid (props) {
    const provider = new GoogleAuthProvider()
    const [showBoard, toggleBoard] = useState(false)
  
    // Define onAuthStateChanged on mount.
    useEffect(() => {
      onAuthStateChanged(auth, (newUser) => {
        if (newUser) props.setUser(newUser)
        else props.setUser(null)
      })
    }, [])

    return (
        <PlayContainer>
          {!props.user ? (
            <button className='btn' onClick={() => { signInWithPopup(auth, provider) }}>Sign In</button>
          ) : (
            <>
              {showBoard ? (
                <p>Test</p>
              ) : (
                <>
                  <button className='btn green lg' onClick={() => { toggleBoard(true) }}>Start</button>
                  <button className='btn' onClick={() => { signOut(auth) }}>Sign Out</button>
                </>
              )}
            </>
          )}
        </PlayContainer>
    )
}