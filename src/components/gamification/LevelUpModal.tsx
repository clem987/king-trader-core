import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';

interface LevelUpModalProps {
  show: boolean;
  levelName: string;
  level: number;
  onClose: () => void;
}

export default function LevelUpModal({ show, levelName, level, onClose }: LevelUpModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (show) {
      // Fire confetti
      const duration = 2000;
      const end = Date.now() + duration;
      const colors = ['#f97316', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();

      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const levelIcon = level >= 5 ? '👑' : level >= 4 ? '💎' : level >= 3 ? '🏆' : level >= 2 ? '⭐' : '🌱';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-center p-8"
            onClick={e => e.stopPropagation()}
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-7xl mb-4"
            >
              {levelIcon}
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-display font-extrabold text-gradient mb-2"
            >
              {t('gamification.levelUp')}
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-foreground font-display font-bold"
            >
              {t('gamification.levelUpMsg', { level: levelName })}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
