/*
 * Copyright (c) 2024 Mattermost, Inc. All rights reserved.
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import hilog from '@ohos.hilog';

/**
 * Logger utility class for TurboLog module
 * Uses HarmonyOS hilog for debug output
 */
class Logger {
  private domain: number;
  private prefix: string;
  private format: string = '%{public}s';
  private isDebug: boolean;

  /**
   * Constructor
   * @param prefix Log tag identifier
   * @param domain Service domain, hexadecimal integer from 0x0 to 0xFFFFF
   * @param isDebug Enable debug mode
   */
  constructor(prefix: string = 'TurboLog', domain: number = 0xFF00, isDebug: boolean = false) {
    this.prefix = prefix;
    this.domain = domain;
    this.isDebug = isDebug;
  }

  debug(...args: string[]): void {
    if (this.isDebug) {
      hilog.debug(this.domain, this.prefix, this.format, args.join(' '));
    }
  }

  info(...args: string[]): void {
    hilog.info(this.domain, this.prefix, this.format, args.join(' '));
  }

  warn(...args: string[]): void {
    hilog.warn(this.domain, this.prefix, this.format, args.join(' '));
  }

  error(...args: string[]): void {
    hilog.error(this.domain, this.prefix, this.format, args.join(' '));
  }

  setDebug(isDebug: boolean): void {
    this.isDebug = isDebug;
  }
}

export default new Logger('TurboLog', 0xFF00, true);
