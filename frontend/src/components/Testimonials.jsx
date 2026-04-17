import React from "react";

const testimonials = [
  {
    name: "Arjun",
    role: "Civil Engineer",
    testimonial:
      "The incident reporting system made it incredibly easy to report accidents and emergencies. Response was quick and structured.",
    image:
      "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg",
  },
  {
    name: "Priya",
    role: "Teacher",
    testimonial:
      "Reporting road hazards now feels effortless. The interface is clear, smooth, and gives confidence that reports are taken seriously.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsynwv-5qtogtOwJbIjaPFJUmHpzhxgqIAug&s",
  },
  {
    name: "Aryan",
    role: "Firefighter",
    testimonial:
      "As a first responder, I value how quickly incidents are tracked and prioritized. Communication with citizens is noticeably better.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRC8kiSH5ZSAcVoj3tAQQDoP_ux0sSricMyUg&s",
  },
];

const Testimonials = () => {
  return (
    <section className="rounded-3xl px-2 py-4 sm:p-4">
      <div className="text-center mb-10">
        <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-emerald-200/80">
          Voices From The Community
        </p>
        <h2 className="section-title mt-3 text-3xl md:text-4xl lg:text-5xl font-extrabold">
          People Trusting BharatSecure
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto mt-4">
          Real feedback from users who reported incidents and received faster,
          better coordinated support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {testimonials.map((item, index) => (
          <article
            key={item.name}
            className="glass-panel rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_55px_rgba(4,8,18,0.62)] reveal-up"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="h-14 w-14 rounded-full overflow-hidden border border-cyan-200/25 shadow-[0_0_0_6px_rgba(54,217,255,0.08)]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">{item.name}</h3>
                <p className="text-xs tracking-[0.16em] uppercase text-cyan-200/80">
                  {item.role}
                </p>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed italic">"{item.testimonial}"</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
