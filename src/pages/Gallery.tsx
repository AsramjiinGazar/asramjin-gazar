import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Upload, X } from "lucide-react";
import { gallery as galleryApi } from "@/lib/api";
import { GallerySkeleton } from "@/components/skeletons/GallerySkeleton";
import { SHARED_STALE_MS } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type GalleryItem = {
  id: string;
  image_url: string;
  caption: string | null;
  category: string | null;
  author?: { full_name: string };
};

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Бүгд" },
  { value: "trips", label: "Аялал" },
  { value: "school-life", label: "Сургуулийн амьдрал" },
  { value: "events", label: "Үйл явдал" },
  { value: "memes", label: "Меме" },
  { value: "projects", label: "Төсөл" },
];

const categoryToLabel = (c: string | null) => CATEGORY_OPTIONS.find((o) => o.value === c)?.label ?? c ?? "—";

const Gallery = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState("school-life");
  const [uploadCaption, setUploadCaption] = useState("");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const { data, isPending } = useQuery({
    queryKey: ["gallery", 1, 50, activeCategory || undefined],
    queryFn: () =>
      galleryApi.list({
        page: 1,
        limit: 50,
        category: activeCategory || undefined,
      }),
    staleTime: SHARED_STALE_MS,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Select an image");
      const form = new FormData();
      form.append("image", file);
      form.append("category", uploadCategory);
      if (uploadCaption.trim()) form.append("caption", uploadCaption.trim());
      return galleryApi.upload(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      setFile(null);
      setUploadCaption("");
      setUploading(false);
      toast.success("Зураг нэмэгдлээ!");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Оруулахад алдаа гарлаа");
      setUploading(false);
    },
  });

  const items = data?.data ?? [];

  const showGallerySkeleton = isPending && items.length === 0;

  if (showGallerySkeleton) {
    return (
      <div className="pb-24 px-4 pt-6 max-w-lg mx-auto animate-fade-in">
        <GallerySkeleton />
      </div>
    );
  }

  const handleUpload = () => {
    if (!file) {
      toast.error("Эхлээд зургаа сонгоно уу");
      return;
    }
    setUploading(true);
    uploadMutation.mutate();
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-1">📸 Зургийн цомог</h1>
      <p className="text-sm text-muted-foreground mb-4">Ангийн дурсамж, мөчлөг</p>

      {/* Зураг нэмэх */}
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!token) {
              navigate("/login", { replace: false, state: { from: "/gallery" } });
              return;
            }
            setUploading(!uploading);
          }}
          className="gap-2"
        >
          <Upload size={14} /> Зураг нэмэх
        </Button>
        {uploading && (
          <div className="mt-3 p-4 bg-card rounded-xl border space-y-3">
            <div>
              <Label>Зураг</Label>
              <Input
                type="file"
                accept="image/*"
                className="mt-1"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div>
              <Label>Ангилал</Label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {CATEGORY_OPTIONS.filter((o) => o.value).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Тайлбар (заавал биш)</Label>
              <Input
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="Тайлбар нэмэх..."
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleUpload} disabled={!file || uploadMutation.isPending}>
                {uploadMutation.isPending ? "Оруулж байна…" : "Оруулах"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setUploading(false); setFile(null); setUploadCaption(""); }}>
                Цуцлах
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none mb-3">
        {CATEGORY_OPTIONS.map((c) => (
          <button
            key={c.value || "all"}
            onClick={() => setActiveCategory(c.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              (c.value === "" && activeCategory === "") || activeCategory === c.value
                ? "bg-muted text-foreground"
                : "bg-card text-muted-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {items.map((p: GalleryItem) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedItem(p)}
            className="relative rounded-xl overflow-hidden shadow-sm group text-left"
          >
            <img src={p.image_url} alt={categoryToLabel(p.category)} className="w-full aspect-square object-cover" loading="lazy" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
              <p className="text-primary-foreground text-[11px] font-medium">{p.author?.full_name ?? "—"}</p>
              {p.caption && (
                <p className="text-primary-foreground/80 text-[10px] flex items-center gap-1">
                  <Heart size={10} /> {p.caption}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-[95vw] w-full max-h-[90vh] p-0 gap-0 border-0 bg-transparent shadow-none overflow-hidden [&>button]:hidden">
          <div className="flex flex-col items-center bg-black/90 rounded-lg overflow-hidden">
            <DialogClose className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80">
              <X size={20} />
            </DialogClose>
            <img
              src={selectedItem?.image_url}
              alt={selectedItem ? categoryToLabel(selectedItem.category) : ""}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
            />
            <div className="w-full p-3 bg-black/70 text-white text-sm">
              <p className="font-medium">{selectedItem?.author?.full_name ?? "—"}</p>
              {selectedItem?.caption && <p className="text-white/80 text-xs mt-0.5">{selectedItem.caption}</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">Одоогоор зураг байхгүй. Дээрээс нэмнэ үү!</p>
      )}
    </div>
  );
};

export default Gallery;
