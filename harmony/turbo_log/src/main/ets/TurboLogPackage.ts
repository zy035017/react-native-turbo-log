/*
 * Copyright (c) 2024 Mattermost, Inc. All rights reserved.
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import { RNPackage, TurboModulesFactory } from '@rnoh/react-native-openharmony/ts';
import type { TurboModule, TurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { TurboLogModule } from './TurboLogModule';

/**
 * TurboModulesFactory implementation for TurboLog
 */
class TurboLogModulesFactory extends TurboModulesFactory {
  createTurboModule(name: string): TurboModule | null {
    if (name === 'RNTurboLog') {
      return new TurboLogModule(this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return name === 'RNTurboLog';
  }
}

/**
 * TurboLogPackage - React Native Package for TurboLog
 * Register this package in your application to enable TurboLog functionality
 */
export class TurboLogPackage extends RNPackage {
  createTurboModulesFactory(ctx: TurboModuleContext): TurboModulesFactory {
    return new TurboLogModulesFactory(ctx);
  }
}
