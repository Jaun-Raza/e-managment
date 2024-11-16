import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
  border: 4px solid rgb(255 255 255 / 30%); 
  border-radius: 50%;
  border-top: 4px solid #ff6a00;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
  margin: auto;
  margin-top: 15rem;
`;

const Loader = () => {
  return (
    <Wrapper>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Spinner />
        <p style={{ color: '#ff6a00', marginTop: '10px', marginBottom: '10rem', fontFamily: 'Poppins, sans-serif' }}>Loading...</p>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  margin: auto;
`;

export default Loader;
