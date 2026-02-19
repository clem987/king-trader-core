import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', elevated = false, onClick }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${elevated ? 'glass-card-elevated' : 'glass-card'} p-4 ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
