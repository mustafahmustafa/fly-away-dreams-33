import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const values = [
  { icon: "🤖", name: "AI-first thinking", desc: "Every feature starts with the question: how can AI make this better for the traveller?" },
  { icon: "🔒", name: "Radical transparency", desc: "No hidden fees. What you see in search results is exactly what you pay — taxes and all." },
  { icon: "⚡", name: "Speed above all", desc: "From search to confirmed booking in under 2 minutes. We obsess over every millisecond." },
  { icon: "🌍", name: "Global reach, local feel", desc: "Arabic language support and local payment methods for UAE, KSA, Egypt travellers." },
  { icon: "🤝", name: "Traveller first", desc: "Our 24/7 team in Arabic and English is there within minutes, not days." },
  { icon: "🌱", name: "Responsible travel", desc: "We offset carbon on every flight booked through our platform at no extra cost." },
];

const team = [
  { initials: "AK", name: "Ahmed Al-Khatib", role: "CEO & Co-founder", bio: "10 years in travel tech. Previously led product at Booking.com MENA.", color: "bg-primary/20" },
  { initials: "SR", name: "Sara Rashid", role: "CTO & Co-founder", bio: "Ex-Google engineer. Architect of SkyVoyAI's AI search engine.", color: "bg-accent/20" },
  { initials: "MH", name: "Mohammed Hassan", role: "Head of Partnerships", bio: "Manages our relationships with Hotelbeds, Amadeus, and Emirates.", color: "bg-gold/20" },
  { initials: "LM", name: "Layla Mansour", role: "Head of Customer Success", bio: "Leads our 24/7 support team in Arabic, English, and French.", color: "bg-success/20" },
];

const faqs = [
  { q: "How do I get my booking confirmation?", a: "Your confirmation and e-ticket are sent instantly to the email you provided at checkout. If you don't see it within 5 minutes, check your spam folder." },
  { q: "Can I cancel or change my booking?", a: "Most economy fares allow free cancellation within 24 hours of booking. For changes after 24 hours, airline fees may apply. Contact our support team with your booking reference." },
  { q: "Which payment methods do you accept?", a: "We accept PayPal, Visa, Mastercard, American Express, and Apple Pay. All payments are processed through a secure, encrypted gateway." },
  { q: "Is SkyVoyAI a licensed travel agency?", a: "Yes. SkyVoyAI is a fully licensed travel agency registered in the UAE. We are IATA accredited and operate in full compliance with UAE tourism regulations." },
  { q: "Do you offer corporate or B2B travel accounts?", a: "Yes! We offer business accounts with centralised billing and a dedicated account manager. Contact partners@skyvoyai.com to learn more." },
];

