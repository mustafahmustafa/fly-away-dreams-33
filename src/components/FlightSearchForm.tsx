import { useState } from "react";
import { format } from "date-fns";
import { ArrowRightLeft, Users, Search, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import AirportAutocomplete from "./AirportAutocomplete";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FlightSearchFormProps {
  onSearch: (params: {
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    adults: number;
    children: number;
    infants: number;
    tripClass: string;
  }) => void;
  loading: boolean;
}

const FlightSearchForm = ({ onSearch, loading }: FlightSearchFormProps) => {
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("roundtrip");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departDate, setDepartDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [departOpen, setDepartOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [tripClass, setTripClass] = useState("Y");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !departDate) return;
    onSearch({
      origin,
      destination,
      departDate: format(departDate, "yyyy-MM-dd"),
      returnDate: tripType === "roundtrip" && returnDate ? format(returnDate, "yyyy-MM-dd") : undefined,
      adults,
      children,
      infants,
      tripClass,
    });
  };

  const swapCities = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Trip type & class row */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex rounded-lg overflow-hidden border border-foreground/10">
          <button
            type="button"
            onClick={() => setTripType("roundtrip")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tripType === "roundtrip"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-foreground/60 hover:text-foreground"
            }`}
          >
            Round trip
          </button>
          <button
            type="button"
            onClick={() => setTripType("oneway")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tripType === "oneway"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-foreground/60 hover:text-foreground"
            }`}
          >
            One way
          </button>
        </div>

        <Select value={tripClass} onValueChange={setTripClass}>
          <SelectTrigger className="w-[140px] bg-secondary/50 border-foreground/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Y">Economy</SelectItem>
            <SelectItem value="W">Comfort</SelectItem>
            <SelectItem value="C">Business</SelectItem>
            <SelectItem value="F">First</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 bg-secondary/50 rounded-lg border border-foreground/10 px-3 py-1.5">
          <Users className="w-4 h-4 text-foreground/50" />
          <Select value={String(adults)} onValueChange={(v) => setAdults(Number(v))}>
            <SelectTrigger className="w-[60px] border-0 bg-transparent p-0 h-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-foreground/50">Adult{adults !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Origin / Destination row */}
      <div className="flex items-end gap-2">
        <AirportAutocomplete
          value={origin}
          onChange={(iata) => setOrigin(iata)}
          placeholder="Dubai, London..."
          label="From"
        />
        <button
          type="button"
          onClick={swapCities}
          className="mb-1 p-2 rounded-full bg-secondary/80 border border-foreground/10 hover:bg-primary/20 transition-colors shrink-0"
        >
          <ArrowRightLeft className="w-4 h-4 text-foreground/60" />
        </button>
        <AirportAutocomplete
          value={destination}
          onChange={(iata) => setDestination(iata)}
          placeholder="Paris, New York..."
          label="To"
        />
      </div>

      {/* Dates + Search row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-2 flex-1">
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-wider text-foreground/40 px-3">Depart</label>
            <Popover open={departOpen} onOpenChange={setDepartOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-semibold border-foreground/10 bg-secondary/50",
                    !departDate && "text-foreground/30"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-foreground/40" />
                  {departDate ? format(departDate, "MMM d, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={departDate}
                  onSelect={(d) => { setDepartDate(d); setDepartOpen(false); }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          {tripType === "roundtrip" && (
            <div className="flex-1">
              <label className="text-[10px] uppercase tracking-wider text-foreground/40 px-3">Return</label>
              <Popover open={returnOpen} onOpenChange={setReturnOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-12 justify-start text-left font-semibold border-foreground/10 bg-secondary/50",
                      !returnDate && "text-foreground/30"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-foreground/40" />
                    {returnDate ? format(returnDate, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={(d) => { setReturnDate(d); setReturnOpen(false); }}
                    disabled={(date) => date < (departDate || new Date(new Date().setHours(0, 0, 0, 0)))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading || !origin || !destination || !departDate}
          className="sm:mt-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12"
        >
          <Search className="w-5 h-5 mr-2" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>
    </form>
  );
};

export default FlightSearchForm;
