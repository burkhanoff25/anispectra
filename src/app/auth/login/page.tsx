import Link from "next/link";

export const metadata = { title: "Войти — Anispectra" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <div className="rounded-2xl border border-line bg-panel p-8 shadow-glow">
        <h1 className="mb-6 text-center font-display text-2xl font-black text-paper">Вход в аккаунт</h1>
        <form className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-mist">Логин или Email</label>
            <input
              type="text"
              placeholder="animeshnik_488"
              className="w-full rounded-xl border border-line bg-base px-4 py-2 text-paper focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-mist">Пароль</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-line bg-base px-4 py-2 text-paper focus:border-accent focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-accent py-3 font-bold text-white transition hover:bg-accent/90"
          >
            Войти
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-mist">
          <span>Нет аккаунта? </span>
          <Link href="/auth/otp" className="text-accent hover:underline">
            Войти по OTP
          </Link>
        </div>
      </div>
    </div>
  );
}
