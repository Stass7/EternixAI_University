"use client"

import { motion } from 'framer-motion'

interface ClientMotionWrapperProps {
  children: React.ReactNode
  initial?: any
  animate?: any
  whileInView?: any
  viewport?: any
  transition?: any
  className?: string
  [key: string]: any
}

export function ClientMotionWrapper({ children, ...props }: ClientMotionWrapperProps) {
  return (
    <motion.div {...props}>
      {children}
    </motion.div>
  )
} 