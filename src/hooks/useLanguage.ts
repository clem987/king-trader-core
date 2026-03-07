import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfile } from './useProfile';

export function useLanguage() {
  const { i18n } = useTranslation();
  const { profile, updateProfile } = useProfile();

  // Sync language from profile on mount
  useEffect(() => {
    if (profile?.language && profile.language !== i18n.language) {
      i18n.changeLanguage(profile.language);
    }
  }, [profile?.language, i18n]);

  const setLanguage = async (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    if (profile) {
      await updateProfile.mutateAsync({ language: lang } as any);
    }
  };

  return { language: i18n.language, setLanguage };
}
