import { useQuery } from "@tanstack/react-query";
import { Check, Star } from "lucide-react";
import XPBar from "@/components/XPBar";
import { quests as questsApi } from "@/lib/api";
import { QuestSkeleton } from "@/components/skeletons/QuestSkeleton";
import { SHARED_STALE_MS, PERSONALIZED_STALE_MS } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

const ACTION_LABELS: Record<string, string> = {
  post_created: "Нийтлэл үүсгэсэн",
  comment_created: "Сэтгэгдэл үлдээсэн",
  gallery_upload: "Зураг оруулсан",
  poll_vote: "Санал өгсөн",
  login_daily: "Өдөр бүр нэвтэрсэн",
  receive_reactions: "Реакци хүлээн авсан",
};

function toNumber(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function formatEndDate(iso: unknown): string | null {
  if (typeof iso !== "string" || !iso.trim()) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("mn-MN", { year: "numeric", month: "short", day: "numeric" }).format(d);
}

interface QuestCardProps {
  title: string;
  description?: string | null;
  actionLabel?: string | null;
  endDateLabel?: string | null;
  xp: number;
  progress: number;
  total: number;
}

const QuestCard = ({ title, description, actionLabel, endDateLabel, xp, progress, total }: QuestCardProps) => {
  const done = total > 0 && progress >= total;
  return (
    <div className={`bg-card rounded-xl p-4 shadow-sm ${done ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm font-semibold">{title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted-foreground font-medium">+{xp} XP</p>
            {actionLabel ? (
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {actionLabel}
              </span>
            ) : null}
            {endDateLabel ? (
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                Дуусах: {endDateLabel}
              </span>
            ) : null}
          </div>
          {description ? <p className="text-xs text-muted-foreground mt-2 leading-4">{description}</p> : null}
        </div>
        <div className="flex items-center gap-2 pl-3">
          <span className="text-xs text-muted-foreground font-medium tabular-nums">
            {Math.min(progress, total)}/{total}
          </span>
          {done ? (
            <div className="w-7 h-7 bg-success rounded-full flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
          ) : null}
        </div>
      </div>
      <XPBar current={progress} max={total || 1} size="sm" />
    </div>
  );
};

const Quest = () => {
  const { token } = useAuth();
  const { data: questsList = [], isPending: questsPending } = useQuery({
    queryKey: ["quests"],
    queryFn: () => questsApi.get(),
    staleTime: SHARED_STALE_MS,
    refetchOnMount: "always",
  });
  const { data: myProgress = [] } = useQuery({
    queryKey: ["quests", "me"],
    queryFn: () => questsApi.getMyProgress(),
    enabled: !!token,
    staleTime: PERSONALIZED_STALE_MS,
  });

  type QuestVM = {
    id: string;
    title: string;
    description: string | null;
    type: string;
    xpReward: number;
    targetCount: number;
    actionType: string | null;
    endDate: string | null;
  };

  const quests = (questsList as unknown[]).flatMap((q): QuestVM[] => {
    if (!q || typeof q !== "object") return [];
    const anyQ = q as Record<string, unknown>;
    const id = typeof anyQ.id === "string" ? anyQ.id : typeof anyQ.quest_id === "string" ? (anyQ.quest_id as string) : "";
    const title = typeof anyQ.title === "string" ? anyQ.title : "";
    if (!id || !title) return [];

    const xpReward = toNumber(anyQ.xp_reward ?? anyQ.xpReward, 0);
    const targetCount = Math.max(1, Math.floor(toNumber(anyQ.target_count ?? anyQ.targetCount, 1)));
    const description = typeof anyQ.description === "string" ? anyQ.description : null;
    const type = typeof anyQ.type === "string" ? anyQ.type : "daily";
    const actionType = typeof anyQ.action_type === "string" ? anyQ.action_type : typeof anyQ.actionType === "string" ? anyQ.actionType : null;
    const endDate = typeof anyQ.end_date === "string" ? anyQ.end_date : typeof anyQ.endDate === "string" ? anyQ.endDate : null;

    return [
      {
        id,
        title,
        description,
        type,
        xpReward,
        targetCount,
        actionType,
        endDate,
      },
    ];
  });

  const progressByQuestId = new Map(
    (myProgress as Array<{ quest_id: string; progress: number }>).flatMap((p): Array<[string, number]> => {
      if (!p?.quest_id) return [];
      return [[p.quest_id, toNumber(p.progress, 0)]];
    })
  );

  const daily = quests.filter((q) => q.type === "daily");
  const weekly = quests.filter((q) => q.type === "weekly");
  const special = quests.filter((q) => q.type === "special");
  const completedCount = (myProgress as Array<{ is_completed: boolean }>).filter((p) => !!p?.is_completed).length;

  if (questsPending && quests.length === 0) {
    return <QuestSkeleton />;
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-1">🎯 Даалгавар</h1>
      <p className="text-sm text-muted-foreground mb-5">Даалгавар дуусгаад XP цуглуулна уу!</p>

      <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
          <Star size={24} />
        </div>
        <div className="text-foreground">
          <p className="text-sm text-muted-foreground">Өнөөдрийн явц</p>
          <p className="text-xl font-bold">{completedCount} / {quests.length} Даалгавар</p>
        </div>
      </div>

      {daily.length > 0 && (
        <section className="mb-6">
          <h2 className="text-base font-bold mb-3">⚡ Өдрийн даалгавар</h2>
          <div className="space-y-2.5">
            {daily.map((q) => {
              const progress = progressByQuestId.get(q.id) ?? 0;
              const total = q.targetCount ?? 1;
              return (
                <QuestCard
                  key={q.id}
                  title={q.title}
                  description={q.description}
                  actionLabel={q.actionType && q.actionType !== "manual" ? ACTION_LABELS[q.actionType] ?? q.actionType : null}
                  endDateLabel={formatEndDate(q.endDate)}
                  xp={q.xpReward ?? 0}
                  progress={progress}
                  total={total}
                />
              );
            })}
          </div>
        </section>
      )}

      {weekly.length > 0 && (
        <section className="mb-6">
          <h2 className="text-base font-bold mb-3">📅 Долоо хоногийн даалгавар</h2>
          <div className="space-y-2.5">
            {weekly.map((q) => {
              const progress = progressByQuestId.get(q.id) ?? 0;
              const total = q.targetCount ?? 1;
              return (
                <QuestCard
                  key={q.id}
                  title={q.title}
                  description={q.description}
                  actionLabel={q.actionType && q.actionType !== "manual" ? ACTION_LABELS[q.actionType] ?? q.actionType : null}
                  endDateLabel={formatEndDate(q.endDate)}
                  xp={q.xpReward ?? 0}
                  progress={progress}
                  total={total}
                />
              );
            })}
          </div>
        </section>
      )}

      {special.length > 0 && (
        <section>
          <h2 className="text-base font-bold mb-3">⭐ Тусгай даалгавар</h2>
          <div className="space-y-2.5">
            {special.map((q) => {
              const progress = progressByQuestId.get(q.id) ?? 0;
              const total = q.targetCount ?? 1;
              return (
                <QuestCard
                  key={q.id}
                  title={q.title}
                  description={q.description}
                  actionLabel={q.actionType && q.actionType !== "manual" ? ACTION_LABELS[q.actionType] ?? q.actionType : null}
                  endDateLabel={formatEndDate(q.endDate)}
                  xp={q.xpReward ?? 0}
                  progress={progress}
                  total={total}
                />
              );
            })}
          </div>
        </section>
      )}

      {quests.length === 0 && (
        <p className="text-sm text-muted-foreground">Одоогоор даалгавар байхгүй. Дараа дахин шалгана уу!</p>
      )}
    </div>
  );
};

export default Quest;
