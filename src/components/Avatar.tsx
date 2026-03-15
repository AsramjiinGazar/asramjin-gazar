interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  avatarUrl?: string | null;
  className?: string;
}

const colors = [
  "bg-secondary",
  "bg-muted",
  "bg-gold",
  "bg-success",
  "bg-bronze",
];

const Avatar = ({ name, size = "md", avatarUrl, className = "" }: AvatarProps) => {
  const idx = name.charCodeAt(0) % colors.length;
  const s = size === "sm" ? "w-8 h-8 text-xs" : size === "md" ? "w-10 h-10 text-sm" : size === "lg" ? "w-14 h-14 text-lg" : "w-20 h-20 text-2xl";
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${s} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div className={`${s} ${colors[idx]} rounded-full flex items-center justify-center text-foreground font-bold shrink-0 ${className}`}>
      {initials}
    </div>
  );
};

export default Avatar;
