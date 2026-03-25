
export type AggregationType = 'SUM' | 'MAX' | 'MEAN';

export interface GNNNode {
  id: string;
  currentRisk: number;
}

export interface GNNEdge {
  source: string;
  target: string;
  multiplier: number;
}

export interface GNNMessage {
  source: string;
  target: string;
  value: number;
}

/**
 * GENERATE Phase: Calculate message values for each edge.
 * Formula: msg = source_risk * edge_multiplier * weight
 */
export function generateMessages(
  nodes: GNNNode[],
  edges: GNNEdge[],
  weight: number
): GNNMessage[] {
  return edges.map(edge => {
    const srcNode = nodes.find(n => n.id === edge.source);
    const val = (srcNode ? srcNode.currentRisk : 0) * edge.multiplier * weight;
    return {
      source: edge.source,
      target: edge.target,
      value: val
    };
  });
}

/**
 * AGGREGATE Phase: Combine messages for each node.
 */
export function aggregateMessages(
  nodeId: string,
  messages: GNNMessage[],
  type: AggregationType
): number {
  const incoming = messages.filter(m => m.target === nodeId).map(m => m.value);
  if (incoming.length === 0) return 0;

  switch (type) {
    case 'SUM':
      return incoming.reduce((a, b) => a + b, 0);
    case 'MAX':
      return Math.max(...incoming);
    case 'MEAN':
      return incoming.reduce((a, b) => a + b, 0) / incoming.length;
    default:
      return 0;
  }
}

/**
 * UPDATE Phase: Apply aggregated risk to current risk.
 * Clips at 10.0.
 */
export function updateRisk(currentRisk: number, aggregatedMsg: number): number {
  return Math.min(10, currentRisk + aggregatedMsg);
}
