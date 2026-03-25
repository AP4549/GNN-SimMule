import { describe, it, expect } from 'vitest';
import { generateMessages, aggregateMessages, updateRisk } from '../lib/gnnEngine';

describe('GNN Engine logic', () => {
  it('correctly generates message values: currentRisk * multiplier * weight', () => {
    const nodes = [{ id: 'A', currentRisk: 5.0 }, { id: 'B', currentRisk: 1.0 }];
    const edges = [{ source: 'A', target: 'B', multiplier: 2.0 }];
    const weight = 0.5;

    const msgs = generateMessages(nodes, edges, weight);
    // 5.0 * 2.0* 0.5 = 5.0
    expect(msgs[0].value).toBe(5.0);
    expect(msgs[0].source).toBe('A');
    expect(msgs[0].target).toBe('B');
  });

  it('correctly aggregates messages (SUM)', () => {
    const msgs = [
      { source: 'A', target: 'C', value: 2.0 },
      { source: 'B', target: 'C', value: 3.5 }
    ];
    const sum = aggregateMessages('C', msgs, 'SUM');
    expect(sum).toBe(5.5);
  });

  it('correctly aggregates messages (MAX)', () => {
    const msgs = [
      { source: 'A', target: 'C', value: 2.0 },
      { source: 'B', target: 'C', value: 3.5 }
    ];
    const max = aggregateMessages('C', msgs, 'MAX');
    expect(max).toBe(3.5);
  });

  it('correctly aggregates messages (MEAN)', () => {
    const msgs = [
      { source: 'A', target: 'C', value: 2.0 },
      { source: 'B', target: 'C', value: 4.0 }
    ];
    const mean = aggregateMessages('C', msgs, 'MEAN');
    expect(mean).toBe(3.0);
  });

  it('correctly updates risk and caps it at 10.0', () => {
    expect(updateRisk(8.0, 1.0)).toBe(9.0);
    expect(updateRisk(9.5, 1.5)).toBe(10.0);
    expect(updateRisk(5.0, 6.0)).toBe(10.0);
  });
});