const About = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  return (
    <div>
      {/* Hero */}
      <section className="bg-midnight-soft border-b border-foreground/[0.05] pt-16 pb-14 px-5 md:px-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 600px 400px at 50% 60%, rgba(0,87,255,0.12) 0%, transparent 70%)' }} />
        <div className="relative z-10">
          <div className="text-[11px] font-semibold text-sky-light tracking-[0.12em] uppercase mb-3">About SkyVoyAI</div>
          <h1 className="font-display text-[clamp(32px,5vw,52px)] font-extrabold text-foreground tracking-[-1.5px] leading-[1.1] mb-4">
            Smarter travel for<br /><span className="text-accent">everyone</span>
          </h1>
          <p className="text-base font-light text-foreground/50 max-w-[520px] mx-auto leading-relaxed">
            We're building the future of travel booking — powered by AI, designed for humans, made in Dubai.
          </p>
        </div>
      </section>

      {/* Stats */}
      <div className="bg-midnight py-10 px-5 md:px-10">
        <div className="max-w-[900px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: "1M+", label: "Hotels", color: "bg-primary/10 border-primary/20" },
            { num: "500+", label: "Airlines", color: "bg-accent/10 border-accent/20" },
            { num: "195", label: "Countries", color: "bg-gold/10 border-gold/20" },
            { num: "24/7", label: "Support", color: "bg-success/10 border-success/20" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} border rounded-[18px] p-5 text-center`}>
              <div className="font-display text-[28px] font-extrabold text-foreground">{s.num}</div>
              <div className="text-xs text-foreground/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <section className="py-16 px-5 md:px-10 bg-midnight-soft">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-[11px] font-semibold text-sky-light tracking-[0.12em] uppercase mb-3">Our story</div>
            <h2 className="font-display text-[32px] font-extrabold text-foreground tracking-[-0.5px] leading-tight mb-4">
              From a Dubai idea to a global platform
            </h2>
            <p className="text-sm font-light text-foreground/50 leading-[1.7] mb-4">
              SkyVoyAI was born in 2023 when two travel-obsessed engineers in Dubai got tired of comparing prices across 15 tabs. They built an AI that does it in milliseconds.
            </p>
            <p className="text-sm font-light text-foreground/50 leading-[1.7]">
              Today, we serve travellers across the Middle East, Europe, and Asia — offering the fastest way to search, compare, and book flights and hotels at the best prices.
            </p>
          </div>
          <div className="bg-panel border border-foreground/[0.07] rounded-xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(0,87,255,0.1), transparent 70%)' }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between bg-primary/[0.08] border border-primary/15 rounded-lg p-3 mb-4">
                <div className="bg-foreground/10 rounded-pill px-3 py-1 text-xs text-foreground/60 font-medium">DXB</div>
                <div className="text-foreground/30 text-lg">— ✈ —</div>
                <div className="bg-foreground/10 rounded-pill px-3 py-1 text-xs text-foreground/60 font-medium">LHR</div>
                <div className="ml-auto text-[11px] text-success flex items-center gap-1">
                  <span className="w-2 h-2 bg-success rounded-full animate-pulse-dot" /> Live now
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-primary/[0.08] border border-primary/15 rounded-lg p-3 text-center">
                  <div className="font-display text-[22px] font-extrabold text-foreground">4.9<span className="text-sm text-foreground/40">★</span></div>
                  <div className="text-[11px] text-foreground/40 mt-0.5">App rating</div>
                </div>
                <div className="bg-success/[0.08] border border-success/15 rounded-lg p-3 text-center">
                  <div className="font-display text-[22px] font-extrabold text-foreground">2min</div>
                  <div className="text-[11px] text-foreground/40 mt-0.5">Avg. booking time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-5 md:px-10 bg-midnight">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-10">
            <div className="text-[11px] font-semibold text-sky-light tracking-[0.12em] uppercase mb-3">What drives us</div>
            <h2 className="font-display text-[32px] font-extrabold text-foreground tracking-[-0.5px]">Our values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((v) => (
              <div key={v.name} className="bg-panel border border-foreground/[0.07] rounded-[18px] p-6 transition-all hover:border-primary/25 hover:-translate-y-0.5">
                <div className="text-2xl mb-3">{v.icon}</div>
                <div className="font-display text-[15px] font-bold text-foreground mb-2">{v.name}</div>
                <p className="text-[13px] font-light text-foreground/45 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-5 md:px-10 bg-midnight-soft">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-10">
            <div className="text-[11px] font-semibold text-sky-light tracking-[0.12em] uppercase mb-3">The people behind SkyVoyAI</div>
            <h2 className="font-display text-[32px] font-extrabold text-foreground tracking-[-0.5px]">Meet the team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {team.map((t) => (
              <div key={t.name} className="bg-panel border border-foreground/[0.07] rounded-[18px] p-6 text-center transition-all hover:border-primary/25">
                <div className={`w-14 h-14 rounded-full ${t.color} flex items-center justify-center font-display text-base font-bold text-foreground mx-auto mb-4`}>
                  {t.initials}
                </div>
                <div className="font-display text-[15px] font-bold text-foreground mb-1">{t.name}</div>
                <div className="text-xs text-foreground/45 mb-3">{t.role}</div>
                <p className="text-xs font-light text-foreground/40 leading-relaxed">{t.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-5 md:px-10 bg-midnight" id="contact">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="text-[11px] font-semibold text-sky-light tracking-[0.12em] uppercase mb-3">Get in touch</div>
            <h2 className="font-display text-[32px] font-extrabold text-foreground tracking-[-0.5px] leading-tight mb-4">
              We'd love<br />to hear from you
            </h2>
            <p className="text-sm font-light text-foreground/50 leading-[1.7] mb-7">
              Have a question about a booking, need help with a refund, or want to explore a partnership? Our team responds within 2 hours.
            </p>
            <div className="flex flex-col gap-3.5">
              {[
                { icon: "✉", label: "Email support", value: "support@skyvoyai.com", note: "Response within 2 hours · Available 24/7" },
                { icon: "💬", label: "WhatsApp", value: "+971 4 000 0000", note: "Arabic & English · 8am–11pm GST" },
                { icon: "📍", label: "Office", value: "Dubai Internet City, UAE", note: "Building 4, Suite 312 · Sun–Thu 9am–6pm" },
                { icon: "🤝", label: "Partnerships", value: "partners@skyvoyai.com", note: "B2B portals, white-label, agency deals" },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-4 bg-panel border border-foreground/[0.07] rounded-[18px] p-[18px] px-5 transition-all hover:border-primary/30">
                  <div className="w-[42px] h-[42px] rounded-[11px] bg-primary/[0.12] border border-primary/20 flex items-center justify-center text-lg flex-shrink-0">
                    {c.icon}
                  </div>
                  <div>
                    <div className="text-[11px] text-foreground/40 uppercase tracking-wider mb-1">{c.label}</div>
                    <div className="text-sm font-medium text-foreground mb-0.5">{c.value}</div>
                    <div className="text-[11px] text-foreground/35">{c.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-panel border border-foreground/[0.07] rounded-xl p-7 px-7">
            {formSubmitted ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-success/[0.12] border border-success/25 flex items-center justify-center text-2xl mx-auto mb-4">✓</div>
                <div className="font-display text-xl font-extrabold text-foreground mb-2">Message sent!</div>
                <p className="text-[13px] text-foreground/50 leading-relaxed">Our team will reply within 2 hours.</p>
              </div>
            ) : (
              <>
                <div className="font-display text-[22px] font-extrabold text-foreground tracking-[-0.5px] mb-1.5">Send us a message</div>
                <p className="text-[13px] text-foreground/45 mb-6 leading-relaxed">We'll get back to you within 2 hours.</p>
                <div className="grid grid-cols-2 gap-3.5 mb-3.5">
                  <div className="flex flex-col gap-[7px]">
                    <label className="text-[11px] font-medium text-foreground/45 tracking-wider uppercase">First name</label>
                    <input type="text" placeholder="Your first name" className="w-full bg-foreground/[0.04] border border-foreground/10 rounded-lg py-3 px-3.5 font-body text-sm text-foreground placeholder:text-foreground/25 outline-none transition-all focus:border-primary/50 focus:bg-primary/[0.05]" />
                  </div>
                  <div className="flex flex-col gap-[7px]">
                    <label className="text-[11px] font-medium text-foreground/45 tracking-wider uppercase">Last name</label>
                    <input type="text" placeholder="Your last name" className="w-full bg-foreground/[0.04] border border-foreground/10 rounded-lg py-3 px-3.5 font-body text-sm text-foreground placeholder:text-foreground/25 outline-none transition-all focus:border-primary/50 focus:bg-primary/[0.05]" />
                  </div>
                </div>
                <div className="flex flex-col gap-[7px] mb-3.5">
                  <label className="text-[11px] font-medium text-foreground/45 tracking-wider uppercase">Email address</label>
                  <input type="email" placeholder="you@email.com" className="w-full bg-foreground/[0.04] border border-foreground/10 rounded-lg py-3 px-3.5 font-body text-sm text-foreground placeholder:text-foreground/25 outline-none transition-all focus:border-primary/50 focus:bg-primary/[0.05]" />
                </div>
                <div className="flex flex-col gap-[7px] mb-3.5">
                  <label className="text-[11px] font-medium text-foreground/45 tracking-wider uppercase">Subject</label>
                  <select className="w-full bg-foreground/[0.04] border border-foreground/10 rounded-lg py-3 px-3.5 font-body text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:bg-primary/[0.05] cursor-pointer appearance-none h-[46px]">
                    <option value="">Select a topic</option>
                    <option>Booking inquiry</option>
                    <option>Cancellation & refund</option>
                    <option>Payment issue</option>
                    <option>Business partnership</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-[7px] mb-3.5">
                  <label className="text-[11px] font-medium text-foreground/45 tracking-wider uppercase">Message</label>
                  <textarea placeholder="How can we help you?" className="w-full bg-foreground/[0.04] border border-foreground/10 rounded-lg py-3 px-3.5 font-body text-sm text-foreground placeholder:text-foreground/25 outline-none transition-all focus:border-primary/50 focus:bg-primary/[0.05] resize-y min-h-[120px] leading-relaxed" />
                </div>
                <button
                  onClick={() => setFormSubmitted(true)}
                  className="w-full py-4 bg-primary text-foreground border-none rounded-lg font-body text-[15px] font-medium cursor-pointer transition-all hover:bg-sky-light hover:-translate-y-px mt-5 flex items-center justify-center gap-2"
                >
                  Send message →
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-5 md:px-10 bg-midnight-soft">
        <div className="max-w-[760px] mx-auto">
          <div className="text-center mb-10">
            <div className="text-[11px] font-semibold text-sky-light tracking-[0.12em] uppercase mb-3">Common questions</div>
            <h2 className="font-display text-[32px] font-extrabold text-foreground tracking-[-0.5px]">Frequently asked</h2>
          </div>
          <div className="flex flex-col gap-0.5">
            {faqs.map((faq, i) => (
              <div key={i} className={`bg-panel border rounded-lg overflow-hidden transition-colors ${openFaq === i ? 'border-primary/30' : 'border-foreground/[0.07]'}`}>
                <div
                  className="flex items-center justify-between p-[18px] px-5 cursor-pointer gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="text-sm font-medium text-foreground leading-snug">{faq.q}</div>
                  <div className={`w-6 h-6 rounded-full bg-foreground/[0.06] border border-foreground/10 flex items-center justify-center text-sm text-foreground/50 flex-shrink-0 transition-all ${openFaq === i ? 'bg-primary/15 border-primary/30 text-sky-light rotate-45' : ''}`}>
                    +
                  </div>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-[300px]' : 'max-h-0'}`}>
                  <div className="px-5 pb-[18px] text-[13px] font-light text-foreground/55 leading-[1.7] border-t border-foreground/[0.05] pt-3.5">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-5 md:px-10 bg-midnight border-t border-foreground/[0.05] text-center">
        <div className="max-w-[560px] mx-auto">
          <h2 className="font-display text-[clamp(28px,4vw,42px)] font-extrabold text-foreground tracking-[-1px] mb-3">
            Ready to explore<br /><span className="text-accent">the world?</span>
          </h2>
          <p className="text-[15px] font-light text-foreground/50 mb-7 leading-relaxed">
            Search flights and hotels across 195 countries. Best prices, instant confirmation, powered by AI.
          </p>
          <div className="flex gap-2.5 justify-center flex-wrap">
            <Link to="/" className="font-body text-[15px] font-medium text-foreground bg-primary border-none rounded-pill py-3 px-8 cursor-pointer transition-all hover:bg-sky-light hover:-translate-y-px no-underline inline-block">
              Search flights now
            </Link>
            <a href="#contact" className="font-body text-[15px] font-medium text-foreground/70 bg-transparent border border-foreground/15 rounded-pill py-3 px-8 cursor-pointer transition-all hover:bg-foreground/[0.07] hover:text-foreground no-underline inline-block">
              Contact us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
