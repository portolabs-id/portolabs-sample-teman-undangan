"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    const name = String(fd.get("name") ?? "");
    setLoading(true);
    try {
      const res = mode === "register" ? await signUp.email({ email, password, name }) : await signIn.email({ email, password });
      if (res.error) { toast.error(res.error.message ?? (mode === "register" ? "Gagal daftar" : "Gagal masuk")); return; }
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {mode === "register" && (
        <div className="grid gap-2">
          <Label htmlFor="name">Nama</Label>
          <Input id="name" name="name" required />
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Kata sandi</Label>
        <Input id="password" name="password" type="password" minLength={8} required />
      </div>
      <Button type="submit" disabled={loading}>
        {mode === "register" ? "Daftar" : "Masuk"}
      </Button>
    </form>
  );
}
