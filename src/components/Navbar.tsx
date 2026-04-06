import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import SkyVoyLogo from "./SkyVoyLogo";
import FlightSearchForm from "./FlightSearchForm";
import FlightResults from "./FlightResults";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface NavbarConfig {
  links: { label: string; path: string }[];
  cta_text: string;
}

const Navbar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { data: config } = useSiteConfig<NavbarConfig>("navbar");
  const { loading, searching, progress, tickets, flightLegs, airlines, agents, error, search, bookTicket } =
    useFlightSearch();

  const defaultLinks = [{ label: "Flights", path: "/" }, { label: "Hotels", path: "/hotels" }, { label: "Deals", path: "/deals" }, { label: "About", path: "/about" }];
  const pathMap: Record<string, string> = { Flights: "/", Hotels: "/hotels", Deals: "/deals", About: "/about" };
  const rawLinks = config?.links ?? defaultLinks;
  const links = rawLinks.map((link) => ({ ...link, path: pathMap[link.label] ?? link.path }));
  const c = { links, cta_text: config?.cta_text ?? "Book a trip" };

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
        <DialogContent className="max-w-[900px] w-[95vw] max-h-[85vh] overflow-y-auto bg-card border-border p-0 gap-0">
          <VisuallyHidden>
            <DialogTitle>Search Flights</DialogTitle>
          </VisuallyHidden>
          <div className="p-6 md:p-8">
            <h2 className="font-display text-2xl font-extrabold text-foreground tracking-tight mb-6">
              Search Flights
            </h2>
            <FlightSearchForm onSearch={search} loading={loading} />
            <FlightResults
              tickets={tickets}
              flightLegs={flightLegs}
              airlines={airlines}
              agents={agents}
              searching={searching}
              progress={progress}
              error={error}
              onBook={bookTicket}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
