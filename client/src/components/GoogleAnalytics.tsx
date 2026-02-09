import { useEffect } from "react";
import { useLocation } from "wouter";

export default function GoogleAnalytics() {
  const [location] = useLocation();
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (!measurementId || measurementId === "NOT_SET") {
      return;
    }

    // Load Google Analytics script
    const script1 = document.createElement("script");
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag("js", new Date());
    gtag("config", measurementId);

    // Make gtag available globally
    (window as any).gtag = gtag;

    return () => {
      script1.remove();
    };
  }, [measurementId]);

  // Track page views on route changes
  useEffect(() => {
    if (!measurementId || measurementId === "NOT_SET") {
      return;
    }

    const gtag = (window as any).gtag;
    if (gtag) {
      gtag("event", "page_view", {
        page_path: location,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location, measurementId]);

  return null;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}
