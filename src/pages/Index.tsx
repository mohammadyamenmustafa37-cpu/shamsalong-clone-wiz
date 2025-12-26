import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import BookingForm from "@/components/BookingForm";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Hero />
      <Features />
      <BookingForm />
      <Footer />
    </div>
  );
};

export default Index;
