import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ItemCard from './ItemCard';

const alice = { id: 'p1', name: 'Alice' };
const bob = { id: 'p2', name: 'Bob' };

function makeItem(overrides) {
  return { id: 'i1', name: 'Pizza', price: '10.00', quantity: 1, customModifiers: [], ...overrides };
}

function renderCard({ item = makeItem(), people = [alice, bob], assignments = [] } = {}) {
  const onSetShareCount = vi.fn();
  const { container } = render(
    <ItemCard
      item={item}
      people={people}
      assignments={assignments}
      onEdit={vi.fn()}
      onDeleteRequest={vi.fn()}
      onSetShareCount={onSetShareCount}
    />
  );
  return { onSetShareCount, card: container.firstChild };
}

const holds = (personId, n) => ({ id: 'a-' + personId, item_id: 'i1', person_id: personId, share_count: n });

describe('ItemCard', () => {
  it('tapping an avatar with no Share sets ×1', () => {
    const { onSetShareCount } = renderCard();
    fireEvent.click(screen.getByTitle('Alice'));
    expect(onSetShareCount).toHaveBeenCalledWith('i1', 'p1', 1);
  });

  it('tapping an avatar holding ×2 removes the Share', () => {
    const { onSetShareCount } = renderCard({ item: makeItem({ quantity: 3 }), assignments: [holds('p1', 2)] });
    fireEvent.click(screen.getByTitle('Alice'));
    expect(onSetShareCount).toHaveBeenCalledWith('i1', 'p1', 0);
  });

  it('shows a ×N badge only above one Share', () => {
    renderCard({ item: makeItem({ quantity: 3 }), assignments: [holds('p1', 2), holds('p2', 1)] });
    expect(screen.getByText('×2')).toBeInTheDocument();
    expect(screen.queryByText('×1')).not.toBeInTheDocument();
  });

  it('shows the status line and an amber border when partially assigned', () => {
    const { card } = renderCard({ item: makeItem({ quantity: 3 }), assignments: [holds('p1', 1)] });
    expect(screen.getByText('1 of 3 claimed — Alice covers all 3')).toBeInTheDocument();
    expect(card.className).toContain('border-[#FBBF24]');
  });

  it('uses the accent border when fully assigned and neutral when unassigned', () => {
    expect(renderCard({ assignments: [holds('p1', 1)] }).card.className).toContain('border-accent');
    expect(renderCard().card.className).toContain('border-border');
  });

  it('lets several people hold Shares on a quantity-1 item', () => {
    renderCard({ item: makeItem({ price: '4.25' }), assignments: [holds('p1', 1), holds('p2', 1)] });
    expect(screen.getByText('Split 2 ways · ~$2.13 each')).toBeInTheDocument();
  });
});
