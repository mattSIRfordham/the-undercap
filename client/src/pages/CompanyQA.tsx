import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Building2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function CompanyQA() {
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
                <MessageSquare className="w-8 h-8 text-primary" />
                <Badge variant="secondary">Investor Relations</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                Company Q&A Sessions
              </h1>
              <p className="text-lg text-muted-foreground text-balance">
                Get answers directly from company leadership. Our Q&A sessions provide transparency 
                and insights into strategy, operations, and future plans for featured small-cap companies.
              </p>
            </div>
          </div>
        </section>

        {/* Q&A Content */}
        <section className="container py-12 max-w-4xl">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : companies && companies.length > 0 ? (
            <div className="space-y-8">
              {companies.map((company) => (
                <CompanyQASection key={company.id} companyId={company.id} companyName={company.name} ticker={company.ticker} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Q&A Sessions Yet</h3>
                <p className="text-muted-foreground">
                  Check back soon for Q&A sessions with our featured companies.
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

function CompanyQASection({ companyId, companyName, ticker }: { companyId: number; companyName: string; ticker: string }) {
  const { data: qas, isLoading } = trpc.companies.getQAs.useQuery({ companyId });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!qas || qas.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">{companyName}</CardTitle>
            <Badge variant="outline" className="mt-1">{ticker}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {qas.map((qa, index) => (
            <AccordionItem key={qa.id} value={`item-${qa.id}`}>
              <AccordionTrigger className="text-left">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1 shrink-0">Q{index + 1}</Badge>
                  <span className="font-semibold">{qa.question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-12 pr-4">
                  <div className="bg-muted/50 rounded-lg p-4 mb-3">
                    <p className="text-sm whitespace-pre-wrap">{qa.answer}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {qa.askedBy && <span>Asked by: {qa.askedBy}</span>}
                    {qa.answeredBy && <span>Answered by: {qa.answeredBy}</span>}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
