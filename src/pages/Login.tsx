import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scissors, LogIn } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: 'Fel vid inloggning',
          description: 'Kontrollera email och lösenord.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Välkommen!',
          description: 'Du är nu inloggad.',
        });
        navigate('/admin');
      }
    } catch (error) {
      toast({
        title: 'Fel',
        description: 'Något gick fel. Försök igen.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast({
          title: 'Fel vid Google-inloggning',
          description: error.message || 'Något gick fel.',
          variant: 'destructive',
        });
        setGoogleLoading(false);
      }
    } catch (error) {
      toast({
        title: 'Fel',
        description: 'Något gick fel. Försök igen.',
        variant: 'destructive',
      });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="bg-salon-card border-border p-6 md:p-8 w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-secondary rounded-full mx-auto mb-4">
            <Scissors className="w-8 h-8 text-secondary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Admin Login</h1>
          <p className="text-muted-foreground">Logga in för att hantera bokningar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background border-border focus:border-primary"
            />
          </div>

          <div>
            <Label htmlFor="password">Lösenord</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background border-border focus:border-primary"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <>
                <LogIn className="w-4 h-4 mr-2 animate-spin" />
                Loggar in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Logga in
              </>
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
            eller
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full border-border hover:bg-secondary/10"
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
        >
          {googleLoading ? (
            <>
              <LogIn className="w-4 h-4 mr-2 animate-spin" />
              Loggar in med Google...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Logga in med Google
            </>
          )}
        </Button>

        <div className="mt-4 text-center">
          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/')}
          >
            Tillbaka till startsidan
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;