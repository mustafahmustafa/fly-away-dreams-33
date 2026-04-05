import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Plane } from "lucide-react";

interface Place {
  type: "city" | "airport" | "country";
  code: string;
  name: string;
  country_name: string;
  city_name?: string;
  main_airport_name?: string;
}

interface AirportAutocompleteProps {
  value: string;
  onChange: (iata: string, displayName: string) => void;
  placeholder?: string;
  label: string;
}

const AirportAutocomplete = ({ value, onChange, placeholder = "City or airport", label }: AirportAutocompleteProps) => {
  const [query, setQuery] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync display when value changes externally
  useEffect(() => {
    if (value && !displayValue) {
      setDisplayValue(value);
    }
  }, [value]);

  const fetchPlaces = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }
    try {
      const url = `https://autocomplete.travelpayouts.com/places2?locale=en&types[]=airport&types[]=city&term=${encodeURIComponent(term)}`;
      const resp = await fetch(url);
      const data: Place[] = await resp.json();
      setResults(data.slice(0, 8));
      setHighlighted(-1);
    } catch {
      setResults([]);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setDisplayValue(val);
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPlaces(val), 200);
  };

  const selectPlace = (place: Place) => {
    const name = place.type === "city"
      ? `${place.name} (${place.code})`
      : `${place.name} (${place.code})`;
    setDisplayValue(name);
    setQuery("");
    setResults([]);
    setOpen(false);
    onChange(place.code, name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      selectPlace(results[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleFocus = () => {
    if (results.length > 0) setOpen(true);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1">
      <label className="text-[10px] uppercase tracking-wider text-foreground/40 px-3">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="flex h-10 w-full rounded-md border border-foreground/10 bg-secondary/50 px-3 py-2 text-sm font-semibold text-foreground placeholder:text-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full min-w-[280px] max-h-[300px] overflow-y-auto rounded-lg border border-foreground/10 bg-background shadow-xl">
          {results.map((place, i) => (
            <button
              key={`${place.type}-${place.code}`}
              type="button"
              onClick={() => selectPlace(place)}
              className={`flex items-start gap-3 w-full px-3 py-2.5 text-left transition-colors ${
                i === highlighted ? "bg-primary/10" : "hover:bg-secondary/50"
              }`}
            >
              <div className="mt-0.5">
                {place.type === "city" ? (
                  <MapPin className="w-4 h-4 text-primary" />
                ) : (
                  <Plane className="w-4 h-4 text-accent" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {place.name}
                  </span>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    {place.code}
                  </span>
                </div>
                <p className="text-xs text-foreground/40 truncate">
                  {place.type === "airport" && place.city_name
                    ? `${place.city_name}, ${place.country_name}`
                    : place.country_name}
                  {place.main_airport_name && ` · ${place.main_airport_name}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AirportAutocomplete;
