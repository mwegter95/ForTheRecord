import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./Home";
import About from "./About";
import Services from "./Services";
import Gallery from "./Gallery";
import FAQ from "./FAQ";
import GetInTouch from "./GetInTouch";
import TopNavbar from "./Navbar";
import Footer from "./Footer";

// Scroll to top on route change & track pageviews
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Send pageview to Google Analytics (GA4) + Google Ads for SPA route changes
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pathname,
        page_title: document.title,
      });
    }
    
    // Send pageview to Meta Pixel for SPA route changes
    if (window.fbq) {
      window.fbq('track', 'PageView');
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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/get-in-touch" element={<GetInTouch />} />
          {/* Redirects for old routes */}
          <Route path="/booknow" element={<Navigate to="/get-in-touch" replace />} />
          <Route path="/book-now" element={<Navigate to="/get-in-touch" replace />} />
          <Route path="/weddings" element={<Navigate to="/services" replace />} />
          <Route path="/events" element={<Navigate to="/services" replace />} />
          <Route path="/contact" element={<Navigate to="/get-in-touch" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default Handler;
