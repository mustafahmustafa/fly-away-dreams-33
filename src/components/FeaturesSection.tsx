const features = [
  { icon: "🤖", title: "AI-powered search", desc: "Our algorithm compares millions of options in real time to surface the best deals — faster than any human agent." },
  { icon: "🔒", title: "Secure payments", desc: "256-bit SSL encryption. Pay with PayPal, Visa, Mastercard, Amex, or Apple Pay. Your data never leaves secure servers." },
  { icon: "⚡", title: "Instant booking", desc: "Confirmed e-ticket and hotel voucher sent to your email within seconds. No waiting, no middleman." },
  { icon: "🌍", title: "Global coverage", desc: "1M+ hotels, 500+ airlines, 195 countries. From budget to 5-star, economy to first class — we've got it all." },
  { icon: "💬", title: "24/7 support", desc: "Arabic & English support team based in Dubai. WhatsApp, email, or phone — we're always here." },
  { icon: "💰", title: "Best price guarantee", desc: "Found it cheaper elsewhere? We'll match the price and add 10% off. That's our promise." },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 px-5 md:px-10 bg-midnight-soft">
      <div className="max-w-[1160px] mx-auto">
        <div className="flex items-end justify-between mb-9">
          <div>
            <div className="text-[11px] font-semibold text-sky-light tracking-[0.1em] uppercase mb-2">Why choose us</div>
            <h2 className="font-display text-[32px] font-extrabold text-foreground tracking-[-0.5px] leading-tight">Built for modern travellers</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="bg-foreground/[0.03] border border-foreground/[0.07] rounded-[22px] p-7 px-6 transition-all duration-300 hover:bg-primary/[0.06] hover:border-primary/25 hover:-translate-y-0.5">
              <div className="w-11 h-11 bg-primary/15 border border-primary/25 rounded-xl flex items-center justify-center text-xl mb-[18px]">
                {f.icon}
              </div>
              <div className="font-display text-[17px] font-bold text-foreground mb-2 tracking-tight">{f.title}</div>
              <p className="text-sm font-light text-foreground/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
