import { useNavigate } from "react-router-dom";
import { FaRobot } from "react-icons/fa";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const FloatingChatbot = () => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) {
    return null;
  }

  return createPortal(
    // Render into document.body so fixed positioning stays tied to the viewport.
    <div
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 group cursor-pointer z-50"
      onClick={() => navigate("/chatbot")}
      aria-label="Open Saathi AI chatbot"
    >
      <div className="relative flex items-center">
        <span className="absolute right-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#0e1523]/95 border border-cyan-200/25 text-cyan-100 text-xs sm:text-sm font-medium py-2 px-3 rounded-xl shadow-xl whitespace-nowrap">
          Open Saathi AI
        </span>

        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-cyan-300/45 text-cyan-100 flex items-center justify-center shadow-[0_12px_30px_rgba(8,16,35,0.65)] bg-[radial-gradient(circle_at_30%_30%,rgba(54,217,255,0.35),rgba(10,16,27,0.95))] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_28px_rgba(54,217,255,0.4)] ${
            animate ? "animate-bounce" : ""
          }`}
        >
          <FaRobot className="text-2xl sm:text-3xl" />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FloatingChatbot;
