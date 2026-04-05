const SkyVoyLogo = ({ height = 36 }: { height?: number }) => (
  <svg height={height} viewBox="0 0 300 68" fill="none" xmlns="http://www.w3.org/2000/svg" className="block overflow-visible">
    <defs>
      <linearGradient id="arcGradMain" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#0057FF" />
        <stop offset="100%" stopColor="#00D4FF" />
      </linearGradient>
    </defs>
    <circle cx="34" cy="34" r="27" fill="#0057FF" fillOpacity="0.12" />
    <circle cx="34" cy="34" r="27" stroke="#0057FF" strokeWidth="1" strokeOpacity="0.4" fill="none" />
    <path d="M12 42 Q34 11 56 42" stroke="url(#arcGradMain)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M17 39 Q28 19 44 22" stroke="#0057FF" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeOpacity="0.6" />
    <circle cx="44" cy="22" r="3.2" fill="#00D4FF" />
    <circle cx="44" cy="22" r="1.6" fill="#FFFFFF" fillOpacity="0.9" />
    <circle cx="34" cy="50" r="1.6" fill="#00D4FF" fillOpacity="0.7" />
    <circle cx="40" cy="53" r="1.1" fill="#0057FF" fillOpacity="0.6" />
    <circle cx="28" cy="53" r="1.1" fill="#0057FF" fillOpacity="0.6" />
    <text fontFamily="Syne,system-ui,sans-serif" fontWeight="800" fontSize="26" x="74" y="32" letterSpacing="0">
      <tspan fill="#FFFFFF">Sky</tspan>
      <tspan fill="#00D4FF">Voy</tspan>
      <tspan fill="#3D7FFF">AI</tspan>
    </text>
    <text fontFamily="DM Sans,system-ui,sans-serif" fontWeight="400" fontSize="10" x="74" y="50" fill="#8898B4" letterSpacing="2.2">SMART TRAVEL</text>
  </svg>
);

export default SkyVoyLogo;
