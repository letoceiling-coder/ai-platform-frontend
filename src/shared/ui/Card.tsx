import type { HTMLAttributes, ReactNode } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: string
  description?: string
  right?: ReactNode
}

export function Card({ title, description, right, className, children, ...props }: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {title || description || right ? (
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-4">
          <div>
            {title ? <div className="text-sm font-semibold tracking-tight text-white">{title}</div> : null}
            {description ? <div className="mt-1 text-xs text-slate-300">{description}</div> : null}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      ) : null}
      <div className="p-6">{children}</div>
    </div>
  )
}

