export default function HeroVisual() {
  return (
    <section className="pb-xl">
      <div
        className="rounded-[var(--card-outer-radius)] py-[clamp(1.5rem,1rem+2vw,2.5rem)] px-[clamp(2rem,1.5rem+3vw,3.75rem)] overflow-hidden relative"
        style={{
          backgroundImage: "url('/images/home/landing_background.webp')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative z-10 bg-background rounded-[var(--card-inner-radius)] w-full aspect-[16/9]" />
      </div>
    </section>
  );
}
