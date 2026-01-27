import React from 'react';
import Hero from './Hero';
import WhyEstockGlow from "./WhyEstockGlow";
import Stats from './Stats';
import Price from './Price';
import Education from './Education';
import OpenAccount from '../OpenAccount';
import Navbaar from '../Navbar';
import Footer from '../Footer';

function Homepage() {
    return ( 
        <>
          <Navbaar />
          <Hero />
          <WhyEstockGlow />
          <Stats />
          <Price />
          <Education />
          <OpenAccount />
          <Footer />
        </>
     );
}

export default Homepage; 