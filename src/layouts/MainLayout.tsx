
import { NavBar } from "@/components/navbar/NavBar";
import { Footer } from "@/components/layout/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <NavBar />
      <main className="container mx-auto px-4 pt-20 pb-8 animate-fadeIn flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};
