
export interface Widget {
  id: string;
  code: string;
  prompt: string;
  expanded?: boolean;
  x: number;
  y: number;
  width?: number;
  height?: number;
  zIndex: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  actor: 'Orchestrator' | 'Architect' | 'Engineer' | 'System';
  message: string;
  data?: any; // For JSON plans or blueprints
}
