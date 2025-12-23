import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import BookingForm from "./BookingForm";

const Booking = () => {
  return (
    <section>
      <BookingForm />
      <div className="px-4 md:px-6 pb-12">
        <div className="max-w-2xl mx-auto text-center">
          <Button
            asChild
            variant="outline" 
            className="border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Link to="/manage-booking">
              <Settings className="w-4 h-4 mr-2" />
              Hantera Befintliga Bokningar
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Booking;
