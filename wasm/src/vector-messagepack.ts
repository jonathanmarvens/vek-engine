/**
 ***********************************************************************
 * Copyright 2022-present Jonathan Barronville                         *
 *                                                                     *
 * This Source Code Form is subject to the terms of the Mozilla Public *
 * License, v. 2.0. If a copy of the MPL was not distributed with this *
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.           *
 ***********************************************************************
 */

import {Ptr} from './ptr'
import {ptrSetValue} from './ptr'
import {Vector} from './vector'
import {vectorCreate} from './vector'
import {vectorInstanceSetValue} from './vector'

export function vectorMessagepackDeserialize(
  buffer: ArrayBuffer,
  vectorPtr: Ptr<usize>,
): void {
  if (buffer.byteLength < 1) {
    throw new Error(
      'Could not deserialize the buffer as an instance of `Vector`',
    )
  }

  const dataView = new DataView(buffer)

  let nextBufferIndex: i32 = 0

  let length: i32 = 0

  {
    const headerByte: u8 = dataView.getUint8(nextBufferIndex)

    nextBufferIndex++

    if (headerByte >>> 4 === 0b00001001) {
      length = i32(headerByte & 0b00001111)
    } else if (headerByte === 0xdc) {
      if (buffer.byteLength < 1 + 2) {
        throw new Error(
          'Could not deserialize the buffer as an instance of `Vector`',
        )
      }

      length = i32(dataView.getUint16(nextBufferIndex, false))

      nextBufferIndex += 2
    } else if (headerByte === 0xdd) {
      if (buffer.byteLength < 1 + 4) {
        throw new Error(
          'Could not deserialize the buffer as an instance of `Vector`',
        )
      }

      const lengthU32: u32 = dataView.getUint32(nextBufferIndex, false)

      nextBufferIndex += 4

      if (lengthU32 > u32(i32.MAX_VALUE)) {
        throw new Error(
          'Could not deserialize the buffer as an instance of `Vector`',
        )
      }

      length = i32(lengthU32)
    } else {
      throw new Error(
        'Could not deserialize the buffer as an instance of `Vector`',
      )
    }
  }

  if (length === 0) {
    throw new Error(
      'Could not deserialize the buffer as an instance of `Vector`',
    )
  }

  if (buffer.byteLength < nextBufferIndex + 1) {
    throw new Error(
      'Could not deserialize the buffer as an instance of `Vector`',
    )
  }

  let elementByteSize: u8 = 0

  {
    const headerByte: u8 = dataView.getUint8(nextBufferIndex)

    nextBufferIndex++

    if (headerByte === 0xcb) {
      elementByteSize = 8
    } else if (headerByte === 0xca) {
      elementByteSize = 4
    } else {
      throw new Error(
        'Could not deserialize the buffer as an instance of `Vector`',
      )
    }
  }

  if (
    buffer.byteLength <
    nextBufferIndex +
      i32(elementByteSize) +
      (length - 1) * (1 + i32(elementByteSize))
  ) {
    throw new Error(
      'Could not deserialize the buffer as an instance of `Vector`',
    )
  }

  const dimensions = u32(length)

  const vector: Vector = vectorCreate(dimensions, elementByteSize)

  {
    let value: f64 = 0.0

    if (elementByteSize === 8) {
      value = dataView.getFloat64(nextBufferIndex, false)
    } else {
      value = f64(dataView.getFloat32(nextBufferIndex, false))
    }

    nextBufferIndex += i32(elementByteSize)

    vectorInstanceSetValue(vector, 0, value)
  }

  if (elementByteSize === 8) {
    for (let i: u32 = 1, j: u32 = length; i < j; i++) {
      const index = i

      const headerByte: u8 = dataView.getUint8(nextBufferIndex)

      nextBufferIndex++

      if (headerByte !== 0xcb) {
        throw new Error(
          'Could not deserialize the buffer as an instance of `Vector`',
        )
      }

      const value: f64 = dataView.getFloat64(nextBufferIndex, false)

      nextBufferIndex += i32(elementByteSize)

      vectorInstanceSetValue(vector, index, value)
    }
  } else {
    for (let i: u32 = 1, j: u32 = length; i < j; i++) {
      const index = i

      const headerByte: u8 = dataView.getUint8(nextBufferIndex)

      nextBufferIndex++

      if (headerByte !== 0xca) {
        throw new Error(
          'Could not deserialize the buffer as an instance of `Vector`',
        )
      }

      const value: f32 = dataView.getFloat32(nextBufferIndex, false)

      nextBufferIndex += i32(elementByteSize)

      vectorInstanceSetValue(vector, index, f64(value))
    }
  }

  ptrSetValue<usize>(vectorPtr, 0, changetype<usize>(vector))
}

