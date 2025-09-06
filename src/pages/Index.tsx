import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Booking from "@/components/Booking";
import Contact from "@/components/Contact";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Services />
      <Booking />
      <Contact />
    </div>
  );
};

export default Index;
