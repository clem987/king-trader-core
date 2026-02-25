import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.08), transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center text-center z-10 max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-3xl glow-button flex items-center justify-center mb-8"
        >
          <Crown className="w-10 h-10" />
        </motion.div>

        <h1 className="text-4xl font-display font-bold tracking-tight mb-2">
          KING <span className="text-gradient">TRADER</span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground text-sm mt-4 mb-12 italic"
        >
          "La discipline crée la rentabilité."
        </motion.p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="glow-button w-full py-3.5 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2"
          >
            Créer un compte
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/auth?mode=login')}
            className="glass-card w-full py-3.5 rounded-xl font-display font-bold text-sm text-foreground hover:border-primary/20 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </motion.div>
    </div>
  );
}
