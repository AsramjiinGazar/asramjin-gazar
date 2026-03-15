import { useEffect, useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Plus, X, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CalendarEvent {
  id: number;
  date: string;
  title: string;
  color: string;
}

const colorOptions = ["bg-primary", "bg-destructive", "bg-accent", "bg-secondary"];
const colorLabels: Record<string, string> = {
  "bg-primary": "Улаан",
  "bg-destructive": "Улаан",
  "bg-accent": "Акцент",
  "bg-secondary": "Саарал",
};

const EVENTS_STORAGE_KEY = "calendar_events_v1";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("bg-primary");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      const loaded = parsed
        .filter((e) => e && typeof e === "object")
        .map((e) => e as Partial<CalendarEvent>)
        .filter((e) => typeof e.id === "number" && typeof e.date === "string" && typeof e.title === "string" && typeof e.color === "string")
        .map((e) => ({ id: e.id!, date: e.date!, title: e.title!, color: e.color! }));
      setEvents(loaded);
    } catch {
      // ignore corrupted localStorage
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    } catch {
      // ignore storage quota / privacy mode
    }
  }, [events]);

  const eventDates = useMemo(() => events.map((e) => e.date), [events]);
  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const eventsForDate = useMemo(() => events.filter((e) => e.date === selectedDateStr), [events, selectedDateStr]);

  const addEvent = () => {
    if (!newTitle.trim() || !selectedDate) return;
    setEvents((prev) => [
      ...prev,
      { id: Date.now(), date: selectedDateStr, title: newTitle.trim(), color: newColor },
    ]);
    setNewTitle("");
    setNewColor("bg-primary");
    setDialogOpen(false);
  };

  const removeEvent = (id: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold">📅 Хуанли</h1>

      <div className="bg-card rounded-2xl shadow-sm p-3 flex justify-center">
        <Calendar
          mode="single"
          required
          selected={selectedDate}
          onSelect={(d) => setSelectedDate(d)}
          className={cn("p-3 pointer-events-auto")}
          modifiers={{ event: (date) => eventDates.includes(format(date, "yyyy-MM-dd")) }}
          modifiersClassNames={{ event: "!bg-muted !text-foreground font-bold" }}
        />
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <CalendarDays size={16} className="text-muted-foreground" />
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Огноо сонгоно уу"}
          </h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full gap-1" disabled={!selectedDate}>
                <Plus size={16} /> Нэмэх
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[340px] rounded-2xl">
              <DialogHeader>
                <DialogTitle>Шинэ үйл явдал</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  placeholder="Үйл явдлын гарчиг"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEvent();
                    }
                  }}
                />
                <div>
                  <p className="text-sm font-medium mb-2">Өнгө</p>
                  <div className="flex gap-2">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewColor(c)}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all",
                          c,
                          newColor === c ? "ring-2 ring-offset-2 ring-border scale-110" : "opacity-60"
                        )}
                        title={colorLabels[c]}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={addEvent} className="w-full rounded-xl" disabled={!newTitle.trim()}>
                  Үйл явдал нэмэх
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {eventsForDate.length === 0 ? (
          <div className="bg-card rounded-xl p-6 text-center shadow-sm">
            <p className="text-muted-foreground text-sm">Энэ өдөрт үйл явдал байхгүй</p>
          </div>
        ) : (
          <div className="space-y-2">
            {eventsForDate.map((event) => (
              <div key={event.id} className="bg-card rounded-xl p-3.5 shadow-sm flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full shrink-0", event.color)} />
                <p className="text-sm font-medium flex-1">{event.title}</p>
                <button onClick={() => removeEvent(event.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-bold mb-3">🗓 Ирэх үйл явдлууд</h2>
        <div className="space-y-2">
          {events
            .filter((e) => e.date >= format(new Date(), "yyyy-MM-dd"))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 5)
            .map((event) => (
              <div key={event.id} className="bg-card rounded-xl p-3.5 shadow-sm flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full shrink-0", event.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(event.date + "T00:00:00"), "MMM d, yyyy")}</p>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default CalendarPage;
