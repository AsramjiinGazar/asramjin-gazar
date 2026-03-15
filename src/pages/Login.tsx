import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { students } from "@/data/mockData";

const SEED_PASSWORD = "Password1";

const Login = () => {
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
        setError("Нэр олдсонгүй.");
        setLoading(false);
        return;
      }
      const email = `student${index + 1}@class.local`;
      await login(email, SEED_PASSWORD);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 max-w-lg mx-auto pt-6 pb-24">
      <h1 className="text-2xl font-bold mb-6">Нэрээ оруулна уу</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Таны нэр"
          required
          className="text-lg h-12"
          autoFocus
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
          {loading ? "Уншиж байна…" : "Нэвтрэх"}
        </Button>
      </form>
    </div>
  );
};

export default Login;
