import { toast } from 'sonner';

export function showXPToast(xpAmount: number, message: string) {
  toast(message, {
    duration: 2500,
    position: 'top-right',
    style: {
      background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(245,158,11,0.1))',
      border: '1px solid rgba(249,115,22,0.3)',
      color: 'hsl(24, 95%, 53%)',
      fontWeight: 700,
      fontSize: '13px',
    },
  });
}
