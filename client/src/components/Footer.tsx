import { TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">The Undercap</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Your source for news and analysis on nanocap, microcap, and small-cap companies trading under $1 billion market cap. 
              Covering what Wall Street won't — the companies fighting with their hands tied behind their backs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/">
                  <a className="text-muted-foreground hover:text-foreground transition-colors">
                    Latest News
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/featured-companies">
                  <a className="text-muted-foreground hover:text-foreground transition-colors">
                    Featured Companies
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/company-qa">
                  <a className="text-muted-foreground hover:text-foreground transition-colors">
                    Company Q&A
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold mb-4">About</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">
                Editorial Policy
              </li>
              <li className="text-muted-foreground">
                Advertise With Us
              </li>
              <li className="text-muted-foreground">
                Contact
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} The Undercap. All rights reserved.</p>
          <p className="mt-2">
            Content is AI-generated and for informational purposes only. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
