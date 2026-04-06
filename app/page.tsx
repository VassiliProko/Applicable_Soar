import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HeroVisual from "./components/HeroVisual";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <div className="container-page flex flex-col flex-1">
        <Navbar />
        <main className="flex-1">
          <Hero />
          <HeroVisual />
        </main>
      </div>
      <div className="px-[var(--grid-margin)] pb-[var(--grid-margin)]">
        <Footer />
      </div>
    </>
  );
}
