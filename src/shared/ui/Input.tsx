import type { InputHTMLAttributes, ReactNode } from 'react'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  right?: ReactNode
}

export function Input({ label, hint, right, className, ...props }: InputProps) {
  return (
    <label className="block">
      {label ? <div className="text-sm text-slate-200">{label}</div> : null}
      <div className="relative mt-1">
        <input
          className={[
            'w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-sm text-white/90 outline-none',
            'placeholder:text-slate-500 focus:border-white/20 focus:ring-2 focus:ring-indigo-500/20',
            right ? 'pr-11' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {right ? <div className="absolute inset-y-0 right-3 flex items-center text-slate-300">{right}</div> : null}
      </div>
      {hint ? <div className="mt-1 text-xs text-slate-400">{hint}</div> : null}
    </label>
  )
}

