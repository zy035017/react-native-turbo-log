/*
 * Copyright (c) 2024 Mattermost, Inc. All rights reserved.
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import { TurboModule } from '@rnoh/react-native-openharmony/ts';
import { TurboLog } from './TurboLog';
import type { LogLevel } from './types';
import log from './Logger';
import { TM } from "./generated/ts"
import hilog from '@ohos.hilog';
/**
 * Configuration options interface from JavaScript side
 */
interface JSConfigureOptions {
  dailyRolling: boolean;
  maximumFileSize: number;
  maximumNumberOfFiles: number;
  logsDirectory: string;
}

/**
 * TurboLogModule - React Native TurboModule for HarmonyOS
 * Provides file logging capabilities with configurable rolling policy
 */
export class TurboLogModule extends TurboModule implements TM.RNTurboLog.Spec  {
  /**
   * Configure the TurboLog module
   * @param options Configuration options from JavaScript
   */
  async configure(options: JSConfigureOptions): Promise<void> {
    log.info('Configuring TurboLog module');
    // Get the application context for logs directory
    let logsDirectory = options.logsDirectory;

    // If no logs directory specified, use the app's cache directory
    if (!logsDirectory || logsDirectory === '') {
      try {
        const context = this.ctx.uiAbilityContext;
        logsDirectory = context.cacheDir;
      } catch (err) {
        log.error(`Failed to get cache directory: ${JSON.stringify(err)}`);
        logsDirectory = '/data/storage/el2/base/cache';
      }
    }
    // Configure TurboLog
    TurboLog.configure({
      dailyRolling: options.dailyRolling,
      maximumFileSize: options.maximumFileSize,
      maximumNumberOfFiles: options.maximumNumberOfFiles,
      logsDirectory: logsDirectory,
      logPrefix: 'turbo-log',
    });
  }

  /**
   * Delete all log files
   * @returns true if successful
   */
  async deleteLogFiles(): Promise<boolean> {
    log.info('Deleting all log files');
    return TurboLog.deleteLogFiles();
  }

  /**
   * Get all log file paths
   * @returns Array of log file paths
   */
  async getLogFilePaths(): Promise<string[]> {
    log.info('Getting log file paths');
    return TurboLog.getLogFiles();
  }

  /**
   * Write a log message
   * @param logLevel Log level (0=Debug, 1=Info, 2=Warning, 3=Error)
   * @param message Array of message parts to log
   */
  write(logLevel: number, message: Array<Object>): void {
    const formattedMessage = this.formatMessage(message);
    TurboLog.write(logLevel as LogLevel, formattedMessage);
  }

  /**
   * Format message array into a single string
   * Handles various types including objects, arrays, and primitives
   */
  private formatMessage(messages: Array<Object>): string {
    const parts: string[] = [];

    for (const item of messages) {
      if (item === null) {
        parts.push('null');
      } else if (item === undefined) {
        parts.push('undefined');
      } else if (typeof item === 'object') {
        try {
          parts.push(JSON.stringify(item, null, 2));
        } catch (err) {
          parts.push('[Object]');
        }
      } else {
        parts.push(String(item));
      }
    }

    return parts.join(' ');
  }
}
