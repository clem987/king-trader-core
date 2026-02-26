import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  market: string;
  risk_max: number;
  rr_min: number;
  max_trades: number;
  is_active: boolean;
  created_at: string;
}

export function useStrategies() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ['strategies', user?.id];

  const { data: strategies = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Strategy[];
    },
    enabled: !!user,
  });

  const activeStrategy = strategies.find((s) => s.is_active) || null;

  const createStrategy = useMutation({
    mutationFn: async (values: { name: string; market: string; risk_max: number; rr_min: number; max_trades: number }) => {
      if (!user) throw new Error('Not authenticated');
      const isFirst = strategies.length === 0;
      const { error } = await supabase.from('strategies').insert({
        user_id: user.id,
        ...values,
        is_active: isFirst,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateStrategy = useMutation({
    mutationFn: async ({ id, ...values }: Partial<Strategy> & { id: string }) => {
      const { error } = await supabase.from('strategies').update(values).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteStrategy = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('strategies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const setActive = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('strategies').update({ is_active: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { strategies, activeStrategy, isLoading, createStrategy, updateStrategy, deleteStrategy, setActive };
}
