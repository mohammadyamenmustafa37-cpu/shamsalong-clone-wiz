const Hero = () => {
  return (
    <section className="px-6 pb-12">
      <div className="max-w-4xl">
        <p className="text-lg leading-relaxed mb-6">
          <span className="text-salon-green font-semibold">Sham Salong</span>, det bästa i Oxelösund.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Vi erbjuder de bästa tjänsterna men samtidigt till ödmjuka priser. Inga kompromisser med en hög standard du bara hittar hos oss!
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Oavsett om du vill klippa dig eller färga håret så fixar vi det. Du hittar oss på{" "}
          <span className="text-salon-green">Esplanaden 1B</span> och vi har öppet{" "}
          <span className="text-salon-green">alla dagar 10:00 – 19:00</span>.
        </p>
      </div>
    </section>
  );
};

export default Hero;