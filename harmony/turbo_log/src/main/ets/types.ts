/*
 * Copyright (c) 2024 Mattermost, Inc. All rights reserved.
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

/**
 * Log levels enum - matches the JavaScript side
 */
export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warning = 2,
  Error = 3,
}

/**
 * Configuration options for TurboLog
 */
export interface ConfigureOptions {
  /** Enable daily log file rotation */
  dailyRolling?: boolean;
  /** Custom directory path for log files */
  logsDirectory?: string;
  /** Maximum size of a single log file in bytes (default: 1MB) */
  maximumFileSize?: number;
  /** Maximum number of log files to keep (default: 5) */
  maximumNumberOfFiles?: number;
  /** Prefix for log file names */
  logPrefix?: string;
}

/**
 * Internal configuration with defaults applied
 */
export interface InternalConfig {
  dailyRolling: boolean;
  logsDirectory: string;
  maximumFileSize: number;
  maximumNumberOfFiles: number;
  logPrefix: string;
}
