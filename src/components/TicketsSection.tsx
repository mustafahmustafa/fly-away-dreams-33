import { useEffect, useRef } from "react";

const TicketsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const widget = document.getElementById("tpwl-tickets");
    if (widget && containerRef.current && !containerRef.current.contains(widget)) {
      widget.style.display = "";
      containerRef.current.appendChild(widget);
    }
  }, []);

  return (
    <section className="bg-[hsl(var(--midnight))]">
      <div className="tpwl-tickets__wrapper">
        <div className="tpwl__content" ref={containerRef} />
      </div>
    </section>
  );
};

export default TicketsSection;
