import React from "react";
import { Sparkles } from "lucide-react";
import { ToggleTheme } from "@/components/ui/toggle-theme";
import { useApp } from "@/context/AppContext";
import GooeyNav from "@/components/GooeyNav";

interface PageLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, showNav = true }) => {
  const { isDark } = useApp();

  if (!showNav) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background">
      <header className={`sticky top-0 z-30 flex items-center justify-between bg-card/80 backdrop-blur-md px-6 py-3 ${isDark ? 'bg-[#09090b]/90' : ''}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <a href="/" className="text-lg font-bold tracking-tight text-foreground no-underline">
            Cv<span className="gradient-text">Aura</span>
          </a>
        </div>
        <div className="flex items-center gap-2">
          <GooeyNav
            items={[
              { label: "Home", href: "/" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ]}
            initialActiveIndex={0}
          />
          <ToggleTheme className="ml-2 text-muted-foreground" />
        </div>
      </header>
      {children}
    </div>
  );
};

export default PageLayout;
