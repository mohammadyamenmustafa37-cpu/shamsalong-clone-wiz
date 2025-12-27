import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Sham Salong</h1>
            <Link to="/">
              <Button variant="outline">Tillbaka till startsidan</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Användarvillkor</CardTitle>
            <p className="text-muted-foreground">Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Godkännande av villkor</h2>
              <p className="text-muted-foreground">
                Genom att använda Sham Salong godkänner du att vara bunden av dessa användarvillkor. Om du inte godkänner någon del av dessa villkor får du inte använda tjänsten.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Användarlicens</h2>
              <p className="text-muted-foreground">
                Du beviljas tillstånd att tillfälligt använda tjänsten för personligt, icke-kommersiellt bruk. Detta är ett beviljande av licens, inte en överföring av äganderätt.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Användarkonton</h2>
              <p className="text-muted-foreground">
                Du ansvarar för att hålla ditt konto och lösenord konfidentiellt. Du samtycker till att ta ansvar för alla aktiviteter som sker under ditt konto.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Förbjuden användning</h2>
              <p className="text-muted-foreground">
                Du får inte använda tjänsten för något olagligt syfte eller för att bryta mot några lagar. Du får inte försöka få obehörig åtkomst till någon del av tjänsten.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Immateriella rättigheter</h2>
              <p className="text-muted-foreground">
                Tjänsten och dess ursprungliga innehåll, funktioner och funktionalitet ägs av Sham Salong och skyddas av internationella upphovsrätts-, varumärkes- och andra immaterialrättsliga lagar.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Uppsägning</h2>
              <p className="text-muted-foreground">
                Vi kan avsluta eller stänga av ditt konto omedelbart, utan föregående varsel, vid överträdelse av dessa villkor. Vid uppsägning upphör din rätt att använda tjänsten omedelbart.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Ansvarsbegränsning</h2>
              <p className="text-muted-foreground">
                Sham Salong ska under inga omständigheter hållas ansvarig för indirekta, tillfälliga, speciella, följdskador eller straffskadestånd som uppstår från din användning av, eller oförmåga att använda, tjänsten.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Friskrivning</h2>
              <p className="text-muted-foreground">
                Tjänsten tillhandahålls "i befintligt skick" utan några garantier, uttryckta eller underförstådda. Vi garanterar inte att tjänsten kommer att vara oavbruten, i rätt tid, säker eller felfri.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Tillämplig lag</h2>
              <p className="text-muted-foreground">
                Dessa villkor ska regleras av och tolkas i enlighet med svensk lag, utan hänsyn till dess lagvalsregler.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Ändringar av villkoren</h2>
              <p className="text-muted-foreground">
                Vi förbehåller oss rätten att ändra dessa villkor när som helst. Vi meddelar användare om ändringar genom att publicera de nya användarvillkoren på denna sida med ett uppdaterat revisionsdatum.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Kontakta oss</h2>
              <p className="text-muted-foreground">
                Om du har några frågor om dessa användarvillkor, vänligen kontakta oss via vår webbplats.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TermsOfService;