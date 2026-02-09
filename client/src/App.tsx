import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import GoogleAnalytics from "./components/GoogleAnalytics";
import Home from "./pages/Home";
import ArticlePage from "./pages/ArticlePage";
import FeaturedCompanies from "./pages/FeaturedCompanies";
import CompanyQA from "./pages/CompanyQA";
import CompanyDetail from "./pages/CompanyDetail";
import StockScreener from "./pages/StockScreener";
import SubmitContent from "./pages/SubmitContent";
import MarketTransparency from "./pages/MarketTransparency";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/article/:slug"} component={ArticlePage} />
      <Route path={"/featured-companies"} component={FeaturedCompanies} />
      <Route path={"/company-qa"} component={CompanyQA} />
      <Route path={"/company/:ticker"} component={CompanyDetail} />
      <Route path={"/stock-screener"} component={StockScreener} />
      <Route path={"/submit"} component={SubmitContent} />
      <Route path={"/market-transparency"} component={MarketTransparency} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <GoogleAnalytics />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}