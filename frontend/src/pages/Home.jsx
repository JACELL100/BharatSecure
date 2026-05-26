import React, { useState, useRef, useEffect, Suspense, lazy } from "react";
import { useLocation } from "react-router-dom";
import OurFeatures from "../components/OurFeatures";
import FloatingChatbot from "@/components/FloatingChatbot";
import Chartglobal from "./chart-global";
import LanguageToggle from "@/components/ui/LanguageToggle";

const Testimonials = lazy(() => import("@/components/Testimonials"));
const FAQSection = lazy(() => import("@/components/FAQ"));
const Footer = lazy(() => import("../components/Footer"));

const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[280px]">
    <div className="relative w-16 h-16">
      <div className="w-16 h-16 rounded-full border-4 border-cyan-200/20 border-t-cyan-300 animate-spin"></div>
    </div>
  </div>
);

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const faqRef = useRef(null);
  const featuresRef = useRef(null);
  const location = useLocation();
  const API_URL = (import.meta.env.VITE_API_URL || "https://bharatsecure-backend.onrender.com").replace(/\/+$/, "");

  useEffect(() => {
    if (location.state?.scrollToFaq && faqRef.current) {
      const offset = 70;
      const targetPosition =
        faqRef.current.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: targetPosition - offset });
    }
  }, [location.state]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/api/advanced-incident-analysis/`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        await response.json();
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  const scrollToFeatures = () => {
    if (featuresRef.current) {
      const offset = 70;
      const elementPosition = featuresRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleSOSClick = () => {
    setShowConfirm(true);
  };

  const confirmSOS = () => {
    setShowConfirm(false);
    alert("SOS sent successfully! 🚨");
  };

  return (
    <div className="min-h-screen">
      <LanguageToggle />

      <div className="relative z-10">
        <section className="relative min-h-[88vh] px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-16 left-8 sm:left-16 w-40 sm:w-52 h-40 sm:h-52 rounded-full bg-cyan-400/10 blur-3xl animate-pulse"></div>
            <div className="absolute right-6 sm:right-12 top-24 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-emerald-300/10 blur-3xl animate-pulse"></div>
          </div>

          <div className="relative max-w-5xl w-full glass-panel rounded-3xl p-8 sm:p-12 reveal-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 text-xs sm:text-sm tracking-[0.18em] uppercase">
              Civic Response Intelligence
            </div>

            <h1 className="mt-6 section-title text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              Report Faster. Respond Smarter. Keep Cities Safer.
            </h1>

            <p className="mt-5 max-w-3xl text-slate-300 text-base sm:text-lg leading-relaxed">
              BharatSecure helps citizens report civic issues, emergency risks,
              and infrastructure breakdowns with powerful tools such as AI
              assistant support, heatmaps, and intelligent analytics.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:items-center">
              <button
                onClick={handleSOSClick}
                className="glass-button neon-outline text-white font-semibold text-sm sm:text-base px-7 py-4 rounded-full flex items-center justify-center gap-3"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Emergency SOS
              </button>

              <button
                onClick={scrollToFeatures}
                className="glass-button text-slate-100 font-semibold text-sm sm:text-base px-7 py-4 rounded-full"
              >
                Explore Platform Features
              </button>
            </div>

            {loading && (
              <p className="mt-6 text-sm text-cyan-100/80">
                Syncing latest incident intelligence...
              </p>
            )}
          </div>
        </section>

        <div ref={featuresRef} className="px-4 sm:px-6 lg:px-8 py-10">
          <section className="glass-panel rounded-3xl p-2 sm:p-4">
            <OurFeatures />
          </section>
        </div>

        <section className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass-panel rounded-3xl p-4 sm:p-6">
            <Chartglobal />
          </div>
        </section>

        <Suspense fallback={<LoadingSpinner />}>
          <section className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="glass-panel rounded-3xl p-4 sm:p-6">
              <Testimonials />
            </div>
          </section>
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <section ref={faqRef} className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="glass-panel rounded-3xl p-4 sm:p-6">
              <FAQSection />
            </div>
          </section>
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <section className="px-4 sm:px-6 lg:px-8 pt-6 pb-10">
            <div className="glass-panel rounded-3xl">
              <Footer />
            </div>
          </section>
        </Suspense>
      </div>

      <div className="relative z-50">
        <div className="fixed bottom-6 right-6 rounded-full shadow-lg">
          <FloatingChatbot />
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 px-4">
          <div className="glass-panel rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center text-slate-100">
            <h2 className="text-lg font-semibold mb-4">
              Are you sure you want to send an SOS?
            </h2>
            <div className="flex justify-center gap-3">
              <button
                onClick={confirmSOS}
                className="glass-button text-red-300 border-red-400/40 px-5 py-2 rounded-full"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="glass-button text-slate-100 px-5 py-2 rounded-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
