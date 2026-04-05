import FlightSearchForm from "./FlightSearchForm";
import FlightResults from "./FlightResults";
import { useFlightSearch } from "@/hooks/useFlightSearch";

const TravelpayoutsWidget = () => {
  const { loading, searching, progress, tickets, flightLegs, airlines, agents, error, search, bookTicket } =
    useFlightSearch();

  return (
    <div className="relative overflow-hidden rounded-[1.125rem] border border-foreground/10 bg-secondary/30 shadow-[var(--shadow-sky-lg)] backdrop-blur-sm p-5 md:p-7">
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
  );
};

export default TravelpayoutsWidget;
