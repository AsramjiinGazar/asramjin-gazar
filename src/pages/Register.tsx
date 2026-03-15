import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { students } from "@/data/mockData";

const SEED_PASSWORD = "Password1";

const Register = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const index = students.findIndex((s) => s.name.trim() === trimmed);
      if (index === -1) {
        setError("Нэр олдсонгүй. Ангийн жагсаалтаар нэрээ оруулна уу.");
        setLoading(false);
        return;
      }
      const email = `student${index + 1}@class.local`;
      await login(email, SEED_PASSWORD);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Нэвтрэхэд алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 max-w-lg mx-auto pt-6 pb-24">
      <h1 className="text-2xl font-bold mb-2">Бүртгүүлэх</h1>
      <p className="text-muted-foreground text-sm mb-6">Нэрээ оруулна уу</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Таны нэр</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Нэрээ оруулна уу"
            required
            className="mt-1.5"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Нэвтрэж байна…" : "Үргэлжлүүлэх"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground mt-6">
        Бүртгэлтэй юу? <Link to="/login" className="text-foreground font-semibold underline">Нэвтрэх</Link>
      </p>
    </div>
  );
};

export default Register;
