const Hero = () => {
  return (
    <section className="px-4 md:px-6 pb-8 md:pb-12">
      <div className="max-w-4xl">
        <p className="text-base md:text-lg leading-relaxed mb-4 md:mb-6">
          <span className="text-salon-gold font-semibold">Sham Salong</span>, det bästa i Oxelösund.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-3 md:mb-4 text-sm md:text-base">
          Vi erbjuder de bästa tjänsterna men samtidigt till ödmjuka priser. Inga kompromisser med en hög standard du bara hittar hos oss!
        </p>
        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
          Oavsett om du vill klippa dig eller färga håret så fixar vi det. Du hittar oss på{" "}
          <span className="text-salon-gold">Esplanaden 1B</span> och vi har öppet{" "}
          <span className="text-salon-gold">alla dagar 10:00 – 19:00</span>.
        </p>
      </div>
    </section>
  );
};

export default Hero;