// −/+ stepper. `height` stretches it to field height (e.g. 46 in the item modal).
export default function Stepper({ value, onChange, min = 0, height = 36, label = 'quantity' }) {
  const btn = (disabled) => ({
    width: 36, height: '100%', fontSize: 16, fontWeight: 700,
    color: disabled ? '#7AAAB8' : '#EEF4FA', cursor: disabled ? 'not-allowed' : 'pointer',
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', background: '#254862', borderRadius: 12, border: '1.5px solid #2E5674', overflow: 'hidden', height, boxSizing: 'border-box' }}>
      <button type="button" aria-label={`Decrease ${label}`} onClick={() => onChange(value - 1)} disabled={value <= min} style={btn(value <= min)}>−</button>
      <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: 15, color: '#00FDDC' }}>{value}</span>
      <button type="button" aria-label={`Increase ${label}`} onClick={() => onChange(value + 1)} style={btn(false)}>+</button>
    </div>
  );
}
