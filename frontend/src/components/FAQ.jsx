import { useState } from "react";

const FAQSection = () => {
  const [open, setOpen] = useState(null);

  const toggleOpen = (index) => {
    setOpen(open === index ? null : index);
  };

  const faqData = [
    {
      question: "How do I report an incident?",
      answer:
        "Click the Report Incident feature, fill in the details, and submit. Your report is sent to the appropriate workflow immediately.",
    },
    {
      question: "What kind of incidents can I report?",
      answer:
        "You can report civic and safety incidents such as road damage, public hazards, emergencies, and community risk situations.",
    },
    {
      question: "How will I know when my report is resolved?",
      answer:
        "You can track status updates from the dashboard once authorities process and close your incident report.",
    },
    {
      question: "Can I report incidents anonymously?",
      answer:
        "Yes. You can choose anonymous reporting in applicable flows, though contact details can improve response coordination.",
    },
    {
      question: "What happens after submission?",
      answer:
        "The report is reviewed, categorized, and routed to relevant responders. Status then updates as progress happens.",
    },
  ];

  return (
    <section className="py-6 sm:py-8">
      <div className="text-center mb-8">
        <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-cyan-200/80">
          Help Center
        </p>
        <h2 className="section-title mt-3 text-3xl lg:text-5xl font-extrabold">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="max-w-4xl mx-auto px-1 sm:px-2">
        {faqData.map((item, index) => {
          const isOpen = open === index;
          return (
            <article key={index} className="mb-4 reveal-up" style={{ animationDelay: `${index * 80}ms` }}>
              <button
                onClick={() => toggleOpen(index)}
                className="w-full text-left px-6 py-4 rounded-2xl glass-panel transition-all duration-300 hover:-translate-y-0.5"
              >
                <span className="text-sm sm:text-base font-medium text-slate-100">
                  {item.question}
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-400 ease-out ${
                  isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 py-4 text-sm sm:text-base text-slate-300 border border-t-0 border-cyan-200/10 rounded-b-2xl bg-[#0b1220]/80">
                  {item.answer}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default FAQSection;
