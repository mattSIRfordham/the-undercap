import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Eye, TrendingUp } from "lucide-react";
import { Streamdown } from "streamdown";
import { Link } from "wouter";
import CommentsSection from "@/components/CommentsSection";
import NewsletterSignup from "@/components/NewsletterSignup";
import SEO, { ArticleStructuredData } from "@/components/SEO";

export default function ArticlePage() {
  const [, params] = useRoute("/article/:slug");
  const slug = params?.slug || "";

  const { data: article, isLoading } = trpc.articles.getBySlug.useQuery({ slug });
  const { data: companies } = trpc.articles.getRelatedCompanies.useQuery(
    { articleId: article?.id || 0 },
    { enabled: !!article }
  );

  if (isLoading) {
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

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 container py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The article you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/">
                <a className="text-primary hover:underline">← Back to Home</a>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const tags = article.tags ? JSON.parse(article.tags) : [];
  const publishedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  const articleUrl = `${window.location.origin}/article/${article.slug}`;
  const articleImage = article.imageUrl || `${window.location.origin}/og-image.png`;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEO
        title={`${article.title} | The Undercap`}
        description={article.excerpt || article.title}
        image={articleImage}
        url={articleUrl}
        type="article"
        publishedTime={new Date(article.publishedAt).toISOString()}
        modifiedTime={new Date(article.updatedAt).toISOString()}
        author={article.authorName}
        tags={tags}
      />
      <ArticleStructuredData
        title={article.title}
        description={article.excerpt || article.title}
        image={articleImage}
        url={articleUrl}
        publishedTime={new Date(article.publishedAt).toISOString()}
        modifiedTime={new Date(article.updatedAt).toISOString()}
        author={article.authorName}
      />
      <Header />
      
      <main className="flex-1">
        <article className="container py-12 max-w-4xl">
          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{article.category.replace('_', ' ')}</Badge>
              {tags.slice(0, 3).map((tag: string, idx: number) => (
                <Badge key={idx} variant="outline">{tag}</Badge>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-xl text-muted-foreground mb-6 text-balance">
                {article.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{publishedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{article.viewCount} views</span>
              </div>
              <div className="flex items-center gap-2">
                <span>By {article.authorName}</span>
              </div>
            </div>
          </div>

          {/* Related Companies */}
          {companies && companies.length > 0 && (
            <Card className="mb-8 bg-muted/30">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Companies Mentioned</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {companies.map((company) => (
                    <Link key={company.id} href={`/company/${company.ticker}`}>
                      <a>
                        <Badge variant="outline" className="hover:bg-accent transition-colors">
                          {company.ticker} - {company.name}
                        </Badge>
                      </a>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Article Content */}
          <Card>
            <CardContent className="prose prose-lg max-w-none py-8">
              <Streamdown>{article.content}</Streamdown>
            </CardContent>
          </Card>

          {/* Comments */}
          <div className="mt-8">
            <CommentsSection articleId={article.id} />
          </div>

          {/* Newsletter Signup */}
          <div className="mt-8">
            <NewsletterSignup />
          </div>

          {/* Disclaimer */}
          <Card className="mt-8 bg-muted/30">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">
                <strong>Disclaimer:</strong> This content is AI-generated and provided for informational purposes only. 
                It should not be considered financial advice. Always conduct your own research and consult with a 
                qualified financial advisor before making investment decisions.
              </p>
            </CardContent>
          </Card>
        </article>
      </main>

      <Footer />
    </div>
  );
}
