import Header from "@/components/Header";
import BookingsTable from "@/components/BookingsTable";

const Admin = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Admin Panel</h1>
          <BookingsTable />
        </div>
      </main>
    </div>
  );
};

export default Admin;