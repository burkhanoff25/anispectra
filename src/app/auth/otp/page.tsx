import Link from "next/link";

export const metadata = { title: "OTP — Anispectra" };

export default function OtpPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <div className="rounded-2xl border border-line bg-panel p-8 shadow-glow">
        <h1 className="mb-6 text-center font-display text-2xl font-black text-paper">Вход по OTP</h1>
        <p className="mb-6 text-center text-sm text-mist">
          Введите 5-значный код для быстрой авторизации без пароля.
        </p>
        <form className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-mist">Код OTP</label>
            <input
              type="text"
              placeholder="12345"
              className="w-full rounded-xl border border-line bg-base px-4 py-2 text-paper focus:border-accent focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-accent py-3 font-bold text-white transition hover:bg-accent/90"
          >
            Подтвердить
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-mist">
          <Link href="/auth/login" className="text-accent hover:underline">
            Войти по паролю
          </Link>
        </div>
      </div>
    </div>
  );
}
