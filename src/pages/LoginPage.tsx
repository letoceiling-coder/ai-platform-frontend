export function LoginPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <h1 className="text-xl font-semibold tracking-tight">Login</h1>
        <p className="mt-1 text-sm text-slate-300">Sign in to continue.</p>

        <div className="mt-6 space-y-3">
          <label className="block">
            <span className="text-sm text-slate-200">Email</span>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-500 focus:border-white/20"
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-200">Password</span>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-500 focus:border-white/20"
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
            />
          </label>
          <button className="w-full rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400 active:bg-indigo-600">
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
