import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./Home";
import TopNavbar from "./Navbar";
import Footer from "./Footer";
import { PortalProvider } from "../context/PortalContext";

// Lazy-load non-home routes to reduce initial bundle size
const About = lazy(() => import("./About"));
const Services = lazy(() => import("./Services"));
const Gallery = lazy(() => import("./Gallery"));
const FAQ = lazy(() => import("./FAQ"));
const GetInTouch = lazy(() => import("./GetInTouch"));
const SongRequest = lazy(() => import("./SongRequest"));
const Contract = lazy(() => import("./Contract"));
const EventContract        = lazy(() => import("./EventContract"));
const CounterSign          = lazy(() => import("./CounterSign"));
const SendContract         = lazy(() => import("./SendContract"));
const SendEventContract    = lazy(() => import("./SendEventContract"));
const SendPaymentRequest   = lazy(() => import("./SendPaymentRequest"));
const Pay                  = lazy(() => import("./Pay"));
const Portal               = lazy(() => import("./Portal"));
const Notes                = lazy(() => import("./Notes"));
const SendMeetInvite       = lazy(() => import("./SendMeetInvite"));

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

// ── Portal routes — no navbar/footer, own chrome ──────────────────────────────
const PortalRoutes = () => (
  <PortalProvider>
    <Suspense fallback={null}>
      <Routes>
        <Route path="/portal" element={<Portal />}>
          <Route index element={<Navigate to="send-contract" replace />} />
          <Route path="send-contract"  element={<SendContract       portalMode />} />
          <Route path="event-contract" element={<SendEventContract  portalMode />} />
          <Route path="payment"        element={<SendPaymentRequest portalMode />} />
          <Route path="meet-invite"    element={<SendMeetInvite />} />
          <Route path="countersign"    element={<CounterSign   portalMode />} />
          <Route path="notes"          element={<Notes />} />
        </Route>
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Routes>
    </Suspense>
  </PortalProvider>
);

const Handler = () => {
  const { pathname } = useLocation();

  if (pathname.startsWith("/portal")) return <PortalRoutes />;

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
            <Route path="/contract"       element={<Contract />} />
            <Route path="/event-contract" element={<EventContract />} />
            <Route path="/countersign"          element={<CounterSign />} />
            <Route path="/pay"                  element={<Pay />} />
            {/* Old standalone portal URLs → redirect to portal */}
            <Route path="/send-contract"        element={<Navigate to="/portal/send-contract" replace />} />
            <Route path="/send-payment-request" element={<Navigate to="/portal/payment" replace />} />
            {/* Other redirects */}
            <Route path="/booknow"  element={<Navigate to="/get-in-touch" replace />} />
            <Route path="/book-now" element={<Navigate to="/get-in-touch" replace />} />
            <Route path="/weddings" element={<Navigate to="/services" replace />} />
            <Route path="/events"   element={<Navigate to="/services" replace />} />
            <Route path="/contact"  element={<Navigate to="/get-in-touch" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Handler;
