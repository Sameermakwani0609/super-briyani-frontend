import Hero from "./Hero";
import Statistics from "./Statistics";
import FeaturedMenu from "./FeaturedMenu";
import PartyCatering from "./PartyCatering";
import WeddingCatering from "./WeddingCatering";
import Testimonial from "./Testimonial";
import About from "./About";
import Contact from "./Contact";
import Footer from "./Footer";
import LoadingOverlay from "./LoadingOverlay";

export default function Home() {
  return (
    <>
      <LoadingOverlay />
      <Hero />
      <Statistics />
      <FeaturedMenu />
      <PartyCatering />
      <WeddingCatering />
      <Testimonial />
      <About />
      <Contact />
      <Footer />
    </>
  );
}