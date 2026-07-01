import { useState, useEffect } from 'react';
import { getBreakdown } from '../api/client';
import { getInitials, AVATAR_COLORS } from './PeopleManager';

// Torn-edge zigzag SVG mask. Fill matches page background (#152D42).
const ZIGZAG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='8'%3E%3Cpath d='M0 8 L8 0 L16 8' fill='%23152D42' stroke='none'/%3E%3C/svg%3E")`;

function ReceiptView({ breakdown }) {
  const subtotal = breakdown.people.reduce((s, p) => s + parseFloat(p.subtotal), 0);
  const tax = breakdown.people.reduce((s, p) => s + parseFloat(p.tax_amount), 0);
  const tip = breakdown.people.reduce((s, p) => s + parseFloat(p.tip_amount), 0);
  const grandTotal = subtotal + tax + tip;

  return (
    <div className="mx-auto max-w-[380px]">
      {/* top torn edge */}
      <div style={{ height: 16, background: `#1C3A54 ${ZIGZAG}`, backgroundRepeat: 'repeat-x', backgroundSize: '16px 8px', backgroundPosition: 'bottom' }} />

      <div className="border-x border-border bg-surface px-8 py-7 font-mono">
        <div className="mb-[22px] text-center">
          <div className="text-[15px] font-bold uppercase tracking-[3px]">SPLIT BILL</div>
          <div className="mt-1 text-[11px] text-gray-400">itemized receipt</div>
        </div>
        <div className="mb-[18px] border-b border-dashed border-border" />

        {breakdown.people.map((personData, i) => {
          const colorIndex = i % AVATAR_COLORS.length;
          const nameColor = ['#F87171','#60A5FA','#A78BFA','#4ADE80','#FBBF24','#F472B6','#FB923C','#38BDF8'][colorIndex];

          return (
            <div key={personData.person_id} className="mb-[18px]">
              <div
                className="mb-[9px] text-xs font-bold uppercase tracking-[1.5px]"
                style={{ color: nameColor }}
              >
                {personData.name}
              </div>
              {personData.items?.map((item, j) => (
                <div key={j} className="mb-[3px] flex justify-between text-xs">
                  <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap pr-3 text-gray-400">
                    {item.name}
                    {item.total_shares > 1 && ` (${item.share_count}/${item.total_shares})`}
                  </span>
                  <span>${parseFloat(item.share_amount).toFixed(2)}</span>
                </div>
              ))}
              <div className="mt-[5px] flex justify-between border-t border-dotted border-border pt-[5px] text-[13px] font-bold">
                <span>TOTAL</span>
                <span className="text-accent">${parseFloat(personData.total).toFixed(2)}</span>
              </div>
              {i < breakdown.people.length - 1 && (
                <div className="mt-3.5 border-b border-dashed border-border" />
              )}
            </div>
          );
        })}

        <div className="mt-[18px] border-t-2 border-border pt-4">
          {[['SUBTOTAL', subtotal], ['TAX', tax], ['TIP', tip]].map(([label, value]) => (
            <div key={label} className="mb-1 flex justify-between text-xs text-gray-400">
              <span>{label}</span>
              <span>${value.toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-2.5 flex justify-between border-t border-dashed border-border pt-2.5 text-sm font-bold">
            <span>GRAND TOTAL</span>
            <span className="text-accent">${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* bottom torn edge (flipped) */}
      <div style={{ height: 16, background: `#1C3A54 ${ZIGZAG}`, backgroundRepeat: 'repeat-x', backgroundSize: '16px 8px', backgroundPosition: 'bottom', transform: 'scaleY(-1)' }} />
    </div>
  );
}

export default function FinalBreakdown({ billId, people, onBack }) {
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('cards');

  const fetchBreakdown = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBreakdown(billId);
      setBreakdown(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreakdown();
  }, [billId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-red-400 mb-4">Failed to calculate breakdown: {error}</p>
        <button
          onClick={fetchBreakdown}
          className="px-4 py-2 bg-surface text-gray-300 rounded-lg hover:bg-surface-2 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!breakdown?.people?.length) return null;

  const PLAIN_COLORS = ['#F87171','#60A5FA','#A78BFA','#4ADE80','#FBBF24','#F472B6','#FB923C','#38BDF8'];

  return (
    <div className="fade-up">
      {/* Header + toggle */}
      <div className="flex items-start justify-between flex-wrap" style={{ marginBottom: 28, gap: 12 }}>
        <div>
          <h2 className="font-extrabold" style={{ fontSize: 26, marginBottom: 4 }}>All settled!</h2>
          <p className="text-gray-400" style={{ fontSize: 14, margin: 0 }}>Here's what everyone owes.</p>
        </div>
        <div className="flex shrink-0" style={{
          position: 'relative', background: '#1C3A54', borderRadius: 12, padding: 4, border: '1px solid #2E5674',
        }}>
          {/* Sliding pill */}
          <div style={{
            position: 'absolute', top: 4, bottom: 4, left: 4,
            width: 'calc(50% - 4px)', borderRadius: 9,
            background: '#00FDDC', pointerEvents: 'none',
            transform: view === 'receipt' ? 'translateX(100%)' : 'translateX(0)',
            transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1)',
          }} />
          {['cards', 'receipt'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                flex: 1, padding: '7px 16px', borderRadius: 9, fontSize: 12, fontWeight: 700,
                background: 'none', color: view === v ? '#111' : '#A0C4DC',
                textTransform: 'capitalize', transition: 'color 0.2s',
                position: 'relative', zIndex: 1,
              }}
            >
              {v === 'cards' ? 'Cards' : 'Receipt'}
            </button>
          ))}
        </div>
      </div>

      {view === 'cards' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: 14, marginBottom: 24,
        }}>
          {breakdown.people.map((personData, idx) => {
            const colorIndex = people
              ? people.findIndex((p) => p.id === personData.person_id)
              : idx;
            const avatarColor = PLAIN_COLORS[(colorIndex === -1 ? idx : colorIndex) % PLAIN_COLORS.length];
            const itemCount = personData.items?.length || 0;

            return (
              <div key={personData.person_id} style={{
                background: '#1C3A54', borderRadius: 20, overflow: 'hidden',
                border: '1px solid #2E5674', display: 'flex', flexDirection: 'column',
              }}>
                {/* Card header */}
                <div className="flex items-center" style={{
                  gap: 12, background: '#254862', padding: '16px 20px',
                  borderBottom: '1px solid #2E5674',
                }}>
                  <div className="flex items-center justify-center shrink-0 font-extrabold" style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: avatarColor, color: '#111', fontSize: 14,
                  }}>
                    {getInitials(personData.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-extrabold truncate" style={{ fontSize: 15 }}>{personData.name}</div>
                    <div style={{ fontSize: 12, color: '#A0C4DC', marginTop: 2 }}>
                      {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="font-extrabold shrink-0" style={{ fontSize: 22, color: '#00FDDC' }}>
                    ${parseFloat(personData.total).toFixed(2)}
                  </div>
                </div>

                {/* Item list */}
                <div style={{ padding: '14px 20px' }}>
                  {personData.items?.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      {personData.items.map((item, i) => (
                        <div key={i} className="flex justify-between" style={{ fontSize: 13, marginBottom: 5 }}>
                          <span className="truncate" style={{ color: '#A0C4DC', maxWidth: '65%', paddingRight: 8 }}>
                            {item.name}
                            {item.total_shares > 1 && (
                              <span style={{ color: '#7AAAB8', marginLeft: 4, fontSize: 11 }}>
                                ({item.share_count}/{item.total_shares})
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 font-semibold">${parseFloat(item.share_amount).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid #2E5674', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {[
                      ['Subtotal', personData.subtotal],
                      parseFloat(personData.tax_amount) > 0 && ['Tax', personData.tax_amount],
                      parseFloat(personData.tip_amount) > 0 && ['Tip', personData.tip_amount],
                    ].filter(Boolean).map(([label, value]) => (
                      <div key={label} className="flex justify-between" style={{ fontSize: 12, color: '#7AAAB8' }}>
                        <span>{label}</span>
                        <span>${parseFloat(value).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ marginBottom: 24 }}>
          <ReceiptView breakdown={breakdown} />
        </div>
      )}

      {/* Footer */}
      <div className="flex" style={{ gap: 10, marginTop: 32 }}>
        <button
          onClick={onBack}
          className="btn-back"
          style={{
            padding: '14px 24px', borderRadius: 14, fontSize: 14, fontWeight: 700,
            background: '#254862', color: '#A0C4DC', transition: '0.2s',
          }}
        >
          ← Back
        </button>
        <button
          onClick={() => window.location.reload()}
          className="accent-hover"
          style={{
            flex: 1, padding: '14px 24px', borderRadius: 14, fontSize: 14, fontWeight: 700,
            background: '#00FDDC', color: '#111', transition: '0.2s',
          }}
        >
          Start New Bill
        </button>
      </div>
    </div>
  );
}
