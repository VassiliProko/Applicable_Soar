import Hero from "./components/Hero";
import HeroVisual from "./components/HeroVisual";
export default function Home() {
  return (
    <div className="container-page flex flex-col flex-1">
      <main className="flex-1">
        <Hero />
        <HeroVisual />
      </main>
    </div>
  );
}
