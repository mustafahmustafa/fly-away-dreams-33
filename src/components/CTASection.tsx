import { useState } from "react";

const CTASection = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-20 px-5 md:px-10 bg-midnight text-center">
      <div className="max-w-[560px] mx-auto">
        <h2 className="font-display text-[38px] font-extrabold text-foreground tracking-[-1px] mb-3.5">
          Never miss a <span className="text-accent">deal</span>
        </h2>
        <p className="text-base font-light text-foreground/50 mb-8 leading-relaxed">
          Subscribe and get exclusive flight deals, price drops, and travel tips delivered weekly.
        </p>

        {submitted ? (
          <div className="bg-success/10 border border-success/25 rounded-pill py-3 px-6 text-success text-sm font-medium">
            ✓ You're subscribed! Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 bg-foreground/[0.05] border border-foreground/10 rounded-pill p-1.5 pl-5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-transparent border-none outline-none font-body text-[15px] text-foreground placeholder:text-foreground/30"
            />
            <button
              type="submit"
              className="bg-primary text-foreground border-none rounded-pill font-body text-sm font-medium px-6 py-2.5 cursor-pointer transition-colors hover:bg-sky-light whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default CTASection;
