import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import SkyVoyLogo from "./SkyVoyLogo";
import FlightSearchForm from "./FlightSearchForm";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface NavbarConfig {
  links: { label: string; path: string }[];
  cta_text: string;
}

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: config } = useSiteConfig<NavbarConfig>("navbar");
  const { searchFlights, loading } = useFlightSearch();

  const defaultLinks = [{ label: "Flights", path: "/" }, { label: "Hotels", path: "/hotels" }, { label: "Deals", path: "/deals" }, { label: "About", path: "/about" }];
  const pathMap: Record<string, string> = { Flights: "/", Hotels: "/hotels", Deals: "/deals", About: "/about" };
  const rawLinks = config?.links ?? defaultLinks;
  const links = rawLinks.map((link) => ({ ...link, path: pathMap[link.label] ?? link.path }));
  const c = { links, cta_text: config?.cta_text ?? "Book a trip" };

  const handleSearch = (params: Parameters<typeof searchFlights>[0]) => {
    setOpen(false);
    navigate("/");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <>
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
          <button
            onClick={() => setOpen(true)}
            className="font-body text-sm font-medium text-foreground bg-primary border-none rounded-pill px-5 py-2.5 cursor-pointer transition-all hover:bg-sky-light hover:-translate-y-px"
          >
            {c.cta_text}
          </button>
        </div>
      </nav>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[900px] w-[95vw] bg-card border-border p-0 gap-0 overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Search Flights</DialogTitle>
          </VisuallyHidden>
          <div className="p-6 md:p-8">
            <h2 className="font-display text-2xl font-extrabold text-foreground tracking-tight mb-6">
              Search Flights
            </h2>
            <FlightSearchForm onSearch={handleSearch} loading={loading} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
