import { useState } from "react";
import { useHotelSearch, usePopularHotels, useHotelCities, HotelResult } from "@/hooks/useHotelSearch";
import { Search, Star, MapPin, ArrowRight, Building2, SlidersHorizontal, X } from "lucide-react";
import HotelSearchAutocomplete from "@/components/HotelSearchAutocomplete";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useSiteConfig } from "@/hooks/useSiteConfig";

interface HotelsPageConfig {
  header_label: string;
  title: string;
  subtitle: string;
  search_label: string;
  search_placeholder: string;
  city_label: string;
  trending_label: string;
  trending_title: string;
  results_label: string;
  no_results_text: string;
  book_cta: string;
  price_label: string;
  price_suffix: string;
  currency: string;
}

const defaultConfig: HotelsPageConfig = {
  header_label: "Accommodation",
  title: "Find Your Perfect Hotel",
  subtitle: "Discover handpicked luxury hotels across top destinations",
  search_label: "Search",
  search_placeholder: "Hotel name, city, or country...",
  city_label: "City",
  trending_label: "Trending stays",
  trending_title: "Recommended Hotels",
  results_label: "Search results",
  no_results_text: "No hotels found",
  book_cta: "Book",
  price_label: "From",
  price_suffix: "/ night",
  currency: "AED",
};

function getCityImageUrl(city: string): string {
  const cityMap: Record<string, string> = {
    Dubai: "DXB", London: "LON", Paris: "PAR", Bangkok: "BKK",
    Istanbul: "IST", Tokyo: "TYO", Singapore: "SIN", "New York": "NYC",
  };
  const code = cityMap[city] || city.slice(0, 3).toUpperCase();
  return `https://img.avs.io/explore/cities/${code}?rs:fill:800:520`;
}

function formatStars(count: number) {
  return Array.from({ length: Math.min(count, 5) }, (_, i) => (
    <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
  ));
}

function buildBookingLink(hotel: HotelResult) {
  return `https://aviasales.tpx.lu/xAVufDUr?shmarker=515371&search_url=${encodeURIComponent(`/hotels?q=${hotel.name} ${hotel.city}`)}`;
}

const Hotels = () => {
  const { data: config } = useSiteConfig<HotelsPageConfig>("hotels_page");
  const c = config ?? defaultConfig;

  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number[]>([0]);
  const [hasSearched, setHasSearched] = useState(false);

  const { hotels: searchResults, loading: searchLoading, searchHotels } = useHotelSearch();
  const { hotels: popularHotels, loading: popularLoading } = usePopularHotels();
  const { cities } = useHotelCities();

  const handleSearch = () => {
    setHasSearched(true);
    searchHotels({
      query: query || undefined,
      city: selectedCity !== "all" ? selectedCity : undefined,
      maxPrice: maxPrice[0] > 0 ? maxPrice[0] : undefined,
    });
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedCity("all");
    setMaxPrice([0]);
    setHasSearched(false);
  };

  const displayHotels = hasSearched ? searchResults : popularHotels;
  const isLoading = hasSearched ? searchLoading : popularLoading;

  return (
    <main className="min-h-screen bg-background pt-24 pb-20 px-5 md:px-10">
      <div className="max-w-[1160px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-[11px] font-semibold text-sky-light tracking-[0.1em] uppercase mb-2">
            {c.header_label}
          </div>
          <h1 className="font-display text-[36px] md:text-[42px] font-extrabold text-foreground tracking-[-1px] leading-tight">
            {c.title}
          </h1>
          <p className="text-sm text-foreground/40 mt-1">
            {c.subtitle}
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-8">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5 block">
                {c.search_label}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={c.search_placeholder}
                  className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="w-[160px]">
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5 block">
                {c.city_label}
              </label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-[42px] bg-background border-border rounded-xl text-sm">
                  <SelectValue placeholder="All cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cities</SelectItem>
                  {cities.map((ci) => (
                    <SelectItem key={ci} value={ci}>{ci}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-[42px] gap-2 rounded-xl"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>

            <Button onClick={handleSearch} disabled={searchLoading} className="h-[42px] rounded-xl gap-2 px-6">
              {searchLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {c.search_label}
            </Button>

            {hasSearched && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-[42px] text-foreground/50 gap-1">
                <X className="w-3.5 h-3.5" /> Clear
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="max-w-[300px]">
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2 block">
                  Max Price: {c.currency} {maxPrice[0] === 0 ? "Any" : maxPrice[0].toLocaleString()}
                </label>
                <Slider
                  min={0}
                  max={5000}
                  step={100}
                  value={maxPrice}
                  onValueChange={setMaxPrice}
                />
                <div className="flex justify-between text-[10px] text-foreground/30 mt-1">
                  <span>Any</span>
                  <span>{c.currency} 5,000</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[11px] font-semibold text-sky-light tracking-[0.1em] uppercase mb-2">
              {hasSearched ? c.results_label : c.trending_label}
            </div>
            <h2 className="font-display text-[28px] font-extrabold text-foreground tracking-[-0.5px]">
              {hasSearched
                ? `${displayHotels.length} hotel${displayHotels.length !== 1 ? "s" : ""} found`
                : c.trending_title}
            </h2>
          </div>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-[22px] overflow-hidden">
                  <Skeleton className="h-44 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-1/3" />
                  </div>
                </div>
              ))
            : displayHotels.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-foreground/20" />
                  <p className="text-foreground/40 text-lg">{c.no_results_text}</p>
                  {hasSearched && (
                    <Button variant="ghost" onClick={clearFilters} className="mt-3 text-primary">
                      Clear filters
                    </Button>
                  )}
                </div>
              )
            : displayHotels.map((hotel) => (
                <a
                  key={hotel.id}
                  href={buildBookingLink(hotel)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-card border border-border rounded-[22px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-primary/[0.06] no-underline"
                >
                  <div className="h-44 relative overflow-hidden">
                    <img
                      src={getCityImageUrl(hotel.city)}
                      alt={hotel.name}
                      className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(5,10,26,0.85) 100%)" }}
                    />
                    {hotel.stars > 0 && (
                      <div className="absolute top-3 left-3 flex items-center gap-0.5 bg-background/60 backdrop-blur-sm rounded-full px-2.5 py-1">
                        {formatStars(hotel.stars)}
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3.5 right-3.5">
                      <div className="font-display text-[16px] font-bold text-foreground leading-tight">
                        {hotel.name}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-foreground/60 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {hotel.city}, {hotel.country}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 px-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-foreground/35 mb-0.5">{c.price_label}</div>
                        <div className="font-display text-[20px] font-extrabold text-foreground">
                          {c.currency} {hotel.priceFrom.toLocaleString()}
                          <span className="text-[12px] font-normal text-foreground/40"> {c.price_suffix}</span>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 bg-primary text-primary-foreground rounded-full text-[13px] font-medium px-4 py-2 transition-colors group-hover:bg-sky-light">
                        {c.book_cta} <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </a>
              ))}
        </div>
      </div>
    </main>
  );
};

export default Hotels;
