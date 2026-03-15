import { useState, useRef } from "react";
import { Settings, Camera, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Avatar from "@/components/Avatar";
import XPBar from "@/components/XPBar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { gallery as galleryApi, profile as profileApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";
import { PERSONALIZED_STALE_MS } from "@/lib/queryClient";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";

const XP_PER_LEVEL = 100;

type MyGalleryItem = {
  id: string;
  image_url: string;
  caption: string | null;
  category: string | null;
};

const Profile = () => {
  const { profile, refreshMe, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState(profile?.success ?? "");
  const [favSubject, setFavSubject] = useState(profile?.favorite_subject ?? "");

  const openEdit = () => {
    setSuccess(profile?.success ?? "");
    setFavSubject(profile?.favorite_subject ?? "");
    setEditing(true);
  };
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: myBadges = [] } = useQuery({
    queryKey: ["profile", "badges"],
    queryFn: () => profileApi.getMyBadges(),
    staleTime: PERSONALIZED_STALE_MS,
  });
  const { data: myGalleryData, isPending: myGalleryPending } = useQuery({
    queryKey: ["gallery", "me", 1, 50],
    queryFn: () => galleryApi.list({ page: 1, limit: 50, mine: true }),
    staleTime: PERSONALIZED_STALE_MS,
  });
  const [selectedPhoto, setSelectedPhoto] = useState<MyGalleryItem | null>(null);

  if (!profile) {
    return <ProfileSkeleton />;
  }

  const level = profile.level ?? 0;
  const totalXp = profile.total_xp ?? 0;
  const xpInLevel = totalXp % XP_PER_LEVEL;
  const maxXp = XP_PER_LEVEL;

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileApi.update({ success: success || null, favoriteSubject: favSubject || null });
      await refreshMe();
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    } catch {
      // error could be shown via toast
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const { url } = await profileApi.uploadAvatar(file);
      await profileApi.update({ avatarUrl: url });
      await refreshMe();
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    } catch {
      // error could be shown via toast
    } finally {
      setAvatarLoading(false);
      e.target.value = "";
    }
  };

  if (editing) {
    return (
      <div className="pb-24 px-4 pt-6 max-w-lg mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Профайл засах</h1>
          <button onClick={handleSave} disabled={saving} className="text-sm text-foreground font-semibold">
            {saving ? "Хадгалж байна…" : "Болсон"}
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="relative inline-block">
            <Avatar name={profile.full_name} size="xl" avatarUrl={profile.avatar_url} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-muted border border-border rounded-full flex items-center justify-center shadow"
            >
              <Camera size={14} className="text-foreground" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold block mb-1.5">Амжилт</label>
            <textarea
              value={success}
              onChange={(e) => setSuccess(e.target.value)}
              className="w-full bg-card border border-border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
              placeholder="Амжилтаа хуваалцана уу..."
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5">Дуртай хичээл</label>
            <input
              value={favSubject}
              onChange={(e) => setFavSubject(e.target.value)}
              className="w-full bg-card border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto animate-fade-in">
      <div className="text-center mb-5">
        <Avatar name={profile.full_name} size="xl" className="mx-auto mb-3" avatarUrl={profile.avatar_url} />
        <h1 className="text-xl font-bold">{profile.full_name}</h1>
        <p className="text-sm text-muted-foreground">{profile.success || "—"}</p>
        <div className="flex items-center justify-center gap-1.5 mt-2 text-sm font-semibold text-muted-foreground">
          Level {level}
        </div>
        <div className="max-w-[200px] mx-auto mt-2">
          <XPBar current={xpInLevel} max={maxXp} />
          <p className="text-[10px] text-muted-foreground mt-1">{xpInLevel} / {maxXp} XP</p>
        </div>
      </div>

      <button
        onClick={openEdit}
        className="w-full bg-card border border-border rounded-xl py-2.5 text-sm font-semibold text-foreground flex items-center justify-center gap-2 mb-5 active:scale-[0.98] transition-transform"
      >
        <Settings size={16} /> Профайл засах
      </button>

      <section className="mb-5">
        <h2 className="text-base font-bold mb-3">🎖 Ололт амжилт</h2>
        {myBadges.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {myBadges.map((ub: { id: string; badge: { name: string; icon: string | null } | null }) => (
              <div key={ub.id} className="bg-card rounded-xl p-3 text-center shadow-sm">
                <div className="text-2xl mb-1">{ub.badge?.icon ?? "⭐"}</div>
                <p className="text-[10px] font-semibold">{ub.badge?.name ?? "—"}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Одоогоор тэмдэг байхгүй. Даалгавар дуусгаад тэмдэг авна уу!</p>
        )}
      </section>

      <section className="mb-5">
        <h2 className="text-base font-bold mb-3">📸 Миний зураг</h2>
        {(() => {
          const items = (myGalleryData?.data ?? []) as MyGalleryItem[];
          if (myGalleryPending && items.length === 0) {
            return (
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square rounded-xl bg-muted animate-pulse" />
                <div className="aspect-square rounded-xl bg-muted animate-pulse" />
                <div className="aspect-square rounded-xl bg-muted animate-pulse" />
              </div>
            );
          }

          if (items.length === 0) {
            return <p className="text-sm text-muted-foreground">Одоогоор зураг байхгүй. “Зургийн цомог” дээрээс зураг оруулна уу.</p>;
          }

          return (
            <>
              <div className="grid grid-cols-3 gap-2">
                {items.slice(0, 9).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPhoto(p)}
                    className="relative aspect-square rounded-xl overflow-hidden shadow-sm"
                  >
                    <img src={p.image_url} alt={p.caption ?? "Миний зураг"} className="h-full w-full object-cover" loading="lazy" />
                    {p.caption ? (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                        <p className="text-primary-foreground text-[10px] font-medium truncate">{p.caption}</p>
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>

              <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
                <DialogContent className="max-w-[95vw] w-full max-h-[90vh] p-0 gap-0 border-0 bg-transparent shadow-none overflow-hidden [&>button]:hidden">
                  <div className="flex flex-col items-center bg-black/90 rounded-lg overflow-hidden">
                    <DialogClose className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80">
                      <X size={20} />
                    </DialogClose>
                    <img
                      src={selectedPhoto?.image_url}
                      alt={selectedPhoto?.caption ?? "Миний зураг"}
                      className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
                    />
                    {selectedPhoto?.caption ? (
                      <div className="w-full p-3 bg-black/70 text-white text-sm">
                        <p className="text-white/80 text-xs">{selectedPhoto.caption}</p>
                      </div>
                    ) : null}
                  </div>
                </DialogContent>
              </Dialog>
            </>
          );
        })()}
      </section>

      <button
        onClick={() => { logout(); navigate("/login", { replace: true }); }}
        className="w-full bg-card border border-border rounded-xl py-2.5 text-sm font-semibold text-muted-foreground"
      >
        Гарах
      </button>
    </div>
  );
};

export default Profile;
