import { useEffect } from 'react'
import { auth } from '../utils/firebase'
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import styled, { css } from 'styled-components'

const PlayContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export default function PlayGrid (props) {
    const provider = new GoogleAuthProvider()
  
    // Define onAuthStateChanged on mount.
    useEffect(() => {
      onAuthStateChanged(auth, (newUser) => {
        if (newUser) props.setUser(newUser)
        else props.setUser(null)
      })
    }, [])

    return (
        <PlayContainer>
          <button className='btn'>Login</button>
          {/* {!props.user ? (
            <div>
              <h1>Log In</h1>
              <button className='btn' onClick={() => { signInWithPopup(auth, provider) }}>Sign In</button>
            </div>
          ) : (
            <button onClick={() => { signOut(auth) }}>Sign Out</button>
          )} */}
        </PlayContainer>
    )
}