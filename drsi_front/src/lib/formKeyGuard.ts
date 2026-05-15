import type { KeyboardEvent } from 'react';

/**
 * Prevents the Enter key from submitting the form.
 *
 * Exception: Enter inside a <textarea> is allowed (line break).
 *
 * Why this exists: the multi-step wizard uses <form onSubmit={handleSubmit(onSubmit)}>.
 * When a user fills an input and presses Enter, the browser's default behavior
 * submits the form — this accidentally advances the user to the next step.
 * Meir explicitly asked: "Only the 'Continue' button should be [the way to advance]."
 */
export function preventEnterSubmit(e: KeyboardEvent<HTMLFormElement>) {
  if (e.key !== 'Enter') return;
  const target = e.target as HTMLElement;
  // Allow Enter in textareas so multi-line notes still work
  if (target.tagName === 'TEXTAREA') return;
  // Allow Enter on explicit submit buttons (so the Continue button still works)
  if (target.tagName === 'BUTTON' && (target as HTMLButtonElement).type === 'submit') return;
  e.preventDefault();
}
