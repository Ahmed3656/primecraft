import { performance } from 'perf_hooks';
import { colors, symbols } from '@/constants';
import { ProgressInfo, LogContext } from '@/types';

class PrimeLogger {
  private currentProgress: Map<string, ProgressInfo> = new Map();
  private logLevel: 'silent' | 'error' | 'warn' | 'info' | 'verbose' = 'info';
  private startTimes: Map<string, number> = new Map();

  constructor(logLevel: 'silent' | 'error' | 'warn' | 'info' | 'verbose' = 'info') {
    this.logLevel = logLevel;
  }

  startOperation(id: string, context: LogContext): void {
    if (!this.shouldLog('info')) return;

    this.startTimes.set(id, performance.now());

    const { operation, bitLength, count, strategy } = context;
    let description = operation;

    if (bitLength) description += ` (${bitLength}-bit)`;
    if (count && count > 1) description += ` × ${count}`;
    if (strategy) description += ` [${strategy}]`;

    console.log(
      `${colors.blue}${symbols.info} ${colors.reset}${colors.bright} ${description}${colors.reset}`
    );
  }

  updateProgress(id: string, progress: ProgressInfo): void {
    if (!this.shouldLog('info')) return;

    this.currentProgress.set(id, progress);

    const { current, total, phase, details } = progress;
    const progressBar = this.formatProgressBar(current, total);

    let line = `   ${phase} ${progressBar}`;
    if (details) {
      line += ` ${colors.dim}${details}${colors.reset}`;
    }

    process.stdout.write('\r\x1b[K');
    process.stdout.write(line);
  }

  success(id: string, completionInfo?: { generated: number; requested: number }): void {
    if (!this.shouldLog('info')) return;

    // Clear progress line
    process.stdout.write('\r\x1b[K');

    const startTime = this.startTimes.get(id);
    const duration = startTime ? performance.now() - startTime : 0;
    const progress = this.currentProgress.get(id);

    let message = `${colors.green}${symbols.success}${colors.reset} ${colors.bright}Generation complete${colors.reset}`;

    if (completionInfo) {
      message += ` ${colors.dim}(${completionInfo.generated}/${completionInfo.requested})${colors.reset}`;
    } else if (progress) {
      message += ` ${colors.dim}(${progress.current}/${progress.total})${colors.reset}`;
    }

    if (duration > 0) {
      message += ` ${colors.gray}${this.formatTime(duration)}${colors.reset}`;
    }

    console.log(message);

    // Cleanup
    this.startTimes.delete(id);
    this.currentProgress.delete(id);
  }

  error(id: string, error: Error, context?: LogContext): void {
    if (!this.shouldLog('error')) return;

    // Clear progress line
    process.stdout.write('\r\x1b[K');

    const startTime = this.startTimes.get(id);
    const duration = startTime ? performance.now() - startTime : 0;

    console.log(
      `${colors.red}${symbols.error}${colors.reset} ${colors.bright}Generation failed${colors.reset}`
    );

    console.log(`  ${colors.red}Error:${colors.reset} ${error.message}`);

    if (context) {
      const details = [];
      if (context.bitLength) details.push(`Bit length: ${context.bitLength}`);
      if (context.count) details.push(`Count: ${context.count}`);
      if (context.strategy) details.push(`Strategy: ${context.strategy}`);
      if (context.attempts) details.push(`Attempts: ${context.attempts}`);

      if (details.length > 0) {
        console.log(`  ${colors.dim}Context: ${details.join(', ')}${colors.reset}`);
      }
    }

    if (duration > 0) {
      console.log(`  ${colors.dim}Duration: ${this.formatTime(duration)}${colors.reset}`);
    }

    if (this.shouldLog('verbose') && error.stack) {
      console.log(`  ${colors.dim}Stack trace:${colors.reset}`);
      const stackLines = error.stack.split('\n').slice(1, 4);
      stackLines.forEach((line) => {
        console.log(`    ${colors.gray}${line.trim()}${colors.reset}`);
      });
    }

    // Cleanup
    this.startTimes.delete(id);
    this.currentProgress.delete(id);
  }

