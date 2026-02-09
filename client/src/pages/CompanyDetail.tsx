import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, ExternalLink, TrendingUp, Clock } from "lucide-react";

export default function CompanyDetail() {
  const [, params] = useRoute("/company/:ticker");
  const ticker = params?.ticker || "";

  const { data: company, isLoading: companyLoading } = trpc.companies.getByTicker.useQuery({ ticker });
  const { data: articles, isLoading: articlesLoading } = trpc.companies.getArticles.useQuery(
    { companyId: company?.id || 0, limit: 10 },
    { enabled: !!company }
  );

  if (companyLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 container py-12">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 container py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Company Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The company you're looking for doesn't exist in our database.
              </p>
              <Link href="/featured-companies">
                <a className="text-primary hover:underline">← View Featured Companies</a>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <main className="flex-1">
        {/* Company Header */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
          <div className="container py-12">
            <div className="flex items-start gap-6">
              {company.logoUrl && (
                <img 
                  src={company.logoUrl} 
                  alt={`${company.name} logo`}
                  className="w-24 h-24 object-contain bg-white rounded-lg p-2 border"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-4xl font-bold">{company.name}</h1>
                  {company.isFeatured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {company.ticker}
                  </Badge>
                  <span className="text-muted-foreground">{company.exchange}</span>
                  {company.sector && (
                    <Badge variant="secondary">{company.sector}</Badge>
                  )}
                  {company.industry && (
                    <Badge variant="secondary">{company.industry}</Badge>
                  )}
                </div>

                {company.marketCap && (
                  <div className="text-lg mb-4">
                    <span className="text-muted-foreground">Market Cap: </span>
                    <span className="font-semibold">
                      ${(company.marketCap / 1000000).toFixed(2)}M
                    </span>
                  </div>
                )}

                {company.websiteUrl && (
                  <a 
                    href={company.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Company Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Company Description */}
        {company.description && (
          <section className="container py-8">
            <Card>
              <CardHeader>
                <CardTitle>About {company.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {company.description}
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Recent Articles */}
        <section className="container py-8">
          <h2 className="text-2xl font-bold mb-6">Recent News & Analysis</h2>
          
          {articlesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article) => {
                const publishedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Clock className="w-4 h-4" />
                        <span>{publishedDate}</span>
                      </div>
                      <Link href={`/article/${article.slug}`}>
                        <a>
                          <CardTitle className="hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </CardTitle>
                        </a>
                      </Link>
                      <CardDescription className="line-clamp-2">
                        {article.excerpt}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No articles about this company yet. Check back soon!
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
