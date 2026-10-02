'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, defaultChecked = false, onCheckedChange, disabled, onClick, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState<boolean>(
      checked !== undefined ? checked : defaultChecked
    );

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      const next = !isChecked;
      if (checked === undefined) {
        setIsChecked(next);
      }
      onCheckedChange?.(next);
      onClick?.(e);
    };

    const active = checked !== undefined ? checked : isChecked;

    return (
      <button
        type="button"
        role="switch"
        aria-checked={active}
        disabled={disabled}
        ref={ref}
        onClick={handleClick}
        className={cn(
          'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
          active ? 'bg-primary' : 'bg-input dark:bg-muted/80',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform',
            active ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };
