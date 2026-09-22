import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ItemCard from './ItemCard';

const alice = { id: 'p1', name: 'Alice' };
const bob = { id: 'p2', name: 'Bob' };

function makeItem(overrides) {
  return { id: 'i1', name: 'Pizza', price: '10.00', quantity: 1, customModifiers: [], ...overrides };
}

describe('ItemCard', () => {
  it('assigning an unassigned person adds a share and calls onAssignmentSave', async () => {
    const onAssignmentSave = vi.fn().mockResolvedValue();
    render(
      <ItemCard
        item={makeItem({ quantity: 1 })}
        people={[alice]}
        assignments={[]}
        onEdit={vi.fn()}
        onDeleteRequest={vi.fn()}
        onAssignmentSave={onAssignmentSave}
      />
    );

    fireEvent.click(screen.getByTitle('Alice'));

    expect(onAssignmentSave).toHaveBeenCalledTimes(1);
    const [itemId, shareMap] = onAssignmentSave.mock.calls[0];
    expect(itemId).toBe('i1');
    expect(shareMap.get('p1')).toBe(1);
  });

  it('clicking a person already at max shares removes their assignment (toggle-off)', async () => {
    const onAssignmentSave = vi.fn().mockResolvedValue();
    render(
      <ItemCard
        item={makeItem({ quantity: 1 })}
        people={[alice]}
        assignments={[{ id: 'a1', item_id: 'i1', person_id: 'p1', share_count: 1 }]}
        onEdit={vi.fn()}
        onDeleteRequest={vi.fn()}
        onAssignmentSave={onAssignmentSave}
      />
    );

    fireEvent.click(screen.getByTitle('Alice'));

    expect(onAssignmentSave).toHaveBeenCalledTimes(1);
    const [, shareMap] = onAssignmentSave.mock.calls[0];
    expect(shareMap.has('p1')).toBe(false);
  });

  it('caps share_count at item.quantity when another person already holds all shares', () => {
    const onAssignmentSave = vi.fn().mockResolvedValue();
    render(
      <ItemCard
        item={makeItem({ quantity: 2 })}
        people={[alice, bob]}
        assignments={[{ id: 'a1', item_id: 'i1', person_id: 'p1', share_count: 2 }]}
        onEdit={vi.fn()}
        onDeleteRequest={vi.fn()}
        onAssignmentSave={onAssignmentSave}
      />
    );

    fireEvent.click(screen.getByTitle('Bob'));

    expect(onAssignmentSave).not.toHaveBeenCalled();
  });

  it('renders the fully-assigned (accent) state once all shares are claimed', () => {
    const { container } = render(
      <ItemCard
        item={makeItem({ quantity: 2 })}
        people={[alice, bob]}
        assignments={[
          { id: 'a1', item_id: 'i1', person_id: 'p1', share_count: 1 },
          { id: 'a2', item_id: 'i1', person_id: 'p2', share_count: 1 },
        ]}
        onEdit={vi.fn()}
        onDeleteRequest={vi.fn()}
        onAssignmentSave={vi.fn()}
      />
    );

    expect(container.firstChild).toHaveClass('border-accent');
  });
});
