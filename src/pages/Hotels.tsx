import { useState, useEffect, useRef } from "react";
import { useHotelLookup, useHotelSearch, usePopularHotels, HotelResult, LocationResult } from "@/hooks/useHotelSearch";
import { Search, Star, MapPin, Users, Calendar, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function getHotelImageUrl(hotelId: number, width = 800, height = 520): string {
  return `https://photo.hotellook.com/image_v2/crop/h${hotelId}/${width}/${height}.auto`;
}

function formatStars(count: number) {
  return Array.from({ length: Math.min(count, 5) }, (_, i) => (
    <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
  ));
}

const Hotels = () => {
  const [query, setQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState("2");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { results: lookupResults, loading: lookupLoading, search: lookupSearch } = useHotelLookup();
  const { hotels: searchResults, loading: searchLoading, error: searchError, searchHotels } = useHotelSearch();
  const { hotels: popularHotels, loading: popularLoading } = usePopularHotels();
  const [hasSearched, setHasSearched] = useState(false);

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const ci = new Date(today.getTime() + 14 * 86400000);
    const co = new Date(today.getTime() + 17 * 86400000);
    setCheckIn(ci.toISOString().slice(0, 10));
    setCheckOut(co.toISOString().slice(0, 10));
  }, []);

  // Debounced lookup
  useEffect(() => {
    if (!query || query.length < 2 || selectedLocation) return;
    const t = setTimeout(() => {
      lookupSearch(query);
      setShowSuggestions(true);
    }, 300);
    return () => clearTimeout(t);
  }, [query, lookupSearch, selectedLocation]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectLocation = (loc: LocationResult) => {
    setSelectedLocation(loc);
    setQuery(loc.fullName || loc.cityName);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    if (!selectedLocation && !query) return;
    setHasSearched(true);
    searchHotels({
      location: selectedLocation ? undefined : query,
      locationId: selectedLocation?.id,
      checkIn,
      checkOut,
      adults: parseInt(adults),
    });
  };

  const handleInputChange = (val: string) => {
    setQuery(val);
    setSelectedLocation(null);
  };

  const buildBookingLink = (hotel: HotelResult) => {
    return `https://search.hotellook.com/hotels?destination=${hotel.locationId}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&hotelId=${hotel.hotelId}`;
  };

  const displayHotels = hasSearched ? searchResults : [];

  return (
    <main className="min-h-screen bg-background pt-24 pb-20 px-5 md:px-10">
      <div className="max-w-[1160px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-[11px] font-semibold text-sky-light tracking-[0.1em] uppercase mb-2">
            Accommodation
          </div>
          <h1 className="font-display text-[36px] md:text-[42px] font-extrabold text-foreground tracking-[-1px] leading-tight">
            Find Your Perfect Hotel
          </h1>
          <p className="text-sm text-foreground/40 mt-1">
            Search and compare hotel prices across top booking sites
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_140px_100px_auto] gap-3 items-end">
            {/* Destination */}
            <div className="relative">
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5 block">
                Destination
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={() => query.length >= 2 && !selectedLocation && setShowSuggestions(true)}
                  placeholder="City or hotel name"
                  className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-primary transition-colors"
                />
                {lookupLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              {showSuggestions && lookupResults.locations.length > 0 && (
                <div ref={suggestionsRef} className="absolute z-50 top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                  {lookupResults.locations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors flex items-center gap-3"
                    >
                      <MapPin className="w-4 h-4 text-foreground/40 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-foreground font-medium">{loc.cityName}</div>
                        <div className="text-xs text-foreground/40">{loc.countryName} · {loc.hotelsCount} hotels</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Check-in */}
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5 block">
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Check-out */}
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5 block">
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().slice(0, 10)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Guests */}
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5 block">
                Guests
              </label>
              <Select value={adults} onValueChange={setAdults}>
                <SelectTrigger className="h-[42px] bg-background border-border rounded-xl text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} Guest{n > 1 ? "s" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={searchLoading || (!query && !selectedLocation)}
              className="h-[42px] rounded-xl gap-2 px-6"
            >
              {searchLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </Button>
          </div>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-[24px] font-extrabold text-foreground tracking-[-0.5px]">
                {searchLoading ? "Searching..." : `${searchResults.length} hotel${searchResults.length !== 1 ? "s" : ""} found`}
              </h2>
            </div>

            {searchError && (
              <div className="text-center py-12 text-foreground/40">{searchError}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-[22px] overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-8 w-1/3" />
                      </div>
                    </div>
                  ))
                : searchResults.length === 0 && !searchError ? (
                    <div className="col-span-full text-center py-12 text-foreground/40">
                      No hotels found for this search. Try a different destination or dates.
                    </div>
                  )
                : searchResults.map((hotel) => (
                    <HotelCard key={hotel.hotelId} hotel={hotel} bookingLink={buildBookingLink(hotel)} />
                  ))}
            </div>
          </div>
        )}

        {/* Recommended Hotels */}
        <div>
          <div className="mb-6">
            <div className="text-[11px] font-semibold text-sky-light tracking-[0.1em] uppercase mb-2">
              Trending stays
            </div>
            <h2 className="font-display text-[28px] font-extrabold text-foreground tracking-[-0.5px]">
              Recommended Hotels
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {popularLoading
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
              : popularHotels.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-foreground/40">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Recommended hotels will appear here</p>
                  </div>
                )
              : popularHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.hotelId}
                    hotel={hotel}
                    bookingLink={`https://search.hotellook.com/hotels?destination=${hotel.locationId}&hotelId=${hotel.hotelId}`}
                  />
                ))}
          </div>
        </div>
      </div>
    </main>
  );
};

function HotelCard({ hotel, bookingLink }: { hotel: HotelResult; bookingLink: string }) {
  return (
    <a
      href={bookingLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-card border border-border rounded-[22px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-primary/[0.06] no-underline"
    >
      <div className="h-44 relative overflow-hidden">
        <img
          src={getHotelImageUrl(hotel.hotelId)}
          alt={hotel.hotelName}
          className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.avs.io/explore/cities/${hotel.location?.name || "Dubai"}?rs:fill:800:520`;
          }}
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
        <div className="absolute bottom-3 left-3.5">
          <div className="font-display text-[16px] font-bold text-foreground leading-tight">
            {hotel.hotelName}
          </div>
          <div className="flex items-center gap-1 text-xs text-foreground/60 mt-0.5">
            <MapPin className="w-3 h-3" />
            {hotel.location?.name || (hotel as any).city || ""}{hotel.location?.country ? `, ${hotel.location.country}` : ""}
          </div>
        </div>
      </div>

      <div className="p-3.5 px-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] text-foreground/35 mb-0.5">From</div>
            <div className="font-display text-[20px] font-extrabold text-foreground">
              AED {Math.round(hotel.priceFrom || hotel.priceAvg || 0).toLocaleString()}
              <span className="text-[12px] font-normal text-foreground/40"> / night</span>
            </div>
          </div>
          <span className="flex items-center gap-1 bg-primary text-primary-foreground rounded-full text-[13px] font-medium px-4 py-2 transition-colors group-hover:bg-sky-light">
            Book <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
}

export default Hotels;
