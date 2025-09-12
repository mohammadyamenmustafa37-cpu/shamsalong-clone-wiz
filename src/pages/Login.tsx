import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scissors, LogIn } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="bg-salon-card border-salon-card p-8 w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-salon-purple rounded-full mx-auto mb-4">
            <Scissors className="w-8 h-8 text-salon-purple-dark" />
          </div>
          <h1 className="text-2xl font-bold text-salon-purple mb-2">Admin Login</h1>
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
              className="bg-background border-salon-card focus:border-salon-green"
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
              className="bg-background border-salon-card focus:border-salon-green"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-salon-green hover:bg-salon-green-muted text-salon-purple-dark font-semibold"
            disabled={loading}
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
      </Card>
    </div>
  );
};

export default Login;