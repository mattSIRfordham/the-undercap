import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, TrendingUp, Filter } from "lucide-react";
import { Link } from "wouter";

interface ScreenerFilters {
  minMarketCap?: number;
  maxMarketCap?: number;
  minFloat?: number;
  maxFloat?: number;
  sectors: string[];
  exchanges: ("NASDAQ" | "NYSE" | "OTC")[];
  minPrice?: number;
  maxPrice?: number;
  minVolume?: number;
  sortBy: "marketCap" | "ticker" | "price" | "volume" | "float";
  sortOrder: "asc" | "desc";
}

export default function StockScreener() {
  const [filters, setFilters] = useState<ScreenerFilters>({
    sectors: [],
    exchanges: [],
    sortBy: "marketCap",
    sortOrder: "desc"
  });

  const [hasSearched, setHasSearched] = useState(false);

  const { data: sectors } = trpc.screener.getSectors.useQuery();
  const { data: stats } = trpc.screener.getStats.useQuery();
  const { data: results, isLoading, refetch } = trpc.screener.search.useQuery(
    {
      ...filters,
      limit: 100
    },
    { enabled: hasSearched }
  );

  const handleSearch = () => {
    setHasSearched(true);
    refetch();
  };

  const handleReset = () => {
    setFilters({
      sectors: [],
      exchanges: [],
      sortBy: "marketCap",
      sortOrder: "desc"
    });
    setHasSearched(false);
  };

  const toggleExchange = (exchange: "NASDAQ" | "NYSE" | "OTC") => {
    setFilters(prev => ({
      ...prev,
      exchanges: prev.exchanges.includes(exchange)
        ? prev.exchanges.filter(e => e !== exchange)
        : [...prev.exchanges, exchange]
    }));
  };

  const toggleSector = (sector: string) => {
    setFilters(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector]
    }));
  };

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return "N/A";
    return num.toLocaleString();
  };

  const formatMarketCap = (cap: number | null | undefined) => {
    if (cap === null || cap === undefined) return "N/A";
    if (cap >= 1000000000) return `$${(cap / 1000000000).toFixed(2)}B`;
    if (cap >= 1000000) return `$${(cap / 1000000).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEO
        title="Stock Screener | The Undercap"
        description="Filter and search nanocap, microcap, and small-cap stocks by market cap, sector, float, and exchange — powered by The Undercap"
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
          <div className="container py-12">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-8 h-8 text-primary" />
                <Badge variant="secondary">Stock Screener</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                Find Small-Cap Opportunities
              </h1>
              <p className="text-lg text-muted-foreground text-balance">
                Filter companies by market cap, sector, float, and exchange to discover undervalued small-cap stocks
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {stats && (
          <section className="container py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{formatNumber(stats.totalCompanies)}</div>
                  <p className="text-sm text-muted-foreground">Total Companies</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{formatNumber(stats.nasdaqCount)}</div>
                  <p className="text-sm text-muted-foreground">NASDAQ</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{formatNumber(stats.nyseCount)}</div>
                  <p className="text-sm text-muted-foreground">NYSE</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{formatNumber(stats.otcCount)}</div>
                  <p className="text-sm text-muted-foreground">OTC</p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Screener Section */}
        <section className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    <CardTitle>Filters</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Market Cap */}
                  <div className="space-y-2">
                    <Label>Market Cap (USD)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.minMarketCap || ""}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            minMarketCap: e.target.value ? Number(e.target.value) : undefined
                          }))}
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.maxMarketCap || ""}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            maxMarketCap: e.target.value ? Number(e.target.value) : undefined
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Float */}
                  <div className="space-y-2">
                    <Label>Float (Shares)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minFloat || ""}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          minFloat: e.target.value ? Number(e.target.value) : undefined
                        }))}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxFloat || ""}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          maxFloat: e.target.value ? Number(e.target.value) : undefined
                        }))}
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label>Price (USD)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Min"
                        value={filters.minPrice || ""}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          minPrice: e.target.value ? Number(e.target.value) : undefined
                        }))}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Max"
                        value={filters.maxPrice || ""}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          maxPrice: e.target.value ? Number(e.target.value) : undefined
                        }))}
                      />
                    </div>
                  </div>

                  {/* Volume */}
                  <div className="space-y-2">
                    <Label>Min Volume</Label>
                    <Input
                      type="number"
                      placeholder="Min daily volume"
                      value={filters.minVolume || ""}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        minVolume: e.target.value ? Number(e.target.value) : undefined
                      }))}
                    />
                  </div>

                  {/* Exchanges */}
                  <div className="space-y-2">
                    <Label>Exchanges</Label>
                    <div className="space-y-2">
                      {(["NASDAQ", "NYSE", "OTC"] as const).map(exchange => (
                        <div key={exchange} className="flex items-center space-x-2">
                          <Checkbox
                            id={exchange}
                            checked={filters.exchanges.includes(exchange)}
                            onCheckedChange={() => toggleExchange(exchange)}
                          />
                          <label htmlFor={exchange} className="text-sm cursor-pointer">
                            {exchange}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sectors */}
                  {sectors && sectors.length > 0 && (
                    <div className="space-y-2">
                      <Label>Sectors</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {sectors.map(sector => (
                          <div key={sector} className="flex items-center space-x-2">
                            <Checkbox
                              id={sector}
                              checked={filters.sectors.includes(sector)}
                              onCheckedChange={() => toggleSector(sector)}
                            />
                            <label htmlFor={sector} className="text-sm cursor-pointer">
                              {sector}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sort */}
                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketCap">Market Cap</SelectItem>
                        <SelectItem value="ticker">Ticker</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="volume">Volume</SelectItem>
                        <SelectItem value="float">Float</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Order</Label>
                    <Select
                      value={filters.sortOrder}
                      onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortOrder: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Descending</SelectItem>
                        <SelectItem value="asc">Ascending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4">
                    <Button onClick={handleSearch} className="w-full">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                    <Button onClick={handleReset} variant="outline" className="w-full">
                      Reset Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                  <CardDescription>
                    {hasSearched && results ? `Found ${results.length} companies` : "Configure filters and click Search"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!hasSearched ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Set your filters and click Search to find companies</p>
                    </div>
                  ) : isLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, idx) => (
                        <Skeleton key={idx} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : results && results.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3 font-semibold">Ticker</th>
                            <th className="text-left p-3 font-semibold">Company</th>
                            <th className="text-left p-3 font-semibold">Exchange</th>
                            <th className="text-right p-3 font-semibold">Market Cap</th>
                            <th className="text-right p-3 font-semibold">Price</th>
                            <th className="text-right p-3 font-semibold">Float</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map(company => (
                            <tr key={company.id} className="border-b hover:bg-muted/50 transition-colors">
                              <td className="p-3">
                                <Link href={`/company/${company.ticker}`}>
                                  <a className="font-semibold text-primary hover:underline">
                                    {company.ticker}
                                  </a>
                                </Link>
                              </td>
                              <td className="p-3">
                                <div>
                                  <div className="font-medium">{company.name}</div>
                                  {company.sector && (
                                    <div className="text-xs text-muted-foreground">{company.sector}</div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <Badge variant="outline">{company.exchange}</Badge>
                              </td>
                              <td className="p-3 text-right">{formatMarketCap(company.marketCap)}</td>
                              <td className="p-3 text-right">
                                {company.currentPrice ? `$${company.currentPrice}` : "N/A"}
                              </td>
                              <td className="p-3 text-right">{formatNumber(company.floatShares)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No companies match your filters. Try adjusting your criteria.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
