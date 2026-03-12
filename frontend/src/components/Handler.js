import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./Home";
import TopNavbar from "./Navbar";
import Footer from "./Footer";

// Lazy-load non-home routes to reduce initial bundle size
const About = lazy(() => import("./About"));
const Services = lazy(() => import("./Services"));
const Gallery = lazy(() => import("./Gallery"));
const FAQ = lazy(() => import("./FAQ"));
const GetInTouch = lazy(() => import("./GetInTouch"));
const SongRequest = lazy(() => import("./SongRequest"));

// Scroll to top on route change & track pageviews
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);

    // Send pageview to Google Analytics (GA4) + Google Ads for SPA route changes
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_path: pathname,
        page_title: document.title,
      });
    }

    // Send pageview to Meta Pixel for SPA route changes
    if (window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname]);
  return null;
};

const Handler = () => {
  return (
    <div className="app-wrapper">
      <ScrollToTop />
      <TopNavbar />
      <main>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/get-in-touch" element={<GetInTouch />} />
            <Route path="/request-a-song" element={<SongRequest />} />
            {/* Redirects for old routes */}
            <Route
              path="/booknow"
              element={<Navigate to="/get-in-touch" replace />}
            />
            <Route
              path="/book-now"
              element={<Navigate to="/get-in-touch" replace />}
            />
            <Route
              path="/weddings"
              element={<Navigate to="/services" replace />}
            />
            <Route
              path="/events"
              element={<Navigate to="/services" replace />}
            />
            <Route
              path="/contact"
              element={<Navigate to="/get-in-touch" replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Handler;
