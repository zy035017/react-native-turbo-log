/*
 * Copyright (c) 2024 Mattermost, Inc. All rights reserved.
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import fs from '@ohos.file.fs';
import { LogLevel, ConfigureOptions, InternalConfig } from './types';
import  log from './Logger';

/**
 * Format date as yyyy-MM-dd
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format timestamp as yyyy/MM/dd HH:mm:ss.SSS
 */
function formatTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}.${ms}`;
}

/**
 * Get log level string representation
 */
function getLevelString(level: LogLevel): string {
  switch (level) {
    case LogLevel.Debug:
      return 'DEBUG';
    case LogLevel.Info:
      return 'INFO ';
    case LogLevel.Warning:
      return 'WARN ';
    case LogLevel.Error:
      return 'ERROR';
    default:
      return 'INFO ';
  }
}

/**
 * TurboLog - File logger for HarmonyOS
 * Provides configurable rolling policy for log files
 */
export class TurboLog {
  private static config: InternalConfig | null = null;
  private static currentLogFile: string = '';
  private static currentDate: string = '';
  private static currentFileSize: number = 0;
  private static currentFileIndex: number = 0;

  /**
   * Configure the TurboLog with options
   * @param options Configuration options
   */
  static configure(options: ConfigureOptions = {}): void {
    const config: InternalConfig = {
      dailyRolling: options.dailyRolling ?? false,
      logsDirectory: options.logsDirectory ?? '',
      maximumFileSize: options.maximumFileSize ?? (1024 * 1024), // 1MB default
      maximumNumberOfFiles: options.maximumNumberOfFiles ?? 5,
      logPrefix: options.logPrefix ?? 'app',
    };

    TurboLog.config = config;
    TurboLog.currentDate = formatDate(new Date());
    TurboLog.currentFileIndex = 0;
    TurboLog.currentFileSize = 0;

    // Ensure logs directory exists
    TurboLog.ensureLogsDirectory();

    // Initialize current log file
    TurboLog.initCurrentLogFile();

    log.info('TurboLog configured successfully');
  }

  /**
   * Reconfigure TurboLog with existing options
   */
  static reconfigure(): void {
    if (TurboLog.config) {
      TurboLog.configure(TurboLog.config);
    }
  }

  /**
   * Ensure logs directory exists
   */
  private static ensureLogsDirectory(): void {
    if (!TurboLog.config || !TurboLog.config.logsDirectory) {
      return;
    }

    try {
      if (!fs.accessSync(TurboLog.config.logsDirectory)) {
        fs.mkdirSync(TurboLog.config.logsDirectory, true);
      }
    } catch (err) {
      log.error(`Failed to create logs directory: ${JSON.stringify(err)}`);
    }
  }

  /**
   * Initialize the current log file path
   */
  private static initCurrentLogFile(): void {
    if (!TurboLog.config) {
      return;
    }

    const prefix = TurboLog.config.logPrefix;
    const dir = TurboLog.config.logsDirectory;

    // Set current log file path
    TurboLog.currentLogFile = `${dir}/${prefix}-latest.log`;

    // Check if file exists and get its size
    try {
      if (fs.accessSync(TurboLog.currentLogFile)) {
        const stat = fs.statSync(TurboLog.currentLogFile);
        TurboLog.currentFileSize = stat.size;
      } else {
        TurboLog.currentFileSize = 0;
      }
    } catch (err) {
      TurboLog.currentFileSize = 0;
    }

    // Find the highest existing file index
    TurboLog.findCurrentFileIndex();
  }

  /**
   * Find the current file index by scanning existing log files
   */
  private static findCurrentFileIndex(): void {
    if (!TurboLog.config) {
      return;
    }

    const dir = TurboLog.config.logsDirectory;
    const prefix = TurboLog.config.logPrefix;
    let maxIndex = 0;

    try {
      const files = fs.listFileSync(dir);
      for (const file of files) {
        if (file.startsWith(prefix) && file.endsWith('.log') && file !== `${prefix}-latest.log`) {
          // Extract index from filename like "app-1.log" or "app-2024-01-01.1.log"
          const match = file.match(/\.(\d+)\.log$/) || file.match(/-(\d+)\.log$/);
          if (match) {
            const index = parseInt(match[1], 10);
            if (index > maxIndex) {
              maxIndex = index;
            }
          }
        }
      }
    } catch (err) {
      // Directory might not exist yet
    }

    TurboLog.currentFileIndex = maxIndex;
  }

  /**
   * Get all log file paths
   * @returns Array of log file paths
   */
  static getLogFiles(): string[] {
    if (!TurboLog.config) {
      return [];
    }

    const dir = TurboLog.config.logsDirectory;
    const result: string[] = [];

    try {
      if (!fs.accessSync(dir)) {
        return [];
      }

      const files = fs.listFileSync(dir);
      for (const file of files) {
        if (file.endsWith('.log')) {
          result.push(`${dir}/${file}`);
        }
      }
    } catch (err) {
      log.error(`Failed to list log files: ${JSON.stringify(err)}`);
    }
    log.info(JSON.stringify(result),'周勇333')
    return result;
  }

  /**
   * Delete all log files
   * @returns true if successful
   */
  static deleteLogFiles(): boolean {
    const files = TurboLog.getLogFiles();

    try {
      for (const file of files) {
        fs.unlinkSync(file);
      }
      // Reconfigure to create a new log file
      TurboLog.reconfigure();
      return true;
    } catch (err) {
      log.error(`Failed to delete log files: ${JSON.stringify(err)}`);
      return false;
    }
  }

  /**
   * Write a debug log message
   */
  static d(tag: string, message: string): void {
    TurboLog.write(LogLevel.Debug, `${tag}: ${message}`);
    log.debug(tag, message);
  }

  /**
   * Write an info log message
   */
  static i(tag: string, message: string): void {
    TurboLog.write(LogLevel.Info, `${tag}: ${message}`);
    log.info(tag, message);
  }

  /**
   * Write a warning log message
   */
  static w(tag: string, message: string): void {
    TurboLog.write(LogLevel.Warning, `${tag}: ${message}`);
    log.warn(tag, message);
  }

  /**
   * Write an error log message
   */
  static e(tag: string, message: string): void {
    TurboLog.write(LogLevel.Error, `${tag}: ${message}`);
    log.error(tag, message);
  }

  /**
   * Write a log message to file
   * @param level Log level
   * @param message Message to write
   */
  static write(level: LogLevel, message: string): void {
    if (!TurboLog.config) {
      log.warn('TurboLog not configured, message not written to file');
      return;
    }

    // Check if we need to rotate the log file
    TurboLog.checkAndRotate();

    // Format the log entry
    const timestamp = formatTimestamp(new Date());
    const levelStr = getLevelString(level);
    const logEntry = `${timestamp} ${levelStr} ${message}\n`;
    // Write to file
    TurboLog.writeToFile(logEntry);
  }

  /**
   * Write formatted message to the current log file
   */
  private static writeToFile(content: string): void {
    if (!TurboLog.config || !TurboLog.currentLogFile) {
      return;
    }
    try {
      const file = fs.openSync(TurboLog.currentLogFile, fs.OpenMode.CREATE | fs.OpenMode.READ_WRITE | fs.OpenMode.APPEND);
      const encoder = new util.TextEncoder();
      const buffer = encoder.encodeInto(content);
      fs.writeSync(file.fd, buffer.buffer);
      fs.closeSync(file);
      TurboLog.currentFileSize += content.length;
    } catch (err) {
      log.error(`Failed to write to log file: ${JSON.stringify(err)}`);
    }
  }

  /**
   * Check if log rotation is needed and perform rotation
   */
  private static checkAndRotate(): void {
    if (!TurboLog.config) {
      return;
    }

    const config = TurboLog.config;
    const now = new Date();
    const today = formatDate(now);

    let needsRotation = false;

    // Check for daily rolling
    if (config.dailyRolling && today !== TurboLog.currentDate) {
      TurboLog.currentDate = today;
      needsRotation = true;
    }

    // Check for size-based rolling
    if (config.maximumFileSize > 0 && TurboLog.currentFileSize >= config.maximumFileSize) {
      needsRotation = true;
    }

    if (needsRotation) {
      TurboLog.rotateLogFile();
    }
  }

  /**
   * Rotate the current log file
   */
  private static rotateLogFile(): void {
    if (!TurboLog.config) {
      return;
    }

    const config = TurboLog.config;
    const dir = config.logsDirectory;
    const prefix = config.logPrefix;

    try {
      // Increment file index
      TurboLog.currentFileIndex++;

      // Generate new filename
      let newFileName: string;
      if (config.dailyRolling) {
        newFileName = `${dir}/${prefix}-${TurboLog.currentDate}.${TurboLog.currentFileIndex}.log`;
      } else {
        newFileName = `${dir}/${prefix}-${TurboLog.currentFileIndex}.log`;
      }

      // Rename current log file
      if (fs.accessSync(TurboLog.currentLogFile)) {
        fs.renameSync(TurboLog.currentLogFile, newFileName);
      }

      // Reset current file size
      TurboLog.currentFileSize = 0;

      // Clean up old log files
      TurboLog.cleanupOldLogFiles();
    } catch (err) {
      log.error(`Failed to rotate log file: ${JSON.stringify(err)}`);
    }
  }

  /**
   * Clean up old log files if we exceed the maximum number
   */
  private static cleanupOldLogFiles(): void {
    if (!TurboLog.config) {
      return;
    }

    const config = TurboLog.config;
    const files = TurboLog.getLogFiles();

    // Sort files by modification time (oldest first)
    const fileStats: { path: string; mtime: number }[] = [];

    for (const file of files) {
      if (!file.endsWith('-latest.log')) {
        try {
          const stat = fs.statSync(file);
          fileStats.push({ path: file, mtime: stat.mtime });
        } catch (err) {
          // Skip files that can't be accessed
        }
      }
    }

    fileStats.sort((a, b) => a.mtime - b.mtime);

    // Delete oldest files if we exceed the maximum
    while (fileStats.length >= config.maximumNumberOfFiles) {
      const oldest = fileStats.shift();
      if (oldest) {
        try {
          fs.unlinkSync(oldest.path);
          log.info(`Deleted old log file: ${oldest.path}`);
        } catch (err) {
          log.error(`Failed to delete old log file: ${JSON.stringify(err)}`);
        }
      }
    }
  }

  /**
   * Check if TurboLog is configured
   */
  static isConfigured(): boolean {
    return TurboLog.config !== null;
  }

  /**
   * Get current configuration
   */
  static getConfig(): InternalConfig | null {
    return TurboLog.config;
  }
}

// Import util for TextEncoder
import util from '@ohos.util';
import { JSON } from '@kit.ArkTS';
