import { useState, useEffect } from 'react';
import { LogOut, ClipboardList, ChevronRight, Sun, Moon, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/GlassCard';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
];

const THEMES = [
  { value: 'dark' as const, icon: Moon, labelKey: 'settings.themeDark' },
  { value: 'light' as const, icon: Sun, labelKey: 'settings.themeLight' },
  { value: 'system' as const, icon: Monitor, labelKey: 'settings.themeSystem' },
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const { signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [market, setMarket] = useState('');
  const [maxRisk, setMaxRisk] = useState('');
  const [minRR, setMinRR] = useState('');
  const [maxTrades, setMaxTrades] = useState('');
  const [strategy, setStrategy] = useState('');

  useEffect(() => {
    if (profile) {
      setMarket(profile.market || '');
      setMaxRisk(String(profile.max_risk_per_trade || ''));
      setMinRR(String(profile.min_rr || ''));
      setMaxTrades(String(profile.max_trades_per_day || ''));
      setStrategy(profile.strategy || '');
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ market, max_risk_per_trade: Number(maxRisk), min_rr: Number(minRR), max_trades_per_day: Number(maxTrades), strategy });
      toast.success(t('common.success'));
    } catch { toast.error(t('common.error')); }
  };

  const handleLogout = async () => { await signOut(); navigate('/'); };

  return (
    <div className="p-4 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-display font-bold">{t('settings.title')}</h1>
        <p className="text-xs text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      {/* Theme selector */}
      <GlassCard className="mb-4 anim-fadeup">
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">{t('settings.theme')}</p>
        <p className="text-xs text-muted-foreground mb-3">{t('settings.themeDesc')}</p>
        <div className="flex gap-2">
          {THEMES.map(th => {
            const Icon = th.icon;
            return (
              <button key={th.value} onClick={() => setTheme(th.value)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all border ${
                  theme === th.value ? 'glow-button border-transparent' : 'glass-card text-muted-foreground border-border'
                }`}>
                <Icon className="w-4 h-4" />
                {t(th.labelKey)}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Language selector */}
      <GlassCard className="mb-4 anim-fadeup">
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">{t('settings.language')}</p>
        <p className="text-xs text-muted-foreground mb-3">{t('settings.languageDesc')}</p>
        <div className="flex gap-2">
          {LANGUAGES.map(lang => (
            <button key={lang.code} onClick={() => setLanguage(lang.code)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all border ${
                language === lang.code ? 'glow-button border-transparent' : 'glass-card text-muted-foreground border-border'
              }`}>
              <span className="text-lg">{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="mb-4 anim-fadeup-1">
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-4">{t('settings.strategy')}</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{t('settings.strategyName')}</label>
            <input value={strategy} onChange={(e) => setStrategy(e.target.value)} placeholder="Ex: ICT, SMC..."
              className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{t('settings.market')}</label>
            <input value={market} onChange={(e) => setMarket(e.target.value)} placeholder="Ex: Forex, Crypto..."
              className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1.5 block font-medium">{t('settings.riskMax')}</label>
              <input type="number" value={maxRisk} onChange={(e) => setMaxRisk(e.target.value)}
                className="glass-input w-full px-3 py-3 rounded-xl text-sm text-foreground outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1.5 block font-medium">{t('settings.rrMin')}</label>
              <input type="number" value={minRR} onChange={(e) => setMinRR(e.target.value)}
                className="glass-input w-full px-3 py-3 rounded-xl text-sm text-foreground outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1.5 block font-medium">{t('settings.maxTrades')}</label>
              <input type="number" value={maxTrades} onChange={(e) => setMaxTrades(e.target.value)}
                className="glass-input w-full px-3 py-3 rounded-xl text-sm text-foreground outline-none" />
            </div>
          </div>
          <button onClick={handleSave} className="glow-button w-full py-3 rounded-xl text-sm font-display font-bold">
            {t('common.save')}
          </button>
        </div>
      </GlassCard>

      <button onClick={() => navigate('/strategies')}
        className="glass-card w-full py-3.5 px-4 rounded-xl text-sm font-display font-semibold flex items-center justify-center gap-2 anim-fadeup-2 mb-4 border border-border text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all">
        <ClipboardList className="w-4 h-4" />
        {t('settings.manageStrategies')}
        <ChevronRight className="w-4 h-4 ml-auto" />
      </button>

      <button onClick={handleLogout}
        className="glass-card w-full py-3 rounded-xl text-sm font-display font-semibold text-destructive flex items-center justify-center gap-2 border border-destructive/20 anim-fadeup-3">
        <LogOut className="w-4 h-4" />
        {t('common.logout')}
      </button>
    </div>
  );
}
