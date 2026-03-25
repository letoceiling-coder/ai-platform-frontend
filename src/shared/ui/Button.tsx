import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md'

export type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: Variant
  size?: Size
  leftIcon?: ReactNode
}

type MotionButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & ButtonProps

const base =
  'inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary:
    'bg-indigo-500 text-white shadow-[0_12px_28px_rgba(99,102,241,0.22)] hover:bg-indigo-400 active:bg-indigo-600',
  secondary: 'border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 active:bg-white/5',
  ghost: 'text-slate-200 hover:bg-white/5 active:bg-white/0',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3',
  md: 'h-10 px-4',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  leftIcon,
  className,
  children,
  ...props
}: MotionButtonProps) {
  const cls = [base, variants[variant], sizes[size], className].filter(Boolean).join(' ')

  return (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={cls} {...props}>
      {leftIcon ? <span className="-ml-0.5">{leftIcon}</span> : null}
      {children}
    </motion.button>
  )
}

