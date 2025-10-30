import React from 'react';

function Hero() {
    return (
        <div className='container' p-5>
          <div className='row' style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', 
            textAlign: 'center' 
          }}>
            <img src='/media/img1.jpg' alt='Hero image' 
              style={{
                width: '100%',
                maxWidth: '600px',
                height: 'auto',
                borderRadius: '10px',
                marginBottom: '2rem',
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
              }}
            />
            <h1 className='mt-5'>Grow Your Wealth, Secure Your Dream</h1>
            <p>Platform to learn stock market and trading</p>
            <button classNmae='p-3 btn btn-primary' style={{width:"15%", margin:"0 auto"}} >Signup Now</button>
          </div>
        </div>
      );
}

export default Hero;