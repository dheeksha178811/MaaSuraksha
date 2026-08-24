import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { BreadcrumbItem } from '@/types';

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  showHome = false,
  className,
}) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1.5 text-xs sm:text-sm text-warm-muted', className)}
    >
      {showHome && (
        <Link
          to="/"
          className="inline-flex items-center text-warm-muted hover:text-sandal-600 transition-colors"
          title="Home"
        >
          <Home className="w-3.5 h-3.5 mr-1" />
        </Link>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {(showHome || index > 0) && (
              <ChevronRight className="w-3.5 h-3.5 text-sandal-300 shrink-0" />
            )}
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="hover:text-sandal-600 transition-colors text-warm-muted font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'font-medium truncate',
                  isLast ? 'text-warm-brown font-semibold' : 'text-warm-muted'
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
