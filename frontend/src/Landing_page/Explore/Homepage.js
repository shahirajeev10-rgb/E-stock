import React from "react";
import Hero from "./Hero";
import ProHighlights from "./ProHighlights";
import WhyEstockGlow from "./WhyEstockGlow";
import Stats from "./Stats";
import Education from "./Education";
import OpenAccount from "../OpenAccount";
import Navbaar from "../Navbar";
import Footer from "../Footer";
import FundamentalsModal from "../Lesson/FundamentalsModal";
import { auth } from "../auth";

function Homepage() {
  return (
    <>
      <Navbaar />
      <Hero />
      <ProHighlights />
      <WhyEstockGlow />
      <Stats />
      <Education />
      {!auth.isLoggedIn() && <OpenAccount />}
      <Footer />
      <FundamentalsModal />
    </>
  );
}

export default Homepage;
