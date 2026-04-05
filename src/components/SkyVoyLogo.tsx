import logoDark from "@/assets/skyvoyai-logo-dark.svg";

const SkyVoyLogo = ({ height = 36 }: { height?: number }) => (
  <img src={logoDark} alt="SkyVoyAI" height={height} style={{ height, display: 'block' }} />
);

export default SkyVoyLogo;
