import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Native-datalist-based combobox: searchable, free-text-allowed dropdown.
 *
 * Why native <datalist>?
 *  - Zero extra deps (no Popover / Command / Radix primitives needed for a flat list)
 *  - Browser-native autocomplete + keyboard handling
 *  - Works in Safari / Firefox / Chrome
 *  - Allows free-text entry for edge cases (e.g. a brand-new country we don't have yet)
 *
 * Use for: countries, US states, nationalities — lists with ~50–250 options where
 * the user probably knows the spelling and just wants autocomplete.
 */

interface ComboboxSelectProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'list'> {
  options: readonly string[] | readonly { value: string; label: string }[];
  listId: string;
  error?: boolean;
}

export const ComboboxSelect = forwardRef<HTMLInputElement, ComboboxSelectProps>(
  ({ options, listId, error, className, ...inputProps }, ref) => {
    const normalised = options.map((opt) =>
      typeof opt === 'string' ? { value: opt, label: opt } : opt
    );

    return (
      <>
        <Input
          ref={ref}
          list={listId}
          autoComplete="off"
          className={cn(className, error && 'border-red-500')}
          {...inputProps}
        />
        <datalist id={listId}>
          {normalised.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </datalist>
      </>
    );
  }
);

ComboboxSelect.displayName = 'ComboboxSelect';
