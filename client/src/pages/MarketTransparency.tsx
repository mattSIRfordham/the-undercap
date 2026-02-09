import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, TrendingUp, RefreshCw, AlertCircle, History } from "lucide-react";
import SpreadChart from "@/components/SpreadChart";
import SpreadAlerts from "@/components/SpreadAlerts";
import { useAuth } from "@/_core/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MarketTransparency() {
  const { isAuthenticated } = useAuth();
  const [tickers, setTickers] = useState<string[]>([]);
  const [newTicker, setNewTicker] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [historyDays, setHistoryDays] = useState(7);

  // Get default watchlist on mount
  const { data: defaultWatchlist } = trpc.marketData.getDefaultWatchlist.useQuery();

  useEffect(() => {
    if (defaultWatchlist && tickers.length === 0) {
      setTickers(defaultWatchlist);
    }
  }, [defaultWatchlist]);

  // Fetch quotes for all tickers
  const { data: quotes, refetch, isLoading } = trpc.marketData.getMultipleQuotes.useQuery(
    { tickers },
    { enabled: tickers.length > 0, refetchInterval: autoRefresh ? 30000 : false }
  );

  // Fetch spread statistics
  const { data: stats } = trpc.marketData.getSpreadStats.useQuery(
    { tickers },
    { enabled: tickers.length > 0, refetchInterval: autoRefresh ? 30000 : false }
  );

  // Fetch historical data for selected ticker
  const { data: historyData } = trpc.marketData.getSpreadHistory.useQuery(
    { ticker: selectedTicker!, days: historyDays },
    { enabled: !!selectedTicker }
  );

  const handleAddTicker = () => {
    const ticker = newTicker.trim().toUpperCase();
    if (ticker && !tickers.includes(ticker)) {
      setTickers([...tickers, ticker]);
      setNewTicker("");
    }
  };

  const handleRemoveTicker = (ticker: string) => {
    setTickers(tickers.filter(t => t !== ticker));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return value.toFixed(3) + '%';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEO
        title="Market Transparency Dashboard | The Undercap"
        description="Real-time bid-ask spread monitoring for small-cap stocks. Track market liquidity and transparency — from The Undercap."
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
          <div className="container py-12">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-8 h-8 text-primary" />
                <Badge variant="secondary">Live Data</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                Market Transparency Dashboard
              </h1>
              <p className="text-lg text-muted-foreground text-balance">
                Real-time bid-ask spread monitoring for small-cap stocks. Exposing the true cost of trading in underserved markets where spreads can be significantly wider than large-cap stocks.
              </p>
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="container py-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2 flex-1 max-w-md">
              <Input
                placeholder="Add ticker (e.g., AAPL)"
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTicker()}
                maxLength={10}
              />
              <Button onClick={handleAddTicker}>Add</Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={autoRefresh ? "default" : "outline"}
                onClick={() => setAutoRefresh(!autoRefresh)}
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? "Auto-Refresh On" : "Auto-Refresh Off"}
              </Button>
              <Button
                variant="outline"
                onClick={() => refetch()}
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Now
              </Button>
            </div>
          </div>
        </section>

        {/* Statistics Overview */}
        {stats && quotes && quotes.length > 0 && (
          <section className="container pb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Average Spread</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.avgSpread)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatPercent(stats.avgSpreadPercent)} of bid price
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Spread Range</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats.minSpread)} - {formatCurrency(stats.maxSpread)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Min to Max across watchlist
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats.totalVolume / 1000000).toFixed(2)}M
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Combined trading volume
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{quotes.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Stocks in watchlist
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Historical Charts & Alerts */}
        {selectedTicker && (
          <section className="container pb-8">
            <Tabs defaultValue="history" className="w-full">
              <TabsList>
                <TabsTrigger value="history">
                  <History className="w-4 h-4 mr-2" />
                  Historical Data
                </TabsTrigger>
                {isAuthenticated && (
                  <TabsTrigger value="alerts">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Alerts
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="history" className="mt-4">
                <div className="mb-4 flex gap-2">
                  {[1, 7, 30, 90].map(days => (
                    <Button
                      key={days}
                      variant={historyDays === days ? "default" : "outline"}
                      size="sm"
                      onClick={() => setHistoryDays(days)}
                    >
                      {days}D
                    </Button>
                  ))}
                </div>
                {historyData && (
                  <SpreadChart
                    ticker={selectedTicker}
                    data={historyData}
                    days={historyDays}
                  />
                )}
              </TabsContent>
              
              {isAuthenticated && (
                <TabsContent value="alerts" className="mt-4">
                  <SpreadAlerts />
                </TabsContent>
              )}
            </Tabs>
          </section>
        )}

        {/* Real-Time Quotes */}
        <section className="container pb-12">
          {isLoading && (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading market data...</p>
            </div>
          )}

          {!isLoading && (!quotes || quotes.length === 0) && (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                <p className="text-muted-foreground">
                  Add ticker symbols above to start monitoring bid-ask spreads
                </p>
              </CardContent>
            </Card>
          )}

          {quotes && quotes.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {quotes.map((quote) => (
                <Card key={quote.ticker} className="relative">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTicker(quote.ticker)}
                    >
                      <History className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTicker(quote.ticker)}
                    >
                      ×
                    </Button>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{quote.ticker}</CardTitle>
                        <CardDescription className="text-sm">
                          {quote.companyName}
                        </CardDescription>
                      </div>
                      <Badge variant={quote.spreadPercent > 1 ? "destructive" : "secondary"}>
                        {formatPercent(quote.spreadPercent)} spread
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Bid</p>
                        <p className="text-lg font-semibold text-red-500">
                          {formatCurrency(quote.bid)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Last</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(quote.lastPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Ask</p>
                        <p className="text-lg font-semibold text-green-500">
                          {formatCurrency(quote.ask)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Spread</p>
                        <p className="text-sm font-medium">{formatCurrency(quote.spread)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Volume</p>
                        <p className="text-sm font-medium">
                          {(quote.volume / 1000000).toFixed(2)}M
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">
                      Updated: {new Date(quote.timestamp).toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Educational Section */}
        <section className="bg-muted/50 border-y">
          <div className="container py-12">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Why Bid-Ask Spreads Matter</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  The bid-ask spread represents the hidden cost of trading. For small-cap stocks, these spreads can be significantly wider than large-cap stocks, creating an additional barrier for retail investors.
                </p>
                <p>
                  <strong>Wide spreads indicate:</strong> Lower liquidity, higher trading costs, and potential market manipulation. Small-cap companies already face disadvantages in market access—wide spreads compound these challenges by making it more expensive for investors to enter and exit positions.
                </p>
                <p>
                  <strong>This dashboard promotes transparency</strong> by exposing real-time spread data, helping investors understand the true cost of trading in underserved markets.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
