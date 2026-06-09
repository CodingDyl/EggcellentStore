import { useState, useEffect, useRef, useCallback } from 'react';

const ICONS = {
  success: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M2.5 7.5l3.5 3.5 6.5-6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M7.5 4v4M7.5 10.5v.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  ),
};

const STYLES = {
  success: 'border-emerald-700/40 bg-emerald-950/95 text-emerald-100 [--icon-color:theme(colors.emerald.400)]',
  error:   'border-red-800/40   bg-red-950/95   text-red-100   [--icon-color:theme(colors.red.400)]',
};

const DISMISS_DELAY_MS = 200;

export function Toast({ toast, onDismiss, duration = 4000 }) {
  const [leaving, setLeaving] = useState(false);
  const autoTimer = useRef(null);
  const exitTimer = useRef(null);

  const startExit = useCallback(() => {
    clearTimeout(autoTimer.current);
    setLeaving(true);
    exitTimer.current = setTimeout(onDismiss, DISMISS_DELAY_MS);
  }, [onDismiss]);

  useEffect(() => {
    autoTimer.current = setTimeout(startExit, duration);
    return () => {
      clearTimeout(autoTimer.current);
      clearTimeout(exitTimer.current);
    };
  }, [startExit, duration]);

  const { type, message } = toast;

  return (
    <div
      role={type === 'success' ? 'status' : 'alert'}
      aria-live={type === 'success' ? 'polite' : 'assertive'}
      className={[
        'fixed right-4 top-4 z-50 flex w-full max-w-xs items-start gap-3',
        'rounded-xl border px-4 py-3.5 shadow-2xl',
        leaving ? 'animate-toast-out pointer-events-none' : 'animate-toast-in',
        STYLES[type],
      ].join(' ')}
    >
      {/* icon */}
      <span className="mt-px shrink-0 text-[--icon-color]">
        {ICONS[type]}
      </span>

      {/* message */}
      <p className="flex-1 text-sm leading-snug">{message}</p>

      {/* close button */}
      <button
        type="button"
        onClick={startExit}
        aria-label="Dismiss notification"
        className="shrink-0 rounded p-0.5 opacity-50 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
