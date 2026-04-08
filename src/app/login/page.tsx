"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to login");
      }

      login(data.user, data.accessToken);
      router.push("/mec-donalds");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      {/* LOGO */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <Image
          src="https://u9a6wmr3as.ufs.sh/f/jppBrbk0cChQvcNP9rHlEJu1vCY5kLqzjf29HKaeN78Z6pRy"
          alt="FSW Donalds"
          width={80}
          height={80}
          className="rounded-full shadow-lg"
        />
        <h1 className="text-xl font-bold tracking-tight text-[#DB2423]">MC Donalds</h1>
      </div>

      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Bem-vindo de volta!</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus-visible:ring-[#FFC72C]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus-visible:ring-[#FFC72C]"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button 
              type="submit" 
              className="w-full bg-[#DB2423] hover:bg-[#b91c1c] text-white font-bold h-12 rounded-full" 
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Entrar"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Ainda não é um cliente?{" "}
            <Link href="/register" className="text-[#DB2423] font-bold hover:underline">
              Crie sua conta agora
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
