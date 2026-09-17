import { useEffect } from "react";
import { useLocation } from "wouter";

const MEASUREMENT_ID = "G-B5GHNSEB81";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function GoogleAnalytics() {
  const [location] = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== "function") {
      return;
    }

    window.gtag("event", "page_view", {
      page_location: window.location.href,
      page_path: location,
      page_title: document.title,
      send_to: MEASUREMENT_ID,
    });
  }, [location]);

  return null;
}
