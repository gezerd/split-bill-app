import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ItemCard from './ItemCard';

const alice = { id: 'p1', name: 'Alice' };
const bob = { id: 'p2', name: 'Bob' };

function makeItem(overrides) {
  return { id: 'i1', name: 'Pizza', price: '10.00', quantity: 1, customModifiers: [], ...overrides };
}

function renderCard({ item = makeItem(), people = [alice, bob], assignments = [], selectedPerson = null } = {}) {
  const onOpenSheet = vi.fn();
  const onSetShareCount = vi.fn();
  const { container } = render(
    <ItemCard
      item={item}
      people={people}
      assignments={assignments}
      onEdit={vi.fn()}
      onDeleteRequest={vi.fn()}
      onSetShareCount={onSetShareCount}
      onOpenSheet={onOpenSheet}
      selectedPerson={selectedPerson}
    />
  );
  return { onSetShareCount, onOpenSheet, card: container.firstChild };
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

  it('opens the sheet on a card tap, and via Shares ›', () => {
    const { onOpenSheet, card } = renderCard();
    fireEvent.click(card);
    fireEvent.click(screen.getByText('Shares ›'));
    expect(onOpenSheet).toHaveBeenCalledTimes(2);
  });

  describe('with a Person selected', () => {
    const selectedPerson = { ...alice, color: '#F87171' };

    it('toggles that Person on a card tap instead of opening the sheet', () => {
      const { onSetShareCount, onOpenSheet, card } = renderCard({ selectedPerson });
      fireEvent.click(card);
      expect(onSetShareCount).toHaveBeenCalledWith('i1', 'p1', 1);
      expect(onOpenSheet).not.toHaveBeenCalled();
    });

    it('removes the Person when they already hold a Share', () => {
      const { onSetShareCount, card } = renderCard({ selectedPerson, assignments: [holds('p1', 1)] });
      fireEvent.click(card);
      expect(onSetShareCount).toHaveBeenCalledWith('i1', 'p1', 0);
    });

    it('drops the footer and status border, and badges matching cards', () => {
      const { card } = renderCard({ selectedPerson, item: makeItem({ quantity: 3 }), assignments: [holds('p1', 2)] });
      expect(screen.queryByTestId('status-line')).not.toBeInTheDocument();
      expect(screen.queryByText('Shares ›')).not.toBeInTheDocument();
      expect(card.className).not.toContain('border-accent');
      expect(screen.getByTestId('match-badge')).toHaveTextContent('✓ Alice ×2');
    });

    it('fades non-matching cards without a badge', () => {
      const { card } = renderCard({ selectedPerson });
      expect(card.className).toContain('opacity-[0.55]');
      expect(screen.queryByTestId('match-badge')).not.toBeInTheDocument();
    });
  });
});
