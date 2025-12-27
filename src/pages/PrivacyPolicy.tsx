import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tillbaka till startsidan
          </Button>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl text-primary">Integritetspolicy</CardTitle>
              <p className="text-muted-foreground">Senast uppdaterad: 2 december 2025</p>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-6 text-foreground">
              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">1. Introduktion</h2>
                <p className="text-muted-foreground">
                  Välkommen till Sham Salong. Vi respekterar din integritet och är engagerade i att skydda dina personuppgifter. 
                  Denna integritetspolicy förklarar hur vi samlar in, använder och skyddar din information när du använder vår webbplats och våra tjänster.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">2. Information vi samlar in</h2>
                <p className="text-muted-foreground mb-2">Vi samlar in information som du ger oss direkt, inklusive:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Namn och kontaktuppgifter (e-postadress, telefonnummer)</li>
                  <li>Bokningsuppgifter (önskat datum, tid och tjänster)</li>
                  <li>Kontoinformation när du loggar in med Google</li>
                  <li>Eventuella anteckningar eller önskemål du delar med oss</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">3. Hur vi använder din information</h2>
                <p className="text-muted-foreground mb-2">Vi använder informationen vi samlar in för att:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Behandla och hantera dina salongsbokningar</li>
                  <li>Kommunicera med dig om dina bokningar</li>
                  <li>Skicka bokningsbekräftelser och påminnelser</li>
                  <li>Förbättra våra tjänster och kundupplevelse</li>
                  <li>Uppfylla lagliga skyldigheter</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">4. Google-inloggning</h2>
                <p className="text-muted-foreground">
                  När du väljer att logga in med Google får vi grundläggande profilinformation från ditt Google-konto, 
                  inklusive ditt namn och din e-postadress. Vi använder denna information endast för autentiseringsändamål och 
                  för att ge dig tillgång till våra adminfunktioner. Vi har inte tillgång till dina Google-kontakter, kalender 
                  eller några andra Google-tjänster.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">5. Datalagring och säkerhet</h2>
                <p className="text-muted-foreground">
                  Dina uppgifter lagras säkert med hjälp av Supabase, en pålitlig molndatabasleverantör. Vi implementerar 
                  lämpliga tekniska och organisatoriska åtgärder för att skydda dina personuppgifter mot obehörig 
                  åtkomst, ändring, avslöjande eller förstörelse.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">6. Delning av uppgifter</h2>
                <p className="text-muted-foreground">
                  Vi säljer, byter eller hyr inte ut dina personuppgifter till tredje part. Vi kan dela din 
                  information endast under följande omständigheter:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                  <li>Med tjänsteleverantörer som hjälper till att driva vår webbplats (t.ex. Supabase för datalagring)</li>
                  <li>När det krävs enligt lag eller för att svara på rättsliga processer</li>
                  <li>För att skydda våra rättigheter, integritet, säkerhet eller egendom</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">7. Dina rättigheter</h2>
                <p className="text-muted-foreground mb-2">Du har rätt att:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Få tillgång till de personuppgifter vi har om dig</li>
                  <li>Begära rättelse av felaktiga uppgifter</li>
                  <li>Begära radering av dina uppgifter</li>
                  <li>Återkalla samtycke till behandling av uppgifter</li>
                  <li>Lämna in ett klagomål till en dataskyddsmyndighet</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">8. Cookies</h2>
                <p className="text-muted-foreground">
                  Vi använder nödvändiga cookies för att upprätthålla din session och dina inställningar. Dessa cookies är nödvändiga 
                  för att webbplatsen ska fungera korrekt och kan inte inaktiveras.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">9. Ändringar av denna policy</h2>
                <p className="text-muted-foreground">
                  Vi kan uppdatera denna integritetspolicy från tid till annan. Vi meddelar dig om eventuella ändringar genom att publicera 
                  den nya policyn på denna sida och uppdatera datumet för "Senast uppdaterad".
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">10. Kontakta oss</h2>
                <p className="text-muted-foreground">
                  Om du har några frågor om denna integritetspolicy eller vår hantering av uppgifter, kontakta oss på:
                </p>
                <p className="text-muted-foreground mt-2">
                  <strong>E-post:</strong> info@shamsalong.se<br />
                  <strong>Webbplats:</strong> https://shamsalong.se
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;