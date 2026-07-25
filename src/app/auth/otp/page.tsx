"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function OtpPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Введите корректный email");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Ошибка при отправке кода");
      }
      
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 5) {
      setError("Введите код полностью");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await signIn("credentials", {
        email,
        otp,
        redirect: false,
      });
      
      if (res?.error) {
        throw new Error(res.error);
      }
      
      if (res?.ok) {
        router.push("/profile");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <div className="rounded-2xl border border-line bg-panel p-8 shadow-glow">
        <h1 className="mb-6 text-center font-display text-2xl font-black text-paper">Вход по OTP</h1>
        <p className="mb-6 text-center text-sm text-mist">
          {step === 1 ? "Введите ваш email для получения кода авторизации." : "Введите 5-значный код, отправленный на ваш email."}
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 p-3 text-center text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm text-mist">Email</label>
              <input
                type="email"
                placeholder="anime@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-line bg-base px-4 py-3 text-paper focus:border-accent focus:outline-none"
                disabled={loading}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full justify-center items-center gap-2 rounded-xl bg-accent py-3 font-bold text-white transition hover:bg-accent/90 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {loading ? "Отправка..." : "Получить код"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm text-mist">Код OTP</label>
              <input
                type="text"
                placeholder="12345"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={5}
                className="w-full rounded-xl border border-line bg-base px-4 py-3 text-center text-2xl font-bold text-paper focus:border-accent focus:outline-none tracking-widest"
                disabled={loading}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full justify-center items-center gap-2 rounded-xl bg-accent py-3 font-bold text-white transition hover:bg-accent/90 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {loading ? "Проверка..." : "Подтвердить код"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={loading}
              className="text-sm text-mist hover:text-paper"
            >
              Изменить email
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-mist">
          <Link href="/auth/login" className="text-accent hover:underline">
            Вернуться к выбору входа
          </Link>
        </div>
      </div>
    </div>
  );
}
