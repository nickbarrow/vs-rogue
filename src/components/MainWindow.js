import { useContext, useEffect, useState } from 'react'
import { auth } from '../utils/firebase'
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import styled from 'styled-components'

import PlayGrid from './PlayGrid.jsx'

import UserDataContext from '../UserDataContext'

const MainContainer = styled.div`
  width: fit-content;
  padding: 2vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  border: 1px solid #ffffff0a;
  border-radius: 10px;
  box-shadow: 0 0 12px 5px #00000069;
  background-color: #0000001c;
  transition: all ease .5s;
`;

export default function MainWindow (props) {
    const provider = new GoogleAuthProvider()
    const [showBoard, toggleBoard] = useState(false)

    const { data, setData } = useContext(UserDataContext)
    console.log('ud: ', data)
  
    // Define onAuthStateChanged on mount.
    useEffect(() => {
      onAuthStateChanged(auth, (newUser) => {
        if (newUser) props.setUser(newUser)
        else props.setUser(null)
      })
    }, [])

    return (
      <MainContainer>
        {!props.user ? (
          <button className='btn' onClick={() => { signInWithPopup(auth, provider) }}>Sign In</button>
        ) : (
          <>
            {showBoard ? (
              <PlayGrid {...props} />
            ) : (
              <>
                <button className='btn green lg' onClick={() => { toggleBoard(true) }}>Start</button>
                <button className='btn' onClick={() => { signOut(auth) }}>Sign Out</button>
              </>
            )}
          </>
        )}
      </MainContainer>
    )
}