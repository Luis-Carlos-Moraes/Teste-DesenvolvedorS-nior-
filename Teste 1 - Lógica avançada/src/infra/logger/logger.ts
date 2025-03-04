import pino, { Logger as PinoLogger } from 'pino';
import { ILogger } from '../../domain/transaction/utils/logger';

export class Logger implements ILogger {
  private logger: PinoLogger;

  constructor(level: string = 'info') {
    this.logger = pino({ level });
  }

  info(message: string, ...args: any[]): void {
    this.logger.info(message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.logger.error(message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.logger.debug(message, ...args);
  }
}