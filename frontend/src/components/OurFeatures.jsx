import { Link } from "react-router-dom";

const featureCards = [
  {
    id: "ai",
    title: "Saathi AI",
    description:
      "Your AI-powered assistant for medical, safety, and emotional support, including legal guidance.",
    image:
      "https://img.freepik.com/free-vector/chat-bot-concept-illustration_114360-5522.jpg",
    route: "/chatbot",
  },
  {
    id: "report",
    title: "Report Incident",
    description:
      "Submit detailed civic incident reports quickly with a streamlined interface designed for urgent action.",
    image:
      "https://images.squarespace-cdn.com/content/v1/5bab316f7980b339c6dde5c2/877c3b92-24f0-4aa4-8804-2a389705d989/noun-warning-1109440-F5333F.png",
    route: "/report-incident",
  },
  {
    id: "heatmap",
    title: "Heatmap Insights",
    description:
      "Visualize risk clusters using dynamic heatmaps so authorities and citizens can prioritize action zones.",
    image:
      "https://t4.ftcdn.net/jpg/04/23/40/87/360_F_423408792_3K3fZwYzn84LbJdIiKYW73FbMHnVFXd8.jpg",
    route: "/heatmap",
  },
  {
    id: "voice",
    title: "Voice to Text",
    description:
      "Report incidents hands-free with voice transcription for more accessible and rapid emergency reporting.",
    image:
      "https://play-lh.googleusercontent.com/pzAgoUBDDetHSQpPp29Z0wkMQNyBvQIXXpNSnO5_yS8IJFs2dIVUaGEqOJDPYW1I9vE",
    route: "/voice-report",
  },
];

const OurFeatures = () => {
  return (
    <div className="w-full rounded-3xl px-2 py-4 sm:p-6">
      <div className="text-center mb-10">
        <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-cyan-200/80">
          Explore BharatSecure
        </p>
        <h2 className="section-title mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold">
          Core Civic Protection Features
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-7">
        {featureCards.map((feature, index) => (
          <Link key={feature.id} to={feature.route} className="block">
            <article
              className="glass-panel rounded-2xl p-4 h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(4,8,18,0.62)] reveal-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="relative h-44 sm:h-48 rounded-xl overflow-hidden mb-4 border border-cyan-200/10">
                <img
                  className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-500"
                  src={feature.image}
                  alt={feature.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070a14] via-transparent to-transparent" />
              </div>

              <h3 className="text-xl font-bold text-slate-50">{feature.title}</h3>
              <p className="text-sm text-slate-300 mt-3 leading-relaxed min-h-20">
                {feature.description}
              </p>

              <div className="mt-5">
                <span className="inline-flex items-center gap-2 glass-button rounded-full text-cyan-100 text-xs sm:text-sm px-4 py-2">
                  Try Now
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
                  </svg>
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OurFeatures;
