import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import Header from "@/components/Header";
import BookingsTable from "@/components/BookingsTable";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [roleLoading, setRoleLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const checkRole = async () => {
      setRoleLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) throw error;
        if (!cancelled) setIsAdmin(!!data);
      } catch (err) {
        console.error('[admin] role check failed', err);
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setRoleLoading(false);
      }
    };

    checkRole();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const claimAdmin = async () => {
    if (!user) return;

    setRoleLoading(true);
    try {
      const { data, error } = await supabase.rpc('bootstrap_admin');
      if (error) throw error;

      if (data === true) {
        toast({
          title: 'Admin aktiverad',
          description: 'Ditt konto har nu admin-behörighet.',
        });
        setIsAdmin(true);
      } else {
        toast({
          title: 'Kan inte aktivera admin',
          description: 'En admin finns redan. Kontakta ägaren för åtkomst.',
          variant: 'destructive',
        });
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('[admin] bootstrap failed', err);
      toast({
        title: 'Fel',
        description: 'Kunde inte aktivera admin. Försök igen.',
        variant: 'destructive',
      });
    } finally {
      setRoleLoading(false);
    }
  };

  if (loading || roleLoading || (user && isAdmin === null)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="px-4 md:px-6 py-8 md:py-12">
          <div className="max-w-xl mx-auto">
            <Card className="bg-card border-border p-6 md:p-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Ingen admin-åtkomst</h1>
              <p className="text-muted-foreground mb-6">
                Du är inloggad, men ditt konto har inte behörighet att se bokningar.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={claimAdmin} disabled={roleLoading}>
                  Försök aktivera admin
                </Button>
                <Button variant="outline" onClick={signOut}>
                  Logga ut
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Tips: Endast den första inloggade användaren kan ”claima” admin automatiskt.
              </p>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center text-primary">
            Admin Panel
          </h1>
          <BookingsTable />
        </div>
      </main>
    </div>
  );
};

export default Admin;
