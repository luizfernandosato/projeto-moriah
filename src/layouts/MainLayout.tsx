
import { NavBar } from "@/components/navbar/NavBar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-secondary/30">
      <NavBar />
      <main className="container mx-auto px-4 pt-20 pb-8 animate-fadeIn">
        {children}
      </main>
    </div>
  );
};
