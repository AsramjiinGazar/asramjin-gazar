import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Avatar from "@/components/Avatar";
import XPBar from "@/components/XPBar";
import { leaderboard as leaderboardApi } from "@/lib/api";
import { LeaderboardSkeleton } from "@/components/skeletons/LeaderboardSkeleton";
import { SHARED_STALE_MS } from "@/lib/queryClient";

const XP_PER_LEVEL = 100;

const Leaderboard = () => {
  const [tab, setTab] = useState<"all" | "monthly">("all");
  const { data: allTimeData, isPending: allTimePending } = useQuery({
    queryKey: ["leaderboard", "allTime", 1, 50],
    queryFn: () => leaderboardApi.allTime({ page: 1, limit: 50 }),
    staleTime: SHARED_STALE_MS,
  });
  const { data: monthlyData, isPending: monthlyPending } = useQuery({
    queryKey: ["leaderboard", "monthly", 1, 50],
    queryFn: () => leaderboardApi.monthly({ page: 1, limit: 50 }),
    enabled: tab === "monthly",
    staleTime: SHARED_STALE_MS,
  });

  const data = tab === "all" ? allTimeData : monthlyData;
  const isPending = tab === "all" ? allTimePending : monthlyPending;
  const list = data?.data ?? [];
  const top3 = list.slice(0, 3);
  const rest = list.slice(3);

  if (isPending && list.length === 0) {
    return <LeaderboardSkeleton />;
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-5">🏆 Leaderboard</h1>

      <div className="flex bg-card rounded-xl p-1 mb-5">
        {(["all", "monthly"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              tab === t ? "bg-muted text-foreground" : "text-muted-foreground"
            }`}
          >
            {t === "all" ? "Бүх цаг" : "Сар"}
          </button>
        ))}
      </div>

      {!isPending && list.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {tab === "monthly" ? "Энэ сард XP авсан хүн одоогоор алга." : "Одоогоор мэдээлэл алга."}
        </p>
      )}

      {top3.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-6">
          <div className="flex-1 bg-card rounded-2xl p-3 pt-4 text-center shadow-sm">
            <div className="text-2xl mb-1">🥈</div>
            <Avatar name={top3[1].fullName} size="md" className="mx-auto mb-1" avatarUrl={top3[1].avatarUrl} />
            <p className="text-xs font-bold truncate">{top3[1].fullName.split(" ")[0]}</p>
            <p className="text-[10px] text-muted-foreground">Lvl {top3[1].level}</p>
            <p className="text-xs font-bold text-muted-foreground mt-1">{top3[1].totalXP} XP</p>
          </div>
          <div className="flex-1 bg-primary text-primary-foreground rounded-2xl p-4 pt-5 text-center shadow-lg -mb-2">
            <div className="text-3xl mb-1">🥇</div>
            <Avatar name={top3[0].fullName} size="lg" className="mx-auto mb-1 ring-2 ring-primary-foreground/30" avatarUrl={top3[0].avatarUrl} />
            <p className="text-sm font-bold truncate">{top3[0].fullName.split(" ")[0]}</p>
            <p className="text-[11px] opacity-80">Lvl {top3[0].level}</p>
            <p className="text-sm font-bold mt-1">{top3[0].totalXP} XP</p>
          </div>
          <div className="flex-1 bg-card rounded-2xl p-3 pt-4 text-center shadow-sm">
            <div className="text-2xl mb-1">🥉</div>
            <Avatar name={top3[2].fullName} size="md" className="mx-auto mb-1" avatarUrl={top3[2].avatarUrl} />
            <p className="text-xs font-bold truncate">{top3[2].fullName.split(" ")[0]}</p>
            <p className="text-[10px] text-muted-foreground">Lvl {top3[2].level}</p>
            <p className="text-xs font-bold text-muted-foreground mt-1">{top3[2].totalXP} XP</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {rest.map((s, i) => {
          const xpInLevel = s.totalXP % XP_PER_LEVEL;
          return (
            <div key={s.userId} className="bg-card rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
              <span className="text-sm font-bold text-muted-foreground w-6 text-center">{i + 4}</span>
              <Avatar name={s.fullName} size="sm" avatarUrl={s.avatarUrl} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{s.fullName}</p>
                <XPBar current={xpInLevel} max={XP_PER_LEVEL} size="sm" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-muted-foreground">{s.totalXP} XP</p>
                <p className="text-[10px] text-muted-foreground">Lvl {s.level}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
