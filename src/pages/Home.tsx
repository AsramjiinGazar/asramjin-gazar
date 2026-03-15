import { Megaphone, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Avatar from "@/components/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { announcements, leaderboard, quests as questsApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { SHARED_STALE_MS } from "@/lib/queryClient";

const XP_PER_LEVEL = 100;

function getGreetingForMongolia(): { text: string; emoji: string } {
  const hourStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Ulaanbaatar", hour: "numeric", hour12: false });
  const h = parseInt(hourStr, 10) || 12;
  if (h >= 5 && h < 12) return { text: "Өглөөний мэнд", emoji: "☀️" };
  if (h >= 12 && h < 18) return { text: "Өдрийн мэнд", emoji: "🌤️" };
  return { text: "Оройн мэнд", emoji: "🌙" };
}

const Home = () => {
  const navigate = useNavigate();
  const { profile, token } = useAuth();
  const { data: announcementsList, isPending: announcementsPending } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => announcements.list(),
    staleTime: SHARED_STALE_MS,
  });
  const { data: leaderboardData, isPending: leaderboardPending } = useQuery({
    queryKey: ["leaderboard", "allTime", 3],
    queryFn: () => leaderboard.allTime({ limit: 3, page: 1 }),
    staleTime: SHARED_STALE_MS,
  });
  const { data: questsList = [] } = useQuery({
    queryKey: ["quests"],
    queryFn: () => questsApi.get(),
    staleTime: SHARED_STALE_MS,
  });
  const top3 = leaderboardData?.data ?? [];
  const announcements = announcementsList ?? [];
  const greeting = getGreetingForMongolia();

  // Guest mode: allow browsing without login
  const isGuest = !token || !profile;

  const level = profile?.level ?? 0;
  const totalXp = profile?.total_xp ?? 0;
  const xpInLevel = totalXp % XP_PER_LEVEL;
  const maxXp = XP_PER_LEVEL;

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6 max-w-lg mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{greeting.text} {greeting.emoji}</p>
          <h1 className="text-2xl font-bold text-foreground">
            Асрамжийн газар{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h1>
        </div>
        {!isGuest ? (
          <button onClick={() => navigate("/profile")} className="shrink-0 flex items-center justify-center">
            <Avatar name={profile.full_name} size="lg" avatarUrl={profile.avatar_url} />
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="shrink-0 rounded-xl bg-card border border-border px-3 py-2 text-xs font-semibold text-muted-foreground"
          >
            Нэвтрэх
          </button>
        )}
      </div>

      {!isGuest ? (
        <div className="bg-primary text-primary-foreground rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              <span className="font-semibold text-sm">Level {level}</span>
            </div>
            <span className="text-sm opacity-90">{xpInLevel} / {maxXp} XP</span>
          </div>
          <div className="w-full h-2.5 bg-primary-foreground/20 rounded-full overflow-hidden">
            <div className="h-2.5 bg-primary-foreground rounded-full transition-all duration-500" style={{ width: `${(xpInLevel / maxXp) * 100}%` }} />
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Зочин горим</p>
          <p className="text-sm text-muted-foreground mt-1">
            Та одоогоор зөвхөн харах боломжтой. Үйлдэл хийх бол нэвтэрнэ үү.
          </p>
        </div>
      )}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Яасан их XP тэй юм бэээ</h2>
        </div>

        <div className="flex gap-3 items-end">
          {leaderboardPending && top3.length === 0 ? (
            <>
              <div className="flex-1 h-28 rounded-xl animate-pulse bg-muted" />
              <div className="flex-1 h-32 rounded-xl animate-pulse bg-muted" />
              <div className="flex-1 h-28 rounded-xl animate-pulse bg-muted" />
            </>
          ) : top3.length >= 3 ? (
            <>
              <div key={top3[1].userId} className="flex-1 bg-card rounded-xl p-3 text-center shadow-sm border border-border">
                <div className="text-lg mb-1">🥈</div>
                <Avatar name={top3[1].fullName} size="sm" className="mx-auto mb-1.5" avatarUrl={top3[1].avatarUrl} />
                <p className="text-xs font-semibold truncate text-card-foreground">{top3[1].fullName.split(" ")[0]}</p>
                <p className="text-[10px] text-muted-foreground">{top3[1].totalXP} XP</p>
              </div>
              <div key={top3[0].userId} className="flex-1 bg-primary text-primary-foreground rounded-xl p-3 text-center shadow-lg border border-primary">
                <div className="text-lg mb-1">🥇</div>
                <Avatar name={top3[0].fullName} size="sm" className="mx-auto mb-1.5" avatarUrl={top3[0].avatarUrl} />
                <p className="text-xs font-semibold truncate">{top3[0].fullName.split(" ")[0]}</p>
                <p className="text-[10px] opacity-90">{top3[0].totalXP} XP</p>
              </div>
              <div key={top3[2].userId} className="flex-1 bg-card rounded-xl p-3 text-center shadow-sm border border-border">
                <div className="text-lg mb-1">🥉</div>
                <Avatar name={top3[2].fullName} size="sm" className="mx-auto mb-1.5" avatarUrl={top3[2].avatarUrl} />
                <p className="text-xs font-semibold truncate text-card-foreground">{top3[2].fullName.split(" ")[0]}</p>
                <p className="text-[10px] text-muted-foreground">{top3[2].totalXP} XP</p>
              </div>
            </>
          ) : null}
          {top3.length > 0 && top3.length < 3 && top3.map((s, i) => (
            <div key={s.userId} className="flex-1 bg-card rounded-xl p-3 text-center shadow-sm border border-border">
              <div className="text-lg mb-1">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</div>
              <Avatar name={s.fullName} size="sm" className="mx-auto mb-1.5" avatarUrl={s.avatarUrl} />
              <p className="text-xs font-semibold truncate text-card-foreground">{s.fullName.split(" ")[0]}</p>
              <p className="text-[10px] text-muted-foreground">{s.totalXP} XP</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-foreground">
          <Megaphone size={16} className="text-muted-foreground" /> Зарлал
        </h2>
        <div className="space-y-2.5">
          {announcementsPending && announcements.length === 0 ? (
            <>
              <div className="h-14 rounded-xl bg-muted animate-pulse" />
              <div className="h-14 rounded-xl bg-muted animate-pulse" />
            </>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="bg-card rounded-xl p-3.5 shadow-sm border border-border">
                <p className="font-semibold text-sm text-card-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{a.content}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
