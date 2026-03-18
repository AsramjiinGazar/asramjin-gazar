import { useState } from "react";
import { BookOpen, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Avatar from "@/components/Avatar";
import XPBar from "@/components/XPBar";
import { students as studentsApi } from "@/lib/api";
import { StudentsSkeleton } from "@/components/skeletons/StudentsSkeleton";
import { SHARED_STALE_MS } from "@/lib/queryClient";

const XP_PER_LEVEL = 100;

const Students = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: listData, isPending: listPending } = useQuery({
    queryKey: ["students", 1, 50],
    queryFn: () => studentsApi.list({ page: 1, limit: 50 }),
    staleTime: SHARED_STALE_MS,
  });
  const { data: detailProfile } = useQuery({
    queryKey: ["students", selectedId],
    queryFn: () => studentsApi.getById(selectedId!),
    enabled: !!selectedId,
    staleTime: SHARED_STALE_MS,
  });
  const students = listData?.data ?? [];
  const student = detailProfile;

  if (listPending && students.length === 0 && !student) {
    return <StudentsSkeleton />;
  }

  if (student) {
    const xpInLevel = (student.total_xp ?? 0) % XP_PER_LEVEL;
    const maxXp = XP_PER_LEVEL;
    const badges = (student as unknown as { badges?: Array<{ id: string; name: string; icon: string | null }> }).badges ?? [];
    return (
      <div className="pb-24 px-4 pt-6 max-w-lg mx-auto animate-fade-in">
        <button onClick={() => setSelectedId(null)} className="text-sm text-foreground font-semibold mb-4">  Буцах</button>
        <div className="bg-card rounded-2xl p-6 shadow-sm text-center">
          <Avatar name={student.full_name} size="xl" className="mx-auto mb-3" avatarUrl={student.avatar_url} />
          <h2 className="text-xl font-bold">{student.full_name}</h2>
          <div className="flex items-center justify-center gap-1 text-sm font-semibold text-muted-foreground mb-2">
            Level {student.level ?? 0}
          </div>
          <XPBar current={xpInLevel} max={maxXp} size="md" />
          <p className="text-xs text-muted-foreground mt-1">{xpInLevel} / {maxXp} XP</p>
        </div>

        <div className="mt-5 bg-card rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-sm mb-2">🎖 Тэмдэг</h3>
          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
                  title={b.name}
                >
                  <span className="text-base leading-none">{b.icon ?? "⭐"}</span>
                  <span className="max-w-[160px] truncate">{b.name}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Одоогоор тэмдэг байхгүй.</p>
          )}
        </div>

        <div className="mt-5 space-y-4">
          <div className="bg-card rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-sm mb-2">✨ Амжилт</h3>
            <p className="text-sm text-muted-foreground">{student.success || "—"}</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-sm mb-2">📚 Дуртай хичээл</h3>
            <p className="text-sm text-muted-foreground">{student.favorite_subject || "—"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto animate-fade-in ">
      <div className="bg-primary text-primary-foreground rounded-2xl p-5 mb-5 shadow-lg">
        <div className="flex items-center gap-3">
          <BookOpen size={20} className="opacity-90" />
          <div>
            <h1 className="text-lg font-bold">Асрамжийнхан</h1>
            <div className="flex items-center gap-1.5 mt-1 text-sm opacity-90">
              <Users size={14} />
              <span>
                {students.filter((s) => (s as unknown as { role?: string }).role !== "teacher").length}
                үүлээ
              </span>
            </div>
          </div>
        </div>
      </div>

      {(() => {
        const teachers = students.filter((s) => (s as unknown as { role?: string }).role === "teacher");
        const onlyStudents = students.filter((s) => (s as unknown as { role?: string }).role !== "teacher");
        const renderCard = (s: (typeof students)[number]) => {
          const isTeacher = (s as unknown as { role?: string }).role === "teacher";
          const badges = (s as unknown as { badges?: Array<{ id: string; name: string; icon: string | null }> }).badges ?? [];
          return (
          <button
            key={s.id}
            onClick={() => setSelectedId(s.id)}
            className={[
              "rounded-xl p-4 shadow-sm text-center active:scale-[0.97] transition-transform",
              isTeacher
                ? "bg-card col-span-2 ring-1 ring-[hsl(var(--gold))]/35 shadow-[0_10px_30px_-20px_rgba(255,200,80,0.55)]"
                : "bg-card",
            ].join(" ")}
          >
            {isTeacher ? (
              <div className="mb-2 flex justify-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--gold))]/15 text-[10px] font-extrabold tracking-wider text-[hsl(var(--gold))] px-2 py-0.5 ring-1 ring-[hsl(var(--gold))]/25">
                  <span className="text-[12px] leading-none">👩‍🏫</span>
                  БАГШ
                </span>
              </div>
            ) : null}
            <Avatar name={s.full_name} size="lg" className="mx-auto mb-2" avatarUrl={s.avatar_url} />
            <p className="font-semibold text-sm">{s.full_name}</p>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{s.success || "—"}</p>
            {badges.length > 0 ? (
              <div className="mt-2 flex items-center justify-center gap-1.5">
                {badges.slice(0, 3).map((b) => (
                  <span key={b.id} className="text-sm leading-none" title={b.name}>
                    {b.icon ?? "⭐"}
                  </span>
                ))}
                {badges.length > 3 ? (
                  <span className="text-[10px] font-semibold text-muted-foreground">+{badges.length - 3}</span>
                ) : null}
              </div>
            ) : (
              <div className="mt-2 h-[18px]" />
            )}
            <span className="inline-block mt-2 text-[10px] font-semibold bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full">
              Lvl {s.level ?? 0}
            </span>
          </button>
        );
        };

        return (
          <>
            {teachers.length > 0 ? (
              <>
                <h2 className="text-base font-bold mb-3">Багш нар</h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {teachers.map(renderCard)}
                </div>
              </>
            ) : null}

            <h2 className="text-base font-bold mb-3">Сурагчид</h2>
            <div className="grid grid-cols-2 gap-3">
              {onlyStudents.map(renderCard)}
            </div>
          </>
        );
      })()}
    </div>
  );
};

export default Students;
