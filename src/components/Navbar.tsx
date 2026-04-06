import { Link, useLocation } from "react-router-dom";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import SkyVoyLogo from "./SkyVoyLogo";

interface NavbarConfig {
  links: { label: string; path: string }[];
  cta_text: string;
}

const Navbar = () => {
  const location = useLocation();
  const { data: config } = useSiteConfig<NavbarConfig>("navbar");
  const c = config ?? { links: [{ label: "Flights", path: "/" }, { label: "Hotels", path: "/hotels" }, { label: "Deals", path: "/deals" }, { label: "About", path: "/about" }], cta_text: "Book a trip" };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-5 md:px-10 h-[68px] bg-[rgba(5,10,26,0.82)] backdrop-blur-xl border-b border-foreground/[0.06]">
      <Link to="/" className="opacity-100 hover:opacity-85 transition-opacity">
        <SkyVoyLogo height={36} />
      </Link>

      <ul className="hidden md:flex items-center gap-8 list-none">
        {c.links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.path}
              className={`text-sm font-normal tracking-wide transition-colors no-underline ${
                location.pathname === link.path ? "text-foreground" : "text-foreground/65 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="font-body text-sm font-medium text-foreground bg-primary border-none rounded-pill px-5 py-2.5 cursor-pointer transition-all hover:bg-sky-light hover:-translate-y-px no-underline"
        >
          {c.cta_text}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
