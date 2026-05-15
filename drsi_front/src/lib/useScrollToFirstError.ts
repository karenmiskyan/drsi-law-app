import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';

/**
 * Recursively get the first error path from form errors (supports nested and array errors).
 */
function getFirstErrorPath(obj: object, prefix = ''): string | null {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && 'message' in value && typeof (value as { message?: string }).message === 'string') {
      return path;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = getFirstErrorPath(value as object, path);
      if (nested) return nested;
    }
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (item && typeof item === 'object') {
          const nested = getFirstErrorPath(item as object, `${path}.${i}`);
          if (nested) return nested;
        }
      }
    }
  }
  return null;
}

/**
 * On submit failure, scroll to the first field with an error.
 * Add data-field-id="{path}" to field wrappers for this to work.
 */
export function useScrollToFirstError<T extends object>(form: UseFormReturn<T>) {
  const { formState } = form;

  useEffect(() => {
    const isFailed = formState.isSubmitted && !formState.isSubmitSuccessful;
    if (!isFailed || !formState.errors || Object.keys(formState.errors).length === 0) {
      return;
    }

    const path = getFirstErrorPath(formState.errors as object);
    if (!path) return;

    requestAnimationFrame(() => {
      const selector = `[data-field-id="${path}"]`;
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        try {
          form.setFocus(path as Parameters<typeof form.setFocus>[0]);
          requestAnimationFrame(() => {
            document.activeElement?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
          });
        } catch {
          // setFocus may throw for non-registered paths; ignore
        }
      }
    });
  }, [form, formState.isSubmitted, formState.isSubmitSuccessful, formState.errors]);
}
