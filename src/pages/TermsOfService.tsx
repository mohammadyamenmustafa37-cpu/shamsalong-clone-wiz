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
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Sham Salong's booking services, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Use of Service</h2>
              <p className="text-muted-foreground">
                Our booking service allows you to schedule appointments at Sham Salong. You agree to provide accurate information when making bookings and to notify us of any changes or cancellations in a timely manner.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. User Account</h2>
              <p className="text-muted-foreground">
                When you create an account with us, you must provide information that is accurate, complete, and current. You are responsible for safeguarding your account credentials and for any activities or actions under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Booking and Cancellation Policy</h2>
              <p className="text-muted-foreground">
                All bookings are subject to availability. We reserve the right to cancel or reschedule appointments with reasonable notice. Customers are expected to provide at least 24 hours notice for cancellations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Privacy and Data Protection</h2>
              <p className="text-muted-foreground">
                We collect and process personal data in accordance with applicable data protection laws. Your information is used solely for booking management and service delivery. We do not share your personal information with third parties without your consent, except as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Service Modifications</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify or discontinue our services at any time without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Sham Salong shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to update these terms at any time. We will notify users of any material changes by posting the new Terms of Service on this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us through our website or visit us at our salon location.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TermsOfService;
