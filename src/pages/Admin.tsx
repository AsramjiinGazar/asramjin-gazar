import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Target, Megaphone, ArrowLeft, Sparkles, UserCheck, BadgeCheck } from "lucide-react";
import { panel, quests as questsApi, students as studentsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const QUEST_TYPES = [
  { value: "daily", label: "Өдрийн" },
  { value: "weekly", label: "Долоо хоногийн" },
  { value: "special", label: "Тусгай" },
] as const;

function getMaxEndDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 16);
}

type Tab = "quest" | "award" | "badges" | "announcement";

const selectClassName =
  "w-full h-11 rounded-2xl border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/20";

const Admin = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("quest");

  const [questTitle, setQuestTitle] = useState("");
  const [questDescription, setQuestDescription] = useState("");
  const [questType, setQuestType] = useState<"daily" | "weekly" | "special">("daily");
  const [questXp, setQuestXp] = useState("");
  const [questEndDate, setQuestEndDate] = useState("");
  const [questSubmitting, setQuestSubmitting] = useState(false);

  const { data: questsList = [] } = useQuery({
    queryKey: ["quests"],
    queryFn: () => questsApi.get(),
    staleTime: 0,
    refetchOnMount: "always",
    enabled: tab === "award",
  });

  const [awardQuestId, setAwardQuestId] = useState<string>("");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [awarding, setAwarding] = useState(false);

  const { data: studentsRes } = useQuery({
    queryKey: ["students", studentSearch],
    queryFn: () => studentsApi.list({ page: 1, limit: 50, search: studentSearch.trim() || undefined }),
    staleTime: 0,
    refetchOnMount: "always",
    enabled: tab === "award" || tab === "badges",
  });

  const students = studentsRes?.data ?? [];

  const questOptions = useMemo(() => {
    const arr = questsList as Array<{ id: string; title: string; type?: string; xp_reward?: number }>;
    return arr.filter((q) => q?.id && q?.title);
  }, [questsList]);

  const selectedCount = selectedUserIds.size;

  const [badgeId, setBadgeId] = useState<string>("");
  const [badgeName, setBadgeName] = useState("");
  const [badgeIcon, setBadgeIcon] = useState("");
  const [badgeSubmitting, setBadgeSubmitting] = useState(false);
  const [badgeAwarding, setBadgeAwarding] = useState(false);

  const { data: badgesList = [] } = useQuery({
    queryKey: ["panel", "badges"],
    queryFn: () => panel.listBadges(),
    staleTime: 0,
    refetchOnMount: "always",
    enabled: tab === "badges",
  });

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementSubmitting, setAnnouncementSubmitting] = useState(false);

  const handleCreateQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    const xp = parseInt(questXp, 10);

    if (!questTitle.trim() || isNaN(xp) || xp < 1) {
      toast.error("Гарчиг болон XP (≥1) оруулна уу");
      return;
    }

    let endDate: string | null = null;
    if (questEndDate.trim()) {
      const end = new Date(questEndDate);
      const maxEnd = new Date();
      maxEnd.setMonth(maxEnd.getMonth() + 1);

      if (end.getTime() > maxEnd.getTime()) {
        toast.error("Дуусах огноо 1 сарын дотор байх ёстой");
        return;
      }

      endDate = end.toISOString();
    }

    setQuestSubmitting(true);
    try {
      await panel.createQuest({
        title: questTitle.trim(),
        description: questDescription.trim() || null,
        type: questType,
        xpReward: xp,
        endDate,
      });

      toast.success("Даалгавар нэмэгдлээ!");
      setQuestTitle("");
      setQuestDescription("");
      setQuestXp("");
      setQuestEndDate("");
      await queryClient.invalidateQueries({ queryKey: ["quests"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Даалгавар нэмэхэд алдаа гарлаа");
    } finally {
      setQuestSubmitting(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleAwardXp = async () => {
    if (!awardQuestId) {
      toast.error("Даалгавраа сонгоно уу");
      return;
    }
    if (selectedUserIds.size === 0) {
      toast.error("Хамгийн багадаа 1 оюутан сонгоно уу");
      return;
    }

    setAwarding(true);
    try {
      const { awardedCount, skippedCount } = await panel.awardQuestXp(awardQuestId, Array.from(selectedUserIds));
      toast.success(`XP олголоо: ${awardedCount}, Алгассан: ${skippedCount}`);
      setSelectedUserIds(new Set());
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["leaderboard"] }),
        queryClient.invalidateQueries({ queryKey: ["students"] }),
        queryClient.invalidateQueries({ queryKey: ["auth"] }),
        queryClient.invalidateQueries({ queryKey: ["quests", "me"] }),
      ]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "XP олгоход алдаа гарлаа");
    } finally {
      setAwarding(false);
    }
  };

  const handleCreateBadge = async () => {
    if (!badgeName.trim()) {
      toast.error("Тэмдгийн нэр оруулна уу");
      return;
    }
    setBadgeSubmitting(true);
    try {
      await panel.createBadge({
        name: badgeName.trim(),
        icon: badgeIcon.trim() || null,
      });
      toast.success("Тэмдэг нэмэгдлээ!");
      setBadgeName("");
      setBadgeIcon("");
      await queryClient.invalidateQueries({ queryKey: ["panel", "badges"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Тэмдэг нэмэхэд алдаа гарлаа");
    } finally {
      setBadgeSubmitting(false);
    }
  };

  const handleAwardBadges = async () => {
    if (!badgeId) {
      toast.error("Тэмдгээ сонгоно уу");
      return;
    }
    if (selectedUserIds.size === 0) {
      toast.error("Хамгийн багадаа 1 сурагч сонгоно уу");
      return;
    }
    setBadgeAwarding(true);
    try {
      const { awardedCount, skippedCount } = await panel.awardBadges(badgeId, Array.from(selectedUserIds));
      toast.success(`Тэмдэг олголоо: ${awardedCount}, Алгассан: ${skippedCount}`);
      setSelectedUserIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["students"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Тэмдэг олгоход алдаа гарлаа");
    } finally {
      setBadgeAwarding(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!announcementTitle.trim() || !announcementContent.trim()) {
      toast.error("Гарчиг болон агуулгаа оруулна уу");
      return;
    }

    setAnnouncementSubmitting(true);
    try {
      await panel.createAnnouncement({
        title: announcementTitle.trim(),
        content: announcementContent.trim(),
      });

      toast.success("Зарлал нэмэгдлээ!");
      setAnnouncementTitle("");
      setAnnouncementContent("");
      await queryClient.invalidateQueries({ queryKey: ["announcements"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Зарлал нэмэхэд алдаа гарлаа");
    } finally {
      setAnnouncementSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft size={18} />
              Буцах
            </Link>


            <div className="w-[62px]" />
          </div>

          <div className="mt-3 rounded-2xl bg-muted p-1">
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => setTab("quest")}
                className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium transition ${
                  tab === "quest"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Target size={16} />
                Даалгавар
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab("award");
                  setSelectedUserIds(new Set());
                }}
                className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium transition ${
                  tab === "award"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserCheck size={16} />
                XP олгох
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab("badges");
                  setSelectedUserIds(new Set());
                }}
                className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium transition ${
                  tab === "badges"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BadgeCheck size={16} />
                Тэмдэг
              </button>

              <button
                type="button"
                onClick={() => setTab("announcement")}
                className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium transition ${
                  tab === "announcement"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Megaphone size={16} />
                Зарлал
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-4">
        {tab === "quest" && (
          <Card className="overflow-hidden rounded-3xl border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Target size={18} />
                </div>
                <div>
                  <CardTitle className="text-lg">Даалгавар нэмэх</CardTitle>
                  <CardDescription className="mt-1 text-sm leading-5">
                    Сурагчийн XP даалгаврын тохиргоо.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleCreateQuest}>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="quest-title">Гарчиг</Label>
                  <Input
                    id="quest-title"
                    value={questTitle}
                    onChange={(e) => setQuestTitle(e.target.value)}
                    placeholder="Нийтлэл дээр сэтгэгдэл үлдээх"
                    required
                    className="h-11 rounded-2xl"
                  />
                </div>

                <div className="grid grid-cols-[1fr_88px] gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="quest-type">Төрөл</Label>
                    <select
                      id="quest-type"
                      value={questType}
                      onChange={(e) => setQuestType(e.target.value as "daily" | "weekly" | "special")}
                      className={selectClassName}
                    >
                      {QUEST_TYPES.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quest-xp">XP</Label>
                    <Input
                      id="quest-xp"
                      type="number"
                      min={1}
                      value={questXp}
                      onChange={(e) => setQuestXp(e.target.value)}
                      placeholder="10"
                      required
                      className="h-11 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quest-description">
                    Тайлбар <span className="text-muted-foreground text-xs">(заавал биш)</span>
                  </Label>
                  <Input
                    id="quest-description"
                    value={questDescription}
                    onChange={(e) => setQuestDescription(e.target.value)}
                    placeholder="Товч тайлбар"
                    className="h-11 rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quest-end-date">
                    Дуусах огноо <span className="text-muted-foreground text-xs">(заавал биш)</span>
                  </Label>
                  <Input
                    id="quest-end-date"
                    type="datetime-local"
                    value={questEndDate}
                    onChange={(e) => setQuestEndDate(e.target.value)}
                    max={getMaxEndDate()}
                    className="h-11 rounded-2xl"
                  />
                  <p className="text-xs text-muted-foreground">1 сарын дотор байх ёстой.</p>
                </div>
              </CardContent>

              <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="mx-auto max-w-md">
                  <Button
                    type="submit"
                    disabled={questSubmitting}
                    className="h-12 w-full rounded-2xl text-sm font-semibold"
                  >
                    <Sparkles size={16} className="mr-2" />
                    {questSubmitting ? "Нэмж байна…" : "Даалгавар нэмэх"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        )}

        {tab === "award" && (
          <Card className="overflow-hidden rounded-3xl border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <UserCheck size={18} />
                </div>
                <div>
                  <CardTitle className="text-lg">Даалгавар баталгаажуулах</CardTitle>
                  <CardDescription className="mt-1 text-sm leading-5">
                    Даалгавраа хийсэн сурагчдыг сонгоод XP олгоно.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="award-quest">Даалгавар</Label>
                <select
                  id="award-quest"
                  value={awardQuestId}
                  onChange={(e) => {
                    setAwardQuestId(e.target.value);
                    setSelectedUserIds(new Set());
                  }}
                  className={selectClassName}
                >
                  <option value="">Сонгох…</option>
                  {questOptions.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title}
                      {q.type ? ` • ${q.type}` : ""}
                      {typeof q.xp_reward === "number" ? ` • +${q.xp_reward} XP` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Энэ хэсэг зөвхөн админ эрхтэй хэрэглэгчид ажиллана.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-search">Сурагч хайх</Label>
                <Input
                  id="student-search"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Нэрээр хайх…"
                  className="h-11 rounded-2xl"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Сонгосон: <span className="font-semibold text-foreground">{selectedCount}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 rounded-xl px-3"
                    onClick={() => {
                      const ids = (students ?? [])
                        .map((s) => (typeof (s as any).user_id === "string" ? ((s as any).user_id as string) : ""))
                        .filter(Boolean);
                      setSelectedUserIds(new Set(ids));
                    }}
                    disabled={(students ?? []).length === 0}
                  >
                    Бүгд
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 rounded-xl px-3"
                    onClick={() => setSelectedUserIds(new Set())}
                    disabled={selectedCount === 0}
                  >
                    Цэвэрлэх
                  </Button>
                </div>
              </div>

              <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
                {students.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Сурагч олдсонгүй.</p>
                ) : (
                  students.map((s) => {
                    const userId = (s as any).user_id as string | undefined;
                    if (!userId) return null;
                    const checked = selectedUserIds.has(userId);
                    const fullName = ((s as any).full_name as string | undefined) ?? "Нэргүй";
                    const level = (s as any).level as number | undefined;
                    const totalXp = (s as any).total_xp as number | undefined;

                    return (
                      <label
                        key={userId}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition ${
                          checked ? "border-primary/40 bg-primary/5" : "border-border bg-background hover:bg-muted/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleUser(userId)}
                          className="h-4 w-4"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {typeof level === "number" ? `Level ${level}` : "Level —"}
                            {typeof totalXp === "number" ? ` • ${totalXp} XP` : ""}
                          </p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              <Button
                type="button"
                onClick={handleAwardXp}
                disabled={awarding || !awardQuestId || selectedCount === 0}
                className="h-12 w-full rounded-2xl text-sm font-semibold"
              >
                {awarding ? "XP олгож байна…" : "Сонгосонд XP олгох"}
              </Button>
            </CardContent>
          </Card>
        )}

        {tab === "badges" && (
          <Card className="overflow-hidden rounded-3xl border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <BadgeCheck size={18} />
                </div>
                <div>
                  <CardTitle className="text-lg">Тэмдэг олгох</CardTitle>
                  <CardDescription className="mt-1 text-sm leading-5">
                    Сурагчдыг сонгоод тэмдэг олгоно. (Home дээр харагдахгүй, зөвхөн “Сурагчид” дээр харагдана.)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="badge-select">Тэмдэг</Label>
                <select
                  id="badge-select"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  className={selectClassName}
                >
                  <option value="">Сонгох…</option>
                  {(badgesList as Array<{ id: string; name: string; icon: string | null }>).map((b) => (
                    <option key={b.id} value={b.id}>
                      {(b.icon ? `${b.icon} ` : "") + b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-sm font-semibold mb-3">Шинэ тэмдэг нэмэх</p>
                <div className="grid grid-cols-[1fr_88px] gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="badge-name">Нэр</Label>
                    <Input
                      id="badge-name"
                      value={badgeName}
                      onChange={(e) => setBadgeName(e.target.value)}
                      placeholder="Жишээ: Шилдэг сурагч"
                      className="h-11 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="badge-icon">Icon</Label>
                    <Input
                      id="badge-icon"
                      value={badgeIcon}
                      onChange={(e) => setBadgeIcon(e.target.value)}
                      placeholder="🏅"
                      className="h-11 rounded-2xl"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleCreateBadge}
                  disabled={badgeSubmitting || !badgeName.trim()}
                  className="mt-3 h-11 w-full rounded-2xl text-sm font-semibold"
                >
                  {badgeSubmitting ? "Нэмж байна…" : "Тэмдэг нэмэх"}
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-search-badges">Сурагч хайх</Label>
                <Input
                  id="student-search-badges"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Нэрээр хайх…"
                  className="h-11 rounded-2xl"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Сонгосон: <span className="font-semibold text-foreground">{selectedCount}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 rounded-xl px-3"
                    onClick={() => {
                      const ids = (students ?? [])
                        .map((s) => (typeof (s as any).user_id === "string" ? ((s as any).user_id as string) : ""))
                        .filter(Boolean);
                      setSelectedUserIds(new Set(ids));
                    }}
                    disabled={(students ?? []).length === 0}
                  >
                    Бүгд
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 rounded-xl px-3"
                    onClick={() => setSelectedUserIds(new Set())}
                    disabled={selectedCount === 0}
                  >
                    Цэвэрлэх
                  </Button>
                </div>
              </div>

              <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
                {students.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Сурагч олдсонгүй.</p>
                ) : (
                  students.map((s) => {
                    const userId = (s as any).user_id as string | undefined;
                    if (!userId) return null;
                    const checked = selectedUserIds.has(userId);
                    const fullName = ((s as any).full_name as string | undefined) ?? "Нэргүй";
                    const level = (s as any).level as number | undefined;
                    const totalXp = (s as any).total_xp as number | undefined;

                    return (
                      <label
                        key={userId}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition ${
                          checked ? "border-primary/40 bg-primary/5" : "border-border bg-background hover:bg-muted/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleUser(userId)}
                          className="h-4 w-4"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {typeof level === "number" ? `Level ${level}` : "Level —"}
                            {typeof totalXp === "number" ? ` • ${totalXp} XP` : ""}
                          </p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              <Button
                type="button"
                onClick={handleAwardBadges}
                disabled={badgeAwarding || !badgeId || selectedCount === 0}
                className="h-12 w-full rounded-2xl text-sm font-semibold"
              >
                {badgeAwarding ? "Олгож байна…" : "Сонгосонд тэмдэг олгох"}
              </Button>
            </CardContent>
          </Card>
        )}

        {tab === "announcement" && (
          <Card className="overflow-hidden rounded-3xl border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Megaphone size={18} />
                </div>
                <div>
                  <CardTitle className="text-lg">Шинэ зарлал</CardTitle>
                  <CardDescription className="mt-1 text-sm leading-5">
                    Бүх сурагчид мессеж илгээх.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleCreateAnnouncement}>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="announcement-title">Гарчиг</Label>
                  <Input
                    id="announcement-title"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="Дараагийн баасан гарагт газар дээрх аялал"
                    required
                    className="h-11 rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="announcement-content">Агуулга</Label>
                  <Textarea
                    id="announcement-content"
                    value={announcementContent}
                    onChange={(e) => setAnnouncementContent(e.target.value)}
                    placeholder="Зарлалын бүтэн текстийг бичнэ үү..."
                    required
                    rows={8}
                    className="min-h-[220px] rounded-2xl"
                  />
                </div>
              </CardContent>

              <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="mx-auto max-w-md">
                  <Button
                    type="submit"
                    disabled={announcementSubmitting}
                    className="h-12 w-full rounded-2xl text-sm font-semibold"
                  >
                    <Megaphone size={16} className="mr-2" />
                    {announcementSubmitting ? "Нэмж байна…" : "Зарлал нэмэх"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Admin;