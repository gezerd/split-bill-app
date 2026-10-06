import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Stepper from './Stepper';
import { getInitials, AVATAR_PLAIN_COLORS } from './PeopleManager';
import { describeItem, splitItemCents } from '../lib/splitModel';

const TONE = { dim: '#A0C4DC', warn: '#FBBF24', ok: '#A0C4DC' };

// Modal for setting every Person's Shares on one Item (−/+ per Person, live amounts).
export default function ShareSheet({ item, people, assignments, onSetShareCount, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sharesOf = (personId) =>
    assignments.find((a) => a.item_id === item.id && a.person_id === personId)?.share_count || 0;
  const totalShares = assignments
    .filter((a) => a.item_id === item.id && people.some((p) => p.id === a.person_id))
    .reduce((sum, a) => sum + a.share_count, 0);
  const split = splitItemCents(item, people, assignments);
  const line = describeItem(item, people, assignments);
  const qty = item.quantity || 1;
  const unit = parseFloat(item.price);
  const total = unit * qty;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center z-[150]"
      style={{ background: 'rgba(0,0,0,0.72)', padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-label={`Shares for ${item.name}`}
        className="scale-in w-full"
        style={{ background: '#1C3A54', borderRadius: 22, maxWidth: 420, border: '1px solid #2E5674', overflow: 'hidden' }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #2E5674' }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{item.name}</div>
          <div data-testid="sheet-sub" style={{ color: '#A0C4DC', fontSize: 13, marginTop: 3 }}>
            ${total.toFixed(2)}{qty > 1 ? ` · ${qty} × $${unit.toFixed(2)}` : ''} · {totalShares} share{totalShares === 1 ? '' : 's'}
          </div>
        </div>

        <div style={{ padding: '8px 24px', maxHeight: '60vh', overflow: 'auto' }}>
          {people.length === 0 && <p style={{ color: '#A0C4DC', fontSize: 13, padding: '16px 0' }}>Add people first.</p>}
          {people.map((person, index) => {
            const n = sharesOf(person.id);
            return (
              <div
                key={person.id}
                data-testid="sheet-row"
                className="flex items-center"
                style={{ gap: 12, padding: '12px 0', borderBottom: index === people.length - 1 ? 'none' : '1px solid #2E5674' }}
              >
                <span
                  className="flex items-center justify-center font-extrabold shrink-0"
                  style={{ width: 26, height: 26, borderRadius: '50%', background: AVATAR_PLAIN_COLORS[index % AVATAR_PLAIN_COLORS.length], color: '#111', fontSize: 10 }}
                >
                  {getInitials(person.name)}
                </span>
                <span className="flex-1 min-w-0 truncate" style={{ fontWeight: 600, fontSize: 14 }}>{person.name}</span>
                <Stepper
                  value={n}
                  label={person.name}
                  height={34}
                  onChange={(v) => onSetShareCount(item.id, person.id, Math.max(0, v))}
                />
                <span
                  data-testid="share-amount"
                  style={{ width: 64, textAlign: 'right', fontWeight: n ? 700 : 500, fontSize: 14, color: n ? '#EEF4FA' : '#7AAAB8' }}
                >
                  {n ? `$${(split[person.id] / 100).toFixed(2)}` : '—'}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '16px 24px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div data-testid="sheet-status" style={{ fontSize: 13, lineHeight: 1.45, color: TONE[line.tone] }}>{line.text}</div>
          <button
            onClick={onClose}
            className="accent-hover"
            style={{ padding: 13, borderRadius: 13, fontSize: 14, fontWeight: 700, background: '#00FDDC', color: '#111' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
