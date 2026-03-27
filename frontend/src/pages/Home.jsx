import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import Features from "../components/Features";
import MenuPreview from "../components/MenuPreview";
import Footer from "../components/Footer";

function Home() {
    return (
      <div>
        <Hero />
        <Features />
        <MenuPreview />
      </div>
  );
}

export default Home;