// ─────────────────────────────────────────────────────────────────────────
// Split Bill — runtime theme hook
//
// Applies the accent + secondary-text variants by writing CSS variables on
// :root. In the original prototype these were "tweaks"; in product they're
// just configuration. Call once near the app root.
// ─────────────────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { ACCENTS, TEXT_CONTRAST } from './constants';
import type { AccentName, TextContrast } from '../types';

export function useTheme(accent: AccentName = 'gold', textContrast: TextContrast = 'balanced') {
  useEffect(() => {
    const a = ACCENTS[accent] || ACCENTS.gold;
    document.documentElement.style.setProperty('--accent', a.color);
    document.documentElement.style.setProperty('--accent-dim', a.dim);

    const t = TEXT_CONTRAST[textContrast] || TEXT_CONTRAST.balanced;
    document.documentElement.style.setProperty('--text-muted', t.muted);
    document.documentElement.style.setProperty('--text-dim', t.dim);
  }, [accent, textContrast]);
}
