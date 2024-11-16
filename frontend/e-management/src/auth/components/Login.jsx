import React, { useState } from 'react'
import styled from 'styled-components'
import { useLoginMutation } from '../../RTK/ApiRequests';
import Error from '../../components/Error';
import Success from '../../components/Success';
import Cookies from "js-cookie";

const Login = ({ setSignUpToggle }) => {

  const [login] = useLoginMutation();
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  async function handleChange(e) {
    setLoginData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value
    }))
  }

  async function handleClick(e) {
    e.preventDefault();
    const res = await login(loginData);

    if (!res.error) {
      setSuccessText(res.data.message);
      await Cookies.set('tok-uid', res.data.token, { expires: 30 })
      setTimeout(() => {
        setSuccessText('');
        window.location.href = '/'
      }, 3000)
    } else {
      setErrorText(res.error.data.error);
      setTimeout(() => {
        setErrorText('');
      }, 3000)
    }
  }

  return (
    <Wrapper>
      {errorText === '' ? null : <Error text={errorText} />}
      {successText === '' ? null : <Success text={successText} />}
      <h2>Login</h2>
      <form onSubmit={handleClick}>
        <label>Email:</label>
        <input type="email" name="email" onChange={handleChange} />
        <span>Email must be in right format (ex: example@gmail.com)</span>
        <label>Password:</label>
        <input type="password" name="password" onChange={handleChange} />
        <span>Password must be 8 characters long</span>
        <button type='submit' disabled={errorText !== ''} style={{
          cursor: errorText === '' ? 'pointer' : 'not-allowed',
        }}>LOGIN</button>
        <div className="actions">
          <span>Didn't register yet? <a onClick={() => setSignUpToggle(true)}>Sign Up</a></span>
        </div>
      </form>
    </Wrapper>
  )
}

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;

  h2 {
    color: #ff6a00;
    font-weight: 500;
  }

  form {
    margin-top: 3rem;
    display: flex;
    flex-direction: column;
    align-items: left;
    gap: 1rem;

    label {
      font-size: 1.5rem;
      font-weight: 500;
    }

    input {
      border: none;
      border-radius: 5px;
      border-bottom: 2px solid #ff8a00;
      color: #ff8a00;
      font-size: 1.5rem;
      text-transform: unset;
      outline: #ff8a00;
      padding: 1rem;
    }

    span {
      color: red;
      font-size: 1.2rem;
    }

    button {
      background-color: #ff8a00;
      outline: none;
      border: none;
      color: #fff;
      padding: 1rem;
      border-radius: 5px;
      cursor: pointer;
    }

    .actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      span {
        color: #000;
        font-size: 1.2rem;
      }

      a {
        color: #ff8a00;
        cursor: pointer;
      }
    }
  }
`

export default Login