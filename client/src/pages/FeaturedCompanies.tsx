import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, ExternalLink, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function FeaturedCompanies() {
  const { data: companies, isLoading } = trpc.companies.getFeatured.useQuery();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
          <div className="container py-16">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-8 h-8 text-primary" />
                <Badge variant="secondary">IR Client Showcase</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                Featured Companies
              </h1>
              <p className="text-lg text-muted-foreground text-balance">
                In-depth profiles of our featured small-cap companies. These profiles are provided 
                through our investor relations services and offer detailed insights into company 
                operations, strategy, and market opportunities.
              </p>
            </div>
          </div>
        </section>

        {/* Companies Grid */}
        <section className="container py-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : companies && companies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{company.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant="outline">{company.ticker}</Badge>
                          <span className="text-xs">{company.exchange}</span>
                        </CardDescription>
                      </div>
                      {company.logoUrl && (
                        <img 
                          src={company.logoUrl} 
                          alt={`${company.name} logo`}
                          className="w-12 h-12 object-contain"
                        />
                      )}
                    </div>
                    
                    {company.sector && (
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {company.sector}
                        </Badge>
                        {company.industry && (
                          <Badge variant="secondary" className="text-xs">
                            {company.industry}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    {company.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {company.description}
                      </p>
                    )}
                    
                    <div className="flex flex-col gap-2">
                      <Link href={`/company/${company.ticker}`}>
                        <a className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                          <TrendingUp className="w-4 h-4" />
                          View Company Profile
                        </a>
                      </Link>
                      
                      {company.websiteUrl && (
                        <a 
                          href={company.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Visit Website
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Featured Companies Yet</h3>
                <p className="text-muted-foreground">
                  Check back soon for featured company profiles from our IR clients.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* CTA Section */}
        <section className="bg-muted/30 border-y">
          <div className="container py-12">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Interested in Being Featured?</h2>
              <p className="text-muted-foreground mb-6">
                Our investor relations services help small-cap companies increase visibility 
                and engage with potential investors through comprehensive company profiles and Q&A sessions.
              </p>
              <p className="text-sm text-muted-foreground">
                Contact us to learn more about our IR services
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
