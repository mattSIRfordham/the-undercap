import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Clock, TrendingUp, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import NewsletterSignup from "@/components/NewsletterSignup";
import PollWidget from "@/components/PollWidget";
import SEO from "@/components/SEO";

function ArticleCard({ article }: { article: any }) {
  const tags = article.tags ? JSON.parse(article.tags) : [];
  const publishedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Card className="premium-card group">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Clock className="w-4 h-4" />
          <span>{publishedDate}</span>
          <span className="mx-2">•</span>
          <Eye className="w-4 h-4" />
          <span>{article.viewCount} views</span>
        </div>
        <Link href={`/article/${article.slug}`}>
          <a>
            <CardTitle className="hover:text-primary transition-colors line-clamp-2 text-xl group-hover:text-primary">
              {article.title}
            </CardTitle>
          </a>
        </Link>
        <CardDescription className="line-clamp-2">
          {article.excerpt}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{article.category.replace('_', ' ')}</Badge>
          {tags.slice(0, 3).map((tag: string, idx: number) => (
            <Badge key={idx} variant="outline">{tag}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ArticleSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { data: articles, isLoading } = trpc.articles.getRecent.useQuery({ limit: 20 });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEO />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b">
          {/* Elegant gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-background"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(255,215,0,0.03),transparent_50%)]"></div>
          
          <div className="container py-20 md:py-28 relative">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20">
                  <TrendingUp className="w-7 h-7 text-primary" />
                </div>
                <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium bg-accent/80 border-gold-border">Updated Hourly</Badge>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance leading-tight">
                The News They <span className="gold-accent">Won't</span> Cover
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground text-balance leading-relaxed font-light">
                Covering nanocap, microcap, and small-cap companies trading under $1 billion market cap 
                on NASDAQ, NYSE, and OTC markets. Where small caps fight back against a system that 
                underserves them at every turn.
              </p>
            </div>
          </div>
        </section>

        {/* Latest Articles */}
        <section className="container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
          <div className="mb-10">
            <h2 className="text-4xl font-bold mb-3">Latest News</h2>
            <p className="text-lg text-muted-foreground">
              Fresh market analysis and company updates, generated hourly
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, idx) => (
                <ArticleSkeleton key={idx} />
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No articles available yet. Check back soon!
                </p>
              </CardContent>
            </Card>
          )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <PollWidget />
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="container py-12">
          <div className="max-w-2xl mx-auto">
            <NewsletterSignup />
          </div>
        </section>

        {/* Featured Companies CTA */}
        <section className="bg-muted/30 border-y">
          <div className="container py-12">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Explore Featured Companies</h2>
              <p className="text-muted-foreground mb-6">
                Discover in-depth profiles and Q&A sessions with our featured companies fighting under a billion
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/featured-companies">
                  <a className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6">
                    View Featured Companies
                  </a>
                </Link>
                <Link href="/company-qa">
                  <a className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6">
                    Read Company Q&A
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
