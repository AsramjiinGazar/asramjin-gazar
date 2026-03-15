interface XPBarProps {
  current: number;
  max: number;
  size?: "sm" | "md" | "lg";
}

const XPBar = ({ current, max, size = "md" }: XPBarProps) => {
  const pct = Math.min((current / max) * 100, 100);
  const h = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";

  return (
    <div className={`w-full ${h} bg-xp-bar-bg rounded-full overflow-hidden`}>
      <div
        className={`${h} bg-xp-bar rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

export default XPBar;
