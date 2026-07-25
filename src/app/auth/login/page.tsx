import LoginClient from "./LoginClient";

export const metadata = { title: "Войти — Anispectra" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <div className="rounded-2xl border border-line bg-panel p-8 shadow-glow">
        <h1 className="mb-6 text-center font-display text-2xl font-black text-paper">Вход в аккаунт</h1>
        <LoginClient />
      </div>
    </div>
  );
}
