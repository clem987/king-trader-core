import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export function useTrades() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trades', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const todayTrades = trades.filter(t => t.date === new Date().toISOString().split('T')[0]);

  const addTrade = useMutation({
    mutationFn: async (trade: Record<string, any>) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('trades')
        .insert({ ...trade, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades', user?.id] });
    },
  });

  const winrate = trades.length > 0
    ? Math.round((trades.filter(t => (t.result_amount ?? 0) > 0).length / trades.length) * 100)
    : 0;

  const todayPnl = todayTrades.reduce((sum, t) => sum + (Number(t.result_amount) || 0), 0);

  const avgScore = trades.length > 0
    ? Math.round(trades.reduce((sum, t) => sum + (t.total_score ?? 0), 0) / trades.length)
    : 0;

  return { trades, todayTrades, isLoading, addTrade, winrate, todayPnl, avgScore };
}
