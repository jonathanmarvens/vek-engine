/**
 ***********************************************************************
 * Copyright 2022-present Jonathan Barronville                         *
 *                                                                     *
 * This Source Code Form is subject to the terms of the Mozilla Public *
 * License, v. 2.0. If a copy of the MPL was not distributed with this *
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.           *
 ***********************************************************************
 */

import {createClassFactory} from './vector.mjs'
import {isEnvBrowser} from './utilities.mjs'
import {v} from './vector.mjs'
import {Vector} from './vector.mjs'
import type {VectorModalityT} from './vector.mjs'
import {VectorModalityType} from './vector.mjs'
import type {VectorOptionsT} from './vector.mjs'
import {VectorPrecision} from './vector.mjs'

declare global {
  interface Vek {
    createClassFactory?: typeof createClassFactory
    v?: typeof v
    Vector?: typeof Vector
    VectorModalityType?: typeof VectorModalityType
    VectorPrecision?: typeof VectorPrecision
  }

  interface Window {
    vek?: Vek
  }
}

void (() => {
  if (isEnvBrowser) {
    window.vek = Object.assign({}, window.vek)

    window.vek.createClassFactory = createClassFactory

    window.vek.v = v

    window.vek.Vector = Vector

    window.vek.VectorModalityType = VectorModalityType

    window.vek.VectorPrecision = VectorPrecision
  }
})()

export {
  Vector as default,
  createClassFactory,
  v,
  Vector,
  type VectorModalityT,
  VectorModalityType,
  type VectorOptionsT,
  VectorPrecision,
}
