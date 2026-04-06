import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Building2, MapPin, Globe } from "lucide-react";

interface Suggestion {
  type: "hotel" | "city" | "country";
  label: string;
  sublabel: string;
  value: string;
}

const BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hotel-search`;
const API_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: Suggestion) => void;
  placeholder?: string;
  className?: string;
}

const typeIcon = {
  hotel: <Building2 className="w-3.5 h-3.5 text-primary" />,
  city: <MapPin className="w-3.5 h-3.5 text-accent" />,
  country: <Globe className="w-3.5 h-3.5 text-foreground/40" />,
};

const typeLabel = { hotel: "Hotel", city: "City", country: "Country" };

const HotelSearchAutocomplete = ({ value, onChange, onSelect, placeholder, className }: Props) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchSuggestions = useCallback(async (term: string) => {
    if (term.length < 1) { setSuggestions([]); return; }
    try {
      const resp = await fetch(`${BASE}?action=autocomplete&term=${encodeURIComponent(term)}`, {
        headers: { apikey: API_KEY },
      });
      const data = await resp.json();
      setSuggestions(data.suggestions || []);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleChange = (val: string) => {
    onChange(val);
    setActiveIdx(-1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 200);
  };

  const handleSelect = (s: Suggestion) => {
    onSelect(s);
    onChange(s.label);
    setOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setOpen(suggestions.length > 0);
  }, [suggestions]);

  return (
    <div ref={containerRef} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 pointer-events-none z-10" />
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden max-h-[280px] overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={`${s.type}-${s.value}`}
              onClick={() => handleSelect(s)}
              onMouseEnter={() => setActiveIdx(i)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors ${
                i === activeIdx ? "bg-primary/10" : "hover:bg-foreground/[0.04]"
              }`}
            >
              {typeIcon[s.type]}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{s.label}</div>
                {s.sublabel && (
                  <div className="text-xs text-foreground/40 truncate">{s.sublabel}</div>
                )}
              </div>
              <span className="text-[10px] font-medium text-foreground/30 uppercase tracking-wider shrink-0">
                {typeLabel[s.type]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelSearchAutocomplete;
