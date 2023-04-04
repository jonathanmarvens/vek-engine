/**
 ***********************************************************************
 * Copyright 2022-present Jonathan Barronville                         *
 *                                                                     *
 * This Source Code Form is subject to the terms of the Mozilla Public *
 * License, v. 2.0. If a copy of the MPL was not distributed with this *
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.           *
 ***********************************************************************
 */

import {Vector} from './vector'
import {vectorInstanceGetValue} from './vector'

@final
export class VectorIterator {
  index: u32

  isDone: bool

  vector: Vector

  constructor(vector: Vector) {
    this.index = 0

    this.isDone = false

    this.vector = vector
  }
}

@final
class VectorIteratorNext {
  isDone: bool = false

  value: f64 = 0.0
}

export function vectorIteratorCreate(vector: Vector): VectorIterator {
  return new VectorIterator(vector)
}

export function vectorIteratorInstanceNext(
  iterator: VectorIterator,
): VectorIteratorNext {
  const vector: Vector = iterator.vector

  const index: u32 = iterator.index

  const value: f64 = vectorInstanceGetValue(vector, index)

  if (index < vector.maxIndex) {
    iterator.index++
  } else {
    iterator.isDone = true
  }

  const next = new VectorIteratorNext()

  next.isDone = iterator.isDone

  next.value = value

  return next
}
