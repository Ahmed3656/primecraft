export type LogContext = {
  operation: string;
  bitLength?: number;
  count?: number;
  strategy?: string;
  attempts?: number;
  startTime?: number;
};

export type ProgressInfo = {
  current: number;
  total: number;
  phase: string;
  details?: string;
};

// TODO: add spinner to primeLogger
export type SpinnerState = {
  interval: ReturnType<typeof setTimeout>;
  progress: ProgressInfo;
};
