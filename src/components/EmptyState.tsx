import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: { label: string; to: string };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="text-5xl opacity-50">{icon}</div>
      <div>
        <h3 className="font-display font-bold text-lg mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">{description}</p>
      </div>
      {action && (
        <button
          onClick={() => navigate(action.to)}
          className="glow-button px-6 py-3 rounded-xl font-bold text-sm mt-2"
        >
          {action.label} →
        </button>
      )}
    </div>
  );
}