  warn(message: string, context?: Partial<LogContext>): void {
    if (!this.shouldLog('warn')) return;

    console.log(
      `${colors.yellow}${symbols.warning}${colors.reset} ${colors.bright}${message}${colors.reset}`
    );

    if (context) {
      const details = [];
      if (context.bitLength) details.push(`${context.bitLength}-bit`);
      if (context.count) details.push(`count: ${context.count}`);
      if (context.strategy) details.push(`strategy: ${context.strategy}`);

      if (details.length > 0) {
        console.log(`  ${colors.dim}${details.join(', ')}${colors.reset}`);
      }
    }
  }

  info(message: string, details?: string): void {
    if (!this.shouldLog('info')) return;

    console.log(`${colors.blue}${symbols.info}${colors.reset} ${message}`);
    if (details) {
      console.log(`  ${colors.dim}${details}${colors.reset}`);
    }
  }

  verbose(message: string, data?: any): void {
    if (!this.shouldLog('verbose')) return;

    console.log(
      `${colors.gray}${symbols.info}${colors.reset} ${colors.dim}${message}${colors.reset}`
    );
    if (data) {
      console.log(`  ${colors.gray}${JSON.stringify(data, null, 2)}${colors.reset}`);
    }
  }

  logAttempt(attempts: number, maxAttempts: number, phase: string): void {
    if (!this.shouldLog('verbose')) return;

    const percentage = ((attempts / maxAttempts) * 100).toFixed(1);
    console.log(
      `  ${colors.dim}${phase}: ${attempts}/${maxAttempts} attempts (${percentage}%)${colors.reset}`
    );
  }

  logCandidate(candidate: bigint, bitLength: number, passed: boolean): void {
    if (!this.shouldLog('verbose')) return;

    const symbol = passed ? colors.green + symbols.success : colors.red + symbols.error;
    const candidateStr = candidate.toString(16).substring(0, 16) + '...';

    console.log(
      `  ${symbol}${colors.reset} ${colors.dim}${candidateStr} (${bitLength}-bit)${colors.reset}`
    );
  }

  summary(results: {
    generated: number;
    requested: number;
    totalTime: number;
    strategy?: string;
  }): void {
    if (!this.shouldLog('info')) return;

    const { generated, requested, totalTime, strategy } = results;

    console.log();
    console.log(`${colors.bright}Summary:${colors.reset}`);
    console.log(`  Generated: ${colors.green}${generated}${colors.reset}/${requested} primes`);
    if (totalTime <= 0) console.log(`  Time: 0ms`);
    else console.log(`  Time: ${this.formatTime(totalTime)}`);

    if (strategy) {
      console.log(`  Strategy: ${colors.magenta}${strategy}${colors.reset}`);
    }

    if (generated > 0) {
      if (totalTime <= 0) console.log(`  Rate: N/A`);
      else {
        const rate = (generated / (totalTime / 1000)).toFixed(2);
        console.log(`  Rate: ${rate} primes/second`);
      }
    }
  }

  private shouldLog(level: 'error' | 'warn' | 'info' | 'verbose'): boolean {
    const levels = ['silent', 'error', 'warn', 'info', 'verbose'];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  private formatTime(ms: number): string {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }

  private formatProgressBar(current: number, total: number, width: number = 20): string {
    const percentage = Math.min(current / total, 1);
    const filled = Math.floor(percentage * width);
    const empty = width - filled;

    const completedBar = '█'.repeat(filled);
    const remainingBar = '█'.repeat(empty);

    const bar = `${colors.green}${completedBar}${colors.reset}${colors.gray}${remainingBar}${colors.reset}`;
    const percent = `${(percentage * 100).toFixed(0)}%`.padStart(4);

    return `${bar} ${colors.dim}${percent}${colors.reset}`;
  }
}

export const logger = new PrimeLogger();

export function createLogger(
  logLevel: 'silent' | 'error' | 'warn' | 'info' | 'verbose' = 'info'
): PrimeLogger {
  return new PrimeLogger(logLevel);
}
