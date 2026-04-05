import { Link } from "react-router-dom";
import SkyVoyLogo from "./SkyVoyLogo";

const Footer = () => {
  return (
    <footer className="bg-midnight-soft border-t border-foreground/[0.06] pt-12 pb-7 px-5 md:px-10">
      <div className="max-w-[1160px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-10 border-b border-foreground/[0.06] mb-6">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="no-underline">
              <SkyVoyLogo height={32} />
            </Link>
            <p className="text-[13px] font-light text-foreground/[0.38] leading-[1.75] mt-3 max-w-[240px]">
              AI-powered travel booking for flights and hotels across 195 countries. Based in Dubai, UAE.
            </p>
            <div className="mt-4 flex gap-2">
              {["IG", "X", "in", "WA"].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  className="w-8 h-8 border border-foreground/10 rounded-lg flex items-center justify-center text-foreground/[0.38] text-xs cursor-pointer transition-all hover:border-primary/40 hover:text-sky-light hover:bg-primary/[0.08] no-underline"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Travel */}
          <div>
            <div className="font-display text-[13px] font-bold text-foreground tracking-wide mb-3.5">Travel</div>
            <ul className="list-none space-y-2.5">
              {["Flights", "Hotels", "Packages", "Hot deals"].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-[13px] font-light text-foreground/[0.38] no-underline transition-colors hover:text-foreground/75">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="font-display text-[13px] font-bold text-foreground tracking-wide mb-3.5">Company</div>
            <ul className="list-none space-y-2.5">
              <li><Link to="/about" className="text-[13px] font-light text-foreground/[0.38] no-underline transition-colors hover:text-foreground/75">About us</Link></li>
              <li><Link to="/about" className="text-[13px] font-light text-foreground/[0.38] no-underline transition-colors hover:text-foreground/75">Contact</Link></li>
              <li><a href="#" className="text-[13px] font-light text-foreground/[0.38] no-underline transition-colors hover:text-foreground/75">Careers</a></li>
              <li><a href="#" className="text-[13px] font-light text-foreground/[0.38] no-underline transition-colors hover:text-foreground/75">Blog</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <div className="font-display text-[13px] font-bold text-foreground tracking-wide mb-3.5">Support</div>
            <ul className="list-none space-y-2.5">
              {["Help centre", "Manage booking", "Cancellations", "Privacy policy", "Terms of use"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-[13px] font-light text-foreground/[0.38] no-underline transition-colors hover:text-foreground/75">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-foreground/[0.22]">© 2025 SkyVoyAI FZ-LLC. Registered in Dubai Internet City, UAE.</div>
          <div className="flex items-center gap-1.5 text-[11px] text-foreground/[0.28]">
            <span className="w-[5px] h-[5px] bg-success rounded-full" />
            All systems operational
          </div>
          <div className="flex gap-5">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <a key={item} href="#" className="text-xs text-foreground/30 no-underline hover:text-foreground/60 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
