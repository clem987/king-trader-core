import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (!isLogin && username.length < 3) {
      toast.error('Le nom d\'utilisateur doit avoir au moins 3 caractères');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await signUp(email, password, username);
        if (error) throw error;
        navigate('/onboarding');
      }
    } catch (err: any) {
      toast.error(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-12 pb-8 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[100px]" />

      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground text-sm mb-8 z-10">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center z-10"
      >
        <div className="w-14 h-14 rounded-2xl glow-button flex items-center justify-center mb-6">
          <Crown className="w-7 h-7 text-primary-foreground" />
        </div>

        <h1 className="text-2xl font-display font-bold mb-1">
          {isLogin ? 'Bon retour' : 'Rejoins les Kings'}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {isLogin ? 'Connecte-toi pour continuer' : 'Crée ton compte de discipline'}
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none pr-12"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {!isLogin && (
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none"
              required
              minLength={6}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="glow-button w-full py-3.5 rounded-xl font-semibold text-sm text-primary-foreground disabled:opacity-50"
          >
            {loading ? '...' : isLogin ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-6 text-sm text-muted-foreground"
        >
          {isLogin ? 'Pas de compte ? ' : 'Déjà un compte ? '}
          <span className="text-primary font-medium">
            {isLogin ? 'Créer un compte' : 'Se connecter'}
          </span>
        </button>
      </motion.div>
    </div>
  );
}
