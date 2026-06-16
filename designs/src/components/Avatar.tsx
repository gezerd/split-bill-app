// Avatar — circular initials chip. Color is data-driven (by person index)
// so it stays an inline style rather than a Tailwind token.
import { AVATAR_COLORS } from '../lib/constants';
import { initials } from '../lib/format';
import type { Person } from '../types';

interface AvatarProps {
  person: Person;
  index: number;
  size?: number;
  filled?: boolean;
  onClick?: () => void;
}

export function Avatar({ person, index, size = 32, filled = false, onClick }: AvatarProps) {
  const c = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <button
      title={person.name}
      onClick={onClick}
      className="flex flex-shrink-0 select-none items-center justify-center rounded-full font-extrabold transition-all duration-150"
      style={{
        width: size,
        height: size,
        background: filled ? c : 'transparent',
        border: `2px solid ${c}`,
        color: filled ? '#111' : c,
        fontSize: size * 0.33,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {initials(person.name)}
    </button>
  );
}
