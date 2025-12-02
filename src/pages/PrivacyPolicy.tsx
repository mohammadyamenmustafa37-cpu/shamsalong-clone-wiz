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
            Back to Home
          </Button>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl text-primary">Privacy Policy</CardTitle>
              <p className="text-muted-foreground">Last updated: December 2, 2025</p>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-6 text-foreground">
              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">1. Introduction</h2>
                <p className="text-muted-foreground">
                  Welcome to Sham Salong. We respect your privacy and are committed to protecting your personal data. 
                  This privacy policy explains how we collect, use, and safeguard your information when you use our website and services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">2. Information We Collect</h2>
                <p className="text-muted-foreground mb-2">We collect information that you provide directly to us, including:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Booking details (preferred date, time, and services)</li>
                  <li>Account information when you sign in with Google</li>
                  <li>Any additional notes or preferences you share with us</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">3. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-2">We use the information we collect to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Process and manage your salon bookings</li>
                  <li>Communicate with you about your appointments</li>
                  <li>Send booking confirmations and reminders</li>
                  <li>Improve our services and customer experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">4. Google Sign-In</h2>
                <p className="text-muted-foreground">
                  When you choose to sign in with Google, we receive basic profile information from your Google account, 
                  including your name and email address. We use this information solely for authentication purposes and 
                  to provide you with access to our admin features. We do not access your Google contacts, calendar, 
                  or any other Google services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">5. Data Storage and Security</h2>
                <p className="text-muted-foreground">
                  Your data is securely stored using Supabase, a trusted cloud database provider. We implement 
                  appropriate technical and organizational measures to protect your personal data against unauthorized 
                  access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">6. Data Sharing</h2>
                <p className="text-muted-foreground">
                  We do not sell, trade, or rent your personal information to third parties. We may share your 
                  information only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                  <li>With service providers who assist in operating our website (e.g., Supabase for data storage)</li>
                  <li>When required by law or to respond to legal processes</li>
                  <li>To protect our rights, privacy, safety, or property</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">7. Your Rights</h2>
                <p className="text-muted-foreground mb-2">You have the right to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Access the personal data we hold about you</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Withdraw consent for data processing</li>
                  <li>Lodge a complaint with a data protection authority</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">8. Cookies</h2>
                <p className="text-muted-foreground">
                  We use essential cookies to maintain your session and preferences. These cookies are necessary 
                  for the website to function properly and cannot be disabled.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">9. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this privacy policy from time to time. We will notify you of any changes by posting 
                  the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary mb-3">10. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this privacy policy or our data practices, please contact us at:
                </p>
                <p className="text-muted-foreground mt-2">
                  <strong>Email:</strong> info@shamsalong.se<br />
                  <strong>Website:</strong> https://shamsalong.se
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
