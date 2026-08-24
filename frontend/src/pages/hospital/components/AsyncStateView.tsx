import React from 'react';
import { AlertCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

interface AsyncStateViewProps {
  status: 'loading' | 'error';
  loadingLabel?: string;
  errorMessage?: string;
  onRetry?: () => void;
}

/**
 * Shared loading/error presentation for the Hospital portal's async pages,
 * so every list page renders the same "Loading… / Unable to load" states
 * instead of re-implementing them per page.
 */
export const AsyncStateView: React.FC<AsyncStateViewProps> = ({
  status,
  loadingLabel = 'Loading…',
  errorMessage,
  onRetry,
}) => {
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center gap-2.5 py-16 text-sm text-warm-muted">
        <span className="w-4 h-4 rounded-full border-2 border-sandal-200 border-t-sandal-600 animate-spin" />
        {loadingLabel}
      </div>
    );
  }

  return (
    <EmptyState
      icon={AlertCircle}
      title="Unable to load data"
      description={errorMessage || 'Something went wrong. Please try again.'}
      action={onRetry && <Button variant="outline" onClick={onRetry}>Retry</Button>}
    />
  );
};
