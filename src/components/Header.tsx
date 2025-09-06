import { Scissors } from "lucide-react";

const Header = () => {
  return (
    <header className="py-8 px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-16 h-16 bg-salon-purple rounded-full">
          <Scissors className="w-8 h-8 text-salon-purple-dark" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-salon-purple">Sham Salong</h1>
          <p className="text-muted-foreground">Oxelösunds bästa frisörsalong</p>
        </div>
      </div>
    </header>
  );
};

export default Header;