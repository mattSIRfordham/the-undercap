import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PenSquare, Send, CheckCircle2 } from "lucide-react";

export default function SubmitContent() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    authorName: user?.name || "",
    authorEmail: user?.email || "",
    title: "",
    content: "",
    category: "market_analysis" as "market_analysis" | "company_news" | "regulatory" | "opinion",
    companyTickers: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const createSubmission = trpc.submissions.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Submission received! We'll review it shortly.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit content");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.content.length < 100) {
      toast.error("Content must be at least 100 characters");
      return;
    }

    const tickers = formData.companyTickers
      ? formData.companyTickers.split(",").map(t => t.trim().toUpperCase()).filter(Boolean)
      : [];

    createSubmission.mutate({
      authorName: formData.authorName,
      authorEmail: formData.authorEmail,
      title: formData.title,
      content: formData.content,
      category: formData.category,
      companyTickers: tickers.length > 0 ? tickers : undefined,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <SEO
          title="Submission Received | The Undercap"
          description="Your content has been submitted for review"
        />
        <Header />
        
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md mx-4">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Submission Received!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for your contribution. Our editorial team will review your submission and get back to you soon.
              </p>
              <Button onClick={() => setSubmitted(false)}>
                Submit Another
              </Button>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEO
        title="Submit Content | The Undercap"
        description="Share your market analysis and insights with our community"
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
          <div className="container py-12">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <PenSquare className="w-8 h-8 text-primary" />
                <Badge variant="secondary">Contribute</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                Submit Your Analysis
              </h1>
              <p className="text-lg text-muted-foreground text-balance">
                Share your market insights, company analysis, or opinion pieces with our community. All submissions are reviewed by our editorial team.
              </p>
            </div>
          </div>
        </section>

        {/* Submission Form */}
        <section className="container py-12">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Content Submission Form</CardTitle>
                <CardDescription>
                  Fill out the form below to submit your content for review. We're particularly interested in analysis of small-cap companies and market trends.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Author Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="authorName">Your Name *</Label>
                      <Input
                        id="authorName"
                        value={formData.authorName}
                        onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                        required
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="authorEmail">Email *</Label>
                      <Input
                        id="authorEmail"
                        type="email"
                        value={formData.authorEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, authorEmail: e.target.value }))}
                        required
                        maxLength={320}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Article Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Why Small-Cap Biotech is Undervalued in 2026"
                      required
                      minLength={5}
                      maxLength={500}
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market_analysis">Market Analysis</SelectItem>
                        <SelectItem value="company_news">Company News</SelectItem>
                        <SelectItem value="regulatory">Regulatory</SelectItem>
                        <SelectItem value="opinion">Opinion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Company Tickers */}
                  <div className="space-y-2">
                    <Label htmlFor="tickers">Related Company Tickers (Optional)</Label>
                    <Input
                      id="tickers"
                      value={formData.companyTickers}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyTickers: e.target.value }))}
                      placeholder="e.g., AAPL, MSFT, TSLA (comma-separated)"
                    />
                    <p className="text-xs text-muted-foreground">
                      List any company ticker symbols mentioned in your article
                    </p>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <Label htmlFor="content">Article Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your article here... (minimum 100 characters)"
                      rows={15}
                      required
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.content.length} characters (minimum 100 required)
                    </p>
                  </div>

                  {/* Guidelines */}
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <h3 className="font-semibold text-sm">Submission Guidelines</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Content should be original and not published elsewhere</li>
                      <li>Focus on small-cap companies (under $1B market cap)</li>
                      <li>Provide factual analysis with supporting data when possible</li>
                      <li>Maintain a professional and respectful tone</li>
                      <li>Disclose any conflicts of interest or positions in mentioned companies</li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={createSubmission.isPending}
                      size="lg"
                    >
                      {createSubmission.isPending ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit for Review
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
