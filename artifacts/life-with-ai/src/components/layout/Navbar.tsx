import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, FileText, LayoutDashboard, LogOut } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/pdfs", label: "PDFs", icon: FileText },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-primary">LIFE WITH AI</span>
            </Link>
            
            <div className="hidden md:flex gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.startsWith(link.href) ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href={isAdmin ? "/admin" : "/dashboard"}>
                  <Button variant="ghost" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    {isAdmin ? "Admin" : "Dashboard"}
                  </Button>
                </Link>
                <Button variant="outline" onClick={logout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </div>

          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border/40 bg-background px-4 py-4 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="text-base font-medium text-foreground hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-border/40 flex flex-col space-y-3">
            {isAuthenticated ? (
              <>
                <Link href={isAdmin ? "/admin" : "/dashboard"} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    {isAdmin ? "Admin Panel" : "My Dashboard"}
                  </Button>
                </Link>
                <Button variant="ghost" onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full justify-start gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Log in</Button>
                </Link>
                <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
