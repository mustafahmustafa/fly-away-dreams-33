import { useSiteConfig } from "@/hooks/useSiteConfig";

interface TrustBarConfig {
  items: string[];
}

const TrustBar = () => {
  const { data: config } = useSiteConfig<TrustBarConfig>("trust_bar");
  const items = config?.items ?? ["Secure SSL payment", "Instant booking confirmation", "24/7 customer support", "Best price guarantee", "PayPal & card accepted"];

  return (
    <div className="bg-foreground/[0.02] border-y border-foreground/[0.05] py-4 px-5 md:px-10 flex items-center justify-center gap-9 flex-wrap">
      {items.map((item) => (
        <div key={item} className="text-xs font-medium text-foreground/30 flex items-center gap-[7px] tracking-wide">
          <span className="w-[5px] h-[5px] bg-success rounded-full" />
          {item}
        </div>
      ))}
    </div>
  );
};

export default TrustBar;
