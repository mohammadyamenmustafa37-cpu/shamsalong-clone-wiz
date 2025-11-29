import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scissors, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const OAuthConsent = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Handle OAuth callback
    const handleOAuthCallback = async () => {
      try {
        // Check if user is authenticated
        if (loading) {
          return;
        }

        if (user) {
          console.log('OAuth authentication successful', user.id);
          
          toast({
            title: 'Inloggning lyckades!',
            description: 'Du kommer att omdirigeras till admin-panelen.',
          });

          // Redirect to admin after successful OAuth
          setTimeout(() => {
            navigate('/admin');
          }, 2000);
        } else {
          console.error('OAuth authentication failed - no user found');
          
          toast({
            title: 'Inloggning misslyckades',
            description: 'Kunde inte slutföra Google-inloggningen.',
            variant: 'destructive',
          });

          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast({
          title: 'Fel',
          description: 'Ett oväntat fel inträffade.',
          variant: 'destructive',
        });
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleOAuthCallback();
  }, [user, loading, navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="bg-card border-border p-8 w-full max-w-md">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full mx-auto mb-6">
            <Scissors className="w-8 h-8 text-primary-foreground" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {isProcessing ? 'Autentiserar...' : user ? 'Inloggning lyckades!' : 'Inloggning misslyckades'}
          </h1>

          {isProcessing && (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">
                Vänligen vänta medan vi slutför din inloggning...
              </p>
            </div>
          )}

          {!isProcessing && user && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-primary" />
              <p className="text-muted-foreground">
                Du omdirigeras till admin-panelen om ett ögonblick...
              </p>
            </div>
          )}

          {!isProcessing && !user && (
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle className="w-16 h-16 text-destructive" />
              <p className="text-muted-foreground">
                Något gick fel med inloggningen. Du omdirigeras tillbaka till inloggningssidan...
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Tillbaka till inloggning
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OAuthConsent;