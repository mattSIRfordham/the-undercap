import { Link } from "wouter";
import { Button } from "./ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { TrendingUp, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Header() {
  const { user, isAuthenticated } = useAuth();

  const navLinks = [
    { href: "/", label: "Latest News" },
    { href: "/stock-screener", label: "Stock Screener" },
    { href: "/featured-companies", label: "Featured Companies" },
    { href: "/company-qa", label: "Company Q&A" },
    { href: "/submit", label: "Submit Content" },
    { href: "/market-transparency", label: "Market Transparency" },
  ];

  return (
    <header className="border-b border-border/50 bg-card/95 backdrop-blur-sm text-card-foreground sticky top-0 z-50 shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-3 font-bold text-xl hover:opacity-80 transition-all duration-200 group">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl" style={{ fontFamily: "'DM Serif Display', serif" }}>The Undercap</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a className="text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-200 relative group">
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                </a>
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-accent/50">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                  {(user?.name || user?.email || 'U')[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium">
                  {user?.name || user?.email}
                </span>
              </div>
            ) : (
              <Button asChild size="sm" className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <a className="text-lg font-medium hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  </Link>
                ))}
                <div className="border-t pt-4 mt-4">
                  {isAuthenticated ? (
                    <div className="text-sm text-muted-foreground">
                      {user?.name || user?.email}
                    </div>
                  ) : (
                    <Button asChild className="w-full">
                      <a href={getLoginUrl()}>Sign In</a>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