export function vectorMessagepackSerialize(
  vector: Vector,
  bufferPtr: Ptr<usize>,
): void {
  let buffer: ArrayBuffer | null = null

  let dataView: DataView | null = null

  let bufferIndex: i32 = 0

  if (vector.dimensions <= 15) {
    buffer = new ArrayBuffer(
      i32(
        1 /* header byte (0b1001XXXX) */ +
          vector.dimensions *
            (1 /* header byte (0xCA OR 0xCB) */ + vector.elementByteSize),
      ),
    )

    dataView = new DataView(buffer)

    const length = u8(vector.dimensions)

    const headerByte: u8 = (u8(0b00001001) << 4) | length

    dataView.setUint8(bufferIndex, headerByte)

    bufferIndex++
  } else if (vector.dimensions <= u32(u16.MAX_VALUE)) {
    buffer = new ArrayBuffer(
      i32(
        3 /* header byte (0xDC) + 0bYYYYYYYY 0bYYYYYYYY */ +
          vector.dimensions *
            (1 /* header byte (0xCA OR 0xCB) */ + vector.elementByteSize),
      ),
    )

    dataView = new DataView(buffer)

    const headerByte: u8 = 0xdc

    dataView.setUint8(bufferIndex, headerByte)

    bufferIndex++

    const length = u16(vector.dimensions)

    dataView.setUint16(bufferIndex, length, false)

    bufferIndex += 2
  } else if (
    vector.dimensions * vector.elementByteSize <=
    u32(i32.MAX_VALUE) - 5
  ) {
    buffer = new ArrayBuffer(
      i32(
        5 /* header byte (0xDD) + 0bZZZZZZZZ 0bZZZZZZZZ 0bZZZZZZZZ 0bZZZZZZZZ */ +
          vector.dimensions *
            (1 /* header byte (0xCA OR 0xCB) */ + vector.elementByteSize),
      ),
    )

    dataView = new DataView(buffer)

    const headerByte: u8 = 0xdd

    dataView.setUint8(bufferIndex, headerByte)

    bufferIndex++

    const length: u32 = vector.dimensions

    dataView.setUint32(bufferIndex, length, false)

    bufferIndex += 4
  } else {
    throw new Error('Could not serialize the instance of `Vector` as a buffer')
  }

  if (vector.is64Bit) {
    const headerByte: u8 = 0xcb

    for (let i: u32 = 0, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f64 = vector.dataView.getFloat64(i32(index * 8), true)

      dataView.setUint8(bufferIndex, headerByte)

      bufferIndex++

      dataView.setFloat64(bufferIndex, value, false)

      bufferIndex += i32(vector.elementByteSize)
    }
  } else {
    const headerByte: u8 = 0xca

    for (let i: u32 = 0, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f32 = vector.dataView.getFloat32(i32(index * 4), true)

      dataView.setUint8(bufferIndex, headerByte)

      bufferIndex++

      dataView.setFloat32(bufferIndex, value, false)

      bufferIndex += i32(vector.elementByteSize)
    }
  }

  ptrSetValue<usize>(bufferPtr, 0, changetype<usize>(buffer))
}
