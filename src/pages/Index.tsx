import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import BookingForm from "@/components/BookingForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <BookingForm />
    </div>
  );
};

export default Index;
