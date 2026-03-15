import { Home, Users, Image, Trophy, Target, CalendarDays } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { path: "/", label: "Нүүр", icon: Home },
  { path: "/students", label: "Сурагчид", icon: Users },
  { path: "/gallery", label: "Зургийн цомог", icon: Image },
  { path: "/leaderboard", label: "Чансаа", icon: Trophy },
  { path: "/quest", label: "Даалгавар", icon: Target },
  { path: "/calendar", label: "Хуанли", icon: CalendarDays },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.3)] safe-bottom">
      <div className="flex items-center justify-around px-1 py-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[52px] transition-all duration-200 ${
                active
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] leading-tight ${active ? "font-semibold" : "font-medium"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
