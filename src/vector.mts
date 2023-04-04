/**
 ***********************************************************************
 * Copyright 2022-present Jonathan Barronville                         *
 *                                                                     *
 * This Source Code Form is subject to the terms of the Mozilla Public *
 * License, v. 2.0. If a copy of the MPL was not distributed with this *
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.           *
 ***********************************************************************
 */

import {createClass} from './vector-factory.mjs'
import type {VectorModalityT} from './vector-factory.mjs'
import {VectorModalityType} from './vector-factory.mjs'
import type {VectorOptionsT} from './vector-factory.mjs'
import {VectorPrecision} from './vector-factory.mjs'

const {v, Vector} = await (async () => {
  const wasmMemory = new WebAssembly.Memory({
    initial: 1,
    maximum: 65536,
    shared: true,
  })

  return createClass({wasm: {memory: wasmMemory}})
})()

export {
  Vector as default,
  createClass as createClassFactory,
  v,
  Vector,
  type VectorModalityT,
  VectorModalityType,
  type VectorOptionsT,
  VectorPrecision,
}
