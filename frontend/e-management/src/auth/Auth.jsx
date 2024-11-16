import React, { useState } from 'react'
import styled from 'styled-components'
import SignUp from './components/SignUp';
import Login from './components/Login';

const Auth = () => {

  const [signUpToggle, setSignUpToggle] = useState(false);

  return (
    <Wrapper>
      <div className="sideBar">
        <h1>E-Manager</h1>
        <p>Manage your events in a digital way!</p>
      </div>
      {
        signUpToggle ? <SignUp setSignUpToggle={setSignUpToggle} /> : <Login setSignUpToggle={setSignUpToggle} />
      }
    </Wrapper>
  )
}

const Wrapper = styled.section`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  flex-direction: row;

  .sideBar {

    h1 {
      color: #ff6a00;
    }

    p {
      color: #ff8a00;
    }

    width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }
`

export default Auth