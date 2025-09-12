import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import BookingForm from "./BookingForm";

const Booking = () => {
  return (
    <section id="booking">
      <div className="px-6 pb-6">
        <div className="max-w-2xl mx-auto text-center">
          <Button
            asChild
            variant="outline" 
            className="border-salon-green text-salon-green hover:bg-salon-green hover:text-salon-purple-dark mb-4"
          >
            <Link to="/manage-booking">
              <Settings className="w-4 h-4 mr-2" />
              Hantera Befintliga Bokningar
            </Link>
          </Button>
        </div>
      </div>
      <BookingForm />
    </section>
  );
};

export default Booking;