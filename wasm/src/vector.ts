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
import {ptrCreate} from './ptr'
import {ptrDestroy} from './ptr'
import {ptrGetValue} from './ptr'
import {vectorMessagepackDeserialize} from './vector-messagepack'
import {vectorMessagepackSerialize} from './vector-messagepack'

@final
export class Vector {
  data: ArrayBuffer

  is64Bit: bool

  get dataView(): DataView {
    return new DataView(this.data)
  }

  get dimensions(): u32 {
    return this.data.byteLength / this.elementByteSize
  }

  get elementByteSize(): u8 {
    return this.is64Bit ? 8 : 4
  }

  get maxIndex(): u32 {
    return this.dimensions > 0 ? this.dimensions - 1 : 0
  }

  constructor(dimensions: u32, elementByteSize: u8) {
    if (
      dimensions < 1 ||
      u64(dimensions * elementByteSize) > u64(i32.MAX_VALUE)
    ) {
      throw new TypeError(
        `\`dimensions\` must be >= \`1\` and \`(dimensions * elementByteSize)\` must <= \`${i32.MAX_VALUE}\``,
      )
    }

    if (elementByteSize !== 4 && elementByteSize !== 8) {
      throw new TypeError('`elementByteSize` must be `4` or `8`')
    }

    const data = new ArrayBuffer(i32(dimensions * elementByteSize))

    this.data = data

    this.is64Bit = elementByteSize === 8 ? true : false
  }
}

export function vectorCreate(dimensions: u32, elementByteSize: u8): Vector {
  return new Vector(dimensions, elementByteSize)
}

export function vectorInstanceArithmeticMean(vector: Vector): f64 {
  let sum: f64 = 0.0

  if (vector.is64Bit) {
    for (let i: u32 = 0, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f64 = vector.dataView.getFloat64(i32(index * 8), true)

      sum += value
    }
  } else {
    for (let i: u32 = 0, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f32 = vector.dataView.getFloat32(i32(index * 4), true)

      sum += f64(value)
    }
  }

  const result: f64 = sum / f64(vector.dimensions)

  return vector.is64Bit ? result : f64(f32(result))
}

export function vectorInstanceFill(vector: Vector, value: f64): void {
  if (vector.is64Bit) {
    for (let i: u32 = 0, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      vector.dataView.setFloat64(i32(index * 8), value, true)
    }
  } else {
    for (let i: u32 = 0, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      vector.dataView.setFloat32(i32(index * 4), f32(value), true)
    }
  }
}

export function vectorInstanceGeometricMean(vector: Vector): f64 {
  let logsSum: f64 = 0.0

  if (vector.is64Bit) {
    for (let i: u32 = 0, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f64 = vector.dataView.getFloat64(i32(index * 8), true)

      if (value <= 0.0) {
        throw new TypeError('Encountered an unexpected zero or negative value')
      }

      logsSum += NativeMath.log(value)
    }
  } else {
    for (let i: u32 = 0, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f32 = vector.dataView.getFloat32(i32(index * 4), true)

      if (value <= 0.0) {
        throw new TypeError('Encountered an unexpected zero or negative value')
      }

      logsSum += f64(NativeMathf.log(value))
    }
  }

  const arithmeticMean: f64 = logsSum / f64(vector.dimensions)

  const result: f64 = NativeMath.exp(arithmeticMean)

  return vector.is64Bit ? result : f64(f32(result))
}

// export function vectorInstanceGetDataPointer(vector: Vector): usize {
//   return changetype<usize>(vector.data)
// }

export function vectorInstanceGetDimensions(vector: Vector): u32 {
  return vector.dimensions
}

export function vectorInstanceGetElementByteSize(vector: Vector): u8 {
  return vector.elementByteSize
}

export function vectorInstanceGetIs64Bit(vector: Vector): bool {
  return vector.is64Bit
}

export function vectorInstanceGetMaxIndex(vector: Vector): u32 {
  return vector.maxIndex
}

export function vectorInstanceGetValue(vector: Vector, index: u32): f64 {
  if (index > vector.maxIndex) {
    throw new TypeError(
      `\`index\` must be >= \`0\` and <= \`${vector.maxIndex}\``,
    )
  }

  if (vector.is64Bit) {
    return vector.dataView.getFloat64(i32(index * 8), true)
  } else {
    return f64(vector.dataView.getFloat32(i32(index * 4), true))
  }
}

export function vectorInstanceIndexOfMax(vector: Vector): u32 {
  if (vector.is64Bit) {
    let max: f64 = vector.dataView.getFloat64(0, true)

    let indexOfMax: u32 = 0

    for (let i: u32 = 1, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f64 = vector.dataView.getFloat64(i32(index * 8), true)

      if (value > max) {
        max = value

        indexOfMax = index
      }
    }

    return indexOfMax
  } else {
    let max: f32 = vector.dataView.getFloat32(0, true)

    let indexOfMax: u32 = 0

    for (let i: u32 = 1, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f32 = vector.dataView.getFloat32(i32(index * 4), true)

      if (value > max) {
        max = value

        indexOfMax = index
      }
    }

    return indexOfMax
  }
}

export function vectorInstanceIndexOfMin(vector: Vector): u32 {
  if (vector.is64Bit) {
    let min: f64 = vector.dataView.getFloat64(0, true)

    let indexOfMin: u32 = 0

    for (let i: u32 = 1, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f64 = vector.dataView.getFloat64(i32(index * 8), true)

      if (value < min) {
        min = value

        indexOfMin = index
      }
    }

    return indexOfMin
  } else {
    let min: f32 = vector.dataView.getFloat32(0, true)

    let indexOfMin: u32 = 0

    for (let i: u32 = 1, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f32 = vector.dataView.getFloat32(i32(index * 4), true)

      if (value < min) {
        min = value

        indexOfMin = index
      }
    }

    return indexOfMin
  }
}

export function vectorInstanceInfinityNorm(vector: Vector): f64 {
  if (vector.is64Bit) {
    let max: f64 = vector.dataView.getFloat64(0, true)

    max = NativeMath.abs(max)

    for (let i: u32 = 1, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f64 = vector.dataView.getFloat64(i32(index * 8), true)

      const absoluteValue: f64 = NativeMath.abs(value)

      if (absoluteValue > max) {
        max = absoluteValue
      }
    }

    return max
  } else {
    let max: f32 = vector.dataView.getFloat32(0, true)

    max = NativeMathf.abs(max)

    for (let i: u32 = 1, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f32 = vector.dataView.getFloat32(i32(index * 4), true)

      const absoluteValue: f32 = NativeMathf.abs(value)

      if (absoluteValue > max) {
        max = absoluteValue
      }
    }

    return f64(max)
  }
}

export function vectorInstanceMax(vector: Vector): f64 {
  if (vector.is64Bit) {
    let max: f64 = vector.dataView.getFloat64(0, true)

    for (let i: u32 = 1, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f64 = vector.dataView.getFloat64(i32(index * 8), true)

      if (value > max) {
        max = value
      }
    }

    return max
  } else {
    let max: f32 = vector.dataView.getFloat32(0, true)

    for (let i: u32 = 1, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f32 = vector.dataView.getFloat32(i32(index * 4), true)

      if (value > max) {
        max = value
      }
    }

    return f64(max)
  }
}

export function vectorInstanceMin(vector: Vector): f64 {
  if (vector.is64Bit) {
    let min: f64 = vector.dataView.getFloat64(0, true)

    for (let i: u32 = 1, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f64 = vector.dataView.getFloat64(i32(index * 8), true)

      if (value < min) {
        min = value
      }
    }

    return min
  } else {
    let min: f32 = vector.dataView.getFloat32(0, true)

    for (let i: u32 = 1, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f32 = vector.dataView.getFloat32(i32(index * 4), true)

      if (value < min) {
        min = value
      }
    }

    return f64(min)
  }
}

export function vectorInstanceMode(vector: Vector): Float64Array {
  if (vector.is64Bit) {
    const occurrences = new Map<f64, u32>()

    const countsValues = new Map<u32, Set<f64>>()

    for (let i: u32 = 0, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f64 = vector.dataView.getFloat64(i32(index * 8), true)

      if (occurrences.has(value)) {
        let count: u32 = occurrences.get(value)

        {
          const values: Set<f64> = countsValues.get(count)

          values.delete(value)

          if (values.size === 0) {
            countsValues.delete(count)
          }
        }

        count++

        occurrences.set(value, count)

        if (countsValues.has(count)) {
          const values: Set<f64> = countsValues.get(count)

          values.add(value)
        } else {
          const values = new Set<f64>()

          values.add(value)

          countsValues.set(count, values)
        }
      } else {
        occurrences.set(value, 1)

        if (countsValues.has(1)) {
          const values: Set<f64> = countsValues.get(1)

          values.add(value)
        } else {
          const values = new Set<f64>()

          values.add(value)

          countsValues.set(1, values)
        }
      }
    }

    const counts: Array<u32> = countsValues
      .keys()
      .sort((a: u32, b: u32): i32 => {
        if (a < b) {
          return -1
        } else if (a > b) {
          return 1
        } else {
          return 0
        }
      })

    const maxCount: u32 = counts.pop()

    if (maxCount === 1) {
      const result = new Float64Array(1)

      const infinity: f64 = Infinity

      unchecked((result[0] = -infinity))

      return result
    }

    const values: Array<f64> = countsValues.get(maxCount).values()

    const result = new Float64Array(values.length)

    for (let i: u32 = 0, j: u32 = u32(result.length); i < j; i++) {
      const index = i

      const value: f64 = unchecked(values[i32(index)])

      unchecked((result[i32(index)] = value))
    }

    return result
  } else {
    const occurrences = new Map<f32, u32>()

    const countsValues = new Map<u32, Set<f32>>()

    for (let i: u32 = 0, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f32 = vector.dataView.getFloat32(i32(index * 4), true)

      if (occurrences.has(value)) {
        let count: u32 = occurrences.get(value)

        {
          const values: Set<f32> = countsValues.get(count)

          values.delete(value)

          if (values.size === 0) {
            countsValues.delete(count)
          }
        }

        count++

        occurrences.set(value, count)

        if (countsValues.has(count)) {
          const values: Set<f32> = countsValues.get(count)

          values.add(value)
        } else {
          const values = new Set<f32>()

          values.add(value)

          countsValues.set(count, values)
        }
      } else {
        occurrences.set(value, 1)

        if (countsValues.has(1)) {
          const values: Set<f32> = countsValues.get(1)

          values.add(value)
        } else {
          const values = new Set<f32>()

          values.add(value)

          countsValues.set(1, values)
        }
      }
    }

    const counts: Array<u32> = countsValues
      .keys()
      .sort((a: u32, b: u32): i32 => {
        if (a < b) {
          return -1
        } else if (a > b) {
          return 1
        } else {
          return 0
        }
      })

    const maxCount: u32 = counts.pop()

    if (maxCount === 1) {
      const result = new Float64Array(1)

      const infinity: f32 = Infinity

      unchecked((result[0] = -f64(infinity)))

      return result
    }

    const values: Array<f32> = countsValues.get(maxCount).values()

    const result = new Float64Array(values.length)

    for (let i: u32 = 0, j: u32 = u32(result.length); i < j; i++) {
      const index = i

      const value: f32 = unchecked(values[i32(index)])

      unchecked((result[i32(index)] = f64(value)))
    }

    return result
  }
}

export function vectorInstanceNeg(vector: Vector, resultVector: Vector): void {
  if (
    vector.is64Bit !== resultVector.is64Bit ||
    vector.dimensions !== resultVector.dimensions
  ) {
    throw new TypeError(
      'Can only operate on instances of `Vector` with the same dimensions and precision',
    )
  }

  if (vector.is64Bit) {
    for (let i: u32 = 0, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f64 = vector.dataView.getFloat64(i32(index * 8), true)

      const result: f64 = value * -1.0

      resultVector.dataView.setFloat64(i32(index * 8), result, true)
    }
  } else {
    for (let i: u32 = 0, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f32 = vector.dataView.getFloat32(i32(index * 4), true)

      const result: f32 = value * -1.0

      resultVector.dataView.setFloat32(i32(index * 4), result, true)
    }
  }
}

export function vectorInstancePNorm(vector: Vector, p: f32): f64 {
  if (p !== 1.0 && p !== 2.0) {
    throw new TypeError('`p` must be `1.00` or `2.00`')
  }

  let sum: f64 = 0.0

  if (vector.is64Bit) {
    for (let i: u32 = 0, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f64 = vector.dataView.getFloat64(i32(index * 8), true)

      sum += NativeMath.abs(value) ** f64(p)
    }
  } else {
    for (let i: u32 = 0, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f32 = vector.dataView.getFloat32(i32(index * 4), true)

      sum += f64(NativeMathf.abs(value)) ** f64(p)
    }
  }

  const result: f64 = sum ** (1.0 / f64(p))

  return vector.is64Bit ? result : f64(f32(result))
}

export function vectorInstanceSetValue(
  vector: Vector,
  index: u32,
  value: f64,
): bool {
  if (index > vector.maxIndex) {
    throw new TypeError(
      `\`index\` must be >= \`0\` and <= \`${vector.maxIndex}\``,
    )
  }

  if (vector.is64Bit) {
    vector.dataView.setFloat64(i32(index * 8), value, true)
  } else {
    vector.dataView.setFloat32(i32(index * 4), f32(value), true)
  }

  return true
}

export function vectorInstanceSum(vector: Vector): f64 {
  let sum: f64 = 0.0

  if (vector.is64Bit) {
    for (let i: u32 = 0, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f64 = vector.dataView.getFloat64(i32(index * 8), true)

      sum += value
    }
  } else {
    for (let i: u32 = 0, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      const value: f32 = vector.dataView.getFloat32(i32(index * 4), true)

      sum += f64(value)
    }
  }

  return vector.is64Bit ? sum : f64(f32(sum))
}

export function vectorInstanceToBuffer(vector: Vector): ArrayBuffer {
  const bufferPtr: Ptr<usize> = ptrCreate<usize>()

  vectorMessagepackSerialize(vector, bufferPtr)

  const buffer: ArrayBuffer = changetype<ArrayBuffer>(
    ptrGetValue<usize>(bufferPtr, 0),
  )

  ptrDestroy<usize>(bufferPtr)

  return buffer
}

export function vectorStaticAdd(
  aVector: Vector,
  bVector: Vector,
  resultVector: Vector,
): void {
  if (
    aVector.is64Bit !== bVector.is64Bit ||
    bVector.is64Bit !== resultVector.is64Bit ||
    aVector.dimensions !== bVector.dimensions ||
    bVector.dimensions !== resultVector.dimensions
  ) {
    throw new TypeError(
      'Can only operate on instances of `Vector` with the same dimensions and precision',
    )
  }

  if (aVector.is64Bit) {
    for (let i: u32 = 0, j: u32 = aVector.maxIndex; i <= j; i++) {
      const index = i

      const aValue: f64 = aVector.dataView.getFloat64(i32(index * 8), true)

      const bValue: f64 = bVector.dataView.getFloat64(i32(index * 8), true)

      const result: f64 = aValue + bValue

      resultVector.dataView.setFloat64(i32(index * 8), result, true)
    }
  } else {
    for (let i: u32 = 0, j: u32 = aVector.maxIndex; i <= j; i++) {
      const index = i

      const aValue: f32 = aVector.dataView.getFloat32(i32(index * 4), true)

      const bValue: f32 = bVector.dataView.getFloat32(i32(index * 4), true)

      const result: f32 = f32(f64(aValue) + f64(bValue))

      resultVector.dataView.setFloat32(i32(index * 4), result, true)
    }
  }
}

export function vectorStaticCmp(aVector: Vector, bVector: Vector): ArrayBuffer {
  if (
    aVector.is64Bit !== bVector.is64Bit ||
    aVector.dimensions !== bVector.dimensions
  ) {
    throw new TypeError(
      'Can only operate on instances of `Vector` with the same dimensions and precision',
    )
  }

  const buffer = new ArrayBuffer(i32(aVector.dimensions * 1 /* 1 byte */))

  const dataView = new DataView(buffer)

  if (aVector.is64Bit) {
    for (let i: u32 = 0, j: u32 = aVector.maxIndex; i <= j; i++) {
      const index = i

      const aValue: f64 = aVector.dataView.getFloat64(i32(index * 8), true)

      const bValue: f64 = bVector.dataView.getFloat64(i32(index * 8), true)

      let result: i8 = 0

      if (aValue < bValue) {
        result = -1
      } else if (aValue > bValue) {
        result = 1
      }

      dataView.setInt8(i32(index), result)
    }
  } else {
    for (let i: u32 = 0, j: u32 = aVector.maxIndex; i <= j; i++) {
      const index = i

      const aValue: f32 = aVector.dataView.getFloat32(i32(index * 4), true)

      const bValue: f32 = bVector.dataView.getFloat32(i32(index * 4), true)

      let result: i8 = 0

      if (aValue < bValue) {
        result = -1
      } else if (aValue > bValue) {
        result = 1
      }

      dataView.setInt8(i32(index), result)
    }
  }

  return buffer
}

export function vectorStaticCosineSimilarity(
  aVector: Vector,
  bVector: Vector,
): f64 {
  if (
    aVector.is64Bit !== bVector.is64Bit ||
    aVector.dimensions !== bVector.dimensions
  ) {
    throw new TypeError(
      'Can only operate on instances of `Vector` with the same dimensions and precision',
    )
  }

  let dotProduct: f64 = 0.0

  let aVectorNorm: f64 = 0.0

  let bVectorNorm: f64 = 0.0

  if (aVector.is64Bit) {
    for (let i: u32 = 0, j: u32 = aVector.maxIndex; i <= j; i++) {
      const index = i

      const aValue: f64 = aVector.dataView.getFloat64(i32(index * 8), true)

      const bValue: f64 = bVector.dataView.getFloat64(i32(index * 8), true)

      dotProduct += aValue * bValue

      aVectorNorm += aValue * aValue

      bVectorNorm += bValue * bValue
    }
  } else {
    for (let i: u32 = 0, j: u32 = aVector.maxIndex; i <= j; i++) {
      const index = i

      const aValue: f32 = aVector.dataView.getFloat32(i32(index * 4), true)

      const bValue: f32 = bVector.dataView.getFloat32(i32(index * 4), true)

      dotProduct += f64(aValue) * f64(bValue)

      aVectorNorm += f64(aValue) * f64(aValue)

      bVectorNorm += f64(bValue) * f64(bValue)
    }
  }

  const result: f64 =
    dotProduct / (NativeMath.sqrt(aVectorNorm) * NativeMath.sqrt(bVectorNorm))

  return aVector.is64Bit ? result : f64(f32(result))
}

export function vectorStaticDiv(
  aVector: Vector,
  bVector: Vector,
  resultVector: Vector,
): void {
  if (
    aVector.is64Bit !== bVector.is64Bit ||
    bVector.is64Bit !== resultVector.is64Bit ||
    aVector.dimensions !== bVector.dimensions ||
    bVector.dimensions !== resultVector.dimensions
  ) {
    throw new TypeError(
      'Can only operate on instances of `Vector` with the same dimensions and precision',
    )
  }

  if (aVector.is64Bit) {
    for (let i: u32 = 0, j: u32 = aVector.maxIndex; i <= j; i++) {
      const index = i

      const aValue: f64 = aVector.dataView.getFloat64(i32(index * 8), true)

      const bValue: f64 = bVector.dataView.getFloat64(i32(index * 8), true)

      const result: f64 = aValue / bValue

      resultVector.dataView.setFloat64(i32(index * 8), result, true)
    }
  } else {
    for (let i: u32 = 0, j: u32 = aVector.maxIndex; i <= j; i++) {
      const index = i

      const aValue: f32 = aVector.dataView.getFloat32(i32(index * 4), true)

      const bValue: f32 = bVector.dataView.getFloat32(i32(index * 4), true)

      const result: f32 = f32(f64(aValue) / f64(bValue))

      resultVector.dataView.setFloat32(i32(index * 4), result, true)
    }
  }
}

export function vectorStaticDot(aVector: Vector, bVector: Vector): f64 {
  if (
    aVector.is64Bit !== bVector.is64Bit ||
    aVector.dimensions !== bVector.dimensions
  ) {
    throw new TypeError(
      'Can only operate on instances of `Vector` with the same dimensions and precision',
    )
  }

  let sum: f64 = 0.0

  if (aVector.is64Bit) {
    for (let i: u32 = 0, j: u32 = aVector.maxIndex; i <= j; i++) {
      const index = i

      const aValue: f64 = aVector.dataView.getFloat64(i32(index * 8), true)

      const bValue: f64 = bVector.dataView.getFloat64(i32(index * 8), true)

      sum += aValue * bValue
    }
  } else {
    for (let i: u32 = 0, j: u32 = aVector.maxIndex; i <= j; i++) {
      const index = i

      const aValue: f32 = aVector.dataView.getFloat32(i32(index * 4), true)

      const bValue: f32 = bVector.dataView.getFloat32(i32(index * 4), true)

      sum += f64(aValue) * f64(bValue)
    }
  }

  return aVector.is64Bit ? sum : f64(f32(sum))
}

export function vectorStaticFromBuffer(buffer: ArrayBuffer): Vector {
  const vectorPtr: Ptr<usize> = ptrCreate<usize>()

  vectorMessagepackDeserialize(buffer, vectorPtr)

  const vector: Vector = changetype<Vector>(ptrGetValue<usize>(vectorPtr, 0))

  ptrDestroy<usize>(vectorPtr)

  return vector
}

export function vectorStaticMod(
  aVector: Vector,
  bVector: Vector,
  resultVector: Vector,
): void {
  if (
    aVector.is64Bit !== bVector.is64Bit ||
    bVector.is64Bit !== resultVector.is64Bit ||
    aVector.dimensions !== bVector.dimensions ||
    bVector.dimensions !== resultVector.dimensions
  ) {
    throw new TypeError(
      'Can only operate on instances of `Vector` with the same dimensions and precision',
    )
  }

  if (aVector.is64Bit) {
    for (let i: u32 = 0, j: u32 = aVector.maxIndex; i <= j; i++) {
      const index = i

      const aValue: f64 = aVector.dataView.getFloat64(i32(index * 8), true)

      const bValue: f64 = bVector.dataView.getFloat64(i32(index * 8), true)

      const result: f64 = aValue % bValue

      resultVector.dataView.setFloat64(i32(index * 8), result, true)
    }
  } else {
    for (let i: u32 = 0, j: u32 = aVector.maxIndex; i <= j; i++) {
      const index = i

      const aValue: f32 = aVector.dataView.getFloat32(i32(index * 4), true)

      const bValue: f32 = bVector.dataView.getFloat32(i32(index * 4), true)

      const result: f32 = f32(f64(aValue) % f64(bValue))

      resultVector.dataView.setFloat32(i32(index * 4), result, true)
    }
  }
}

export function vectorStaticMul(
  aVector: Vector,
  bVector: Vector,
  resultVector: Vector,
): void {
  if (
    aVector.is64Bit !== bVector.is64Bit ||
    bVector.is64Bit !== resultVector.is64Bit ||
    aVector.dimensions !== bVector.dimensions ||
    bVector.dimensions !== resultVector.dimensions
  ) {
    throw new TypeError(
      'Can only operate on instances of `Vector` with the same dimensions and precision',
    )
  }

  if (aVector.is64Bit) {
    for (let i: u32 = 0, j: u32 = aVector.maxIndex; i <= j; i++) {
      const index = i

      const aValue: f64 = aVector.dataView.getFloat64(i32(index * 8), true)

      const bValue: f64 = bVector.dataView.getFloat64(i32(index * 8), true)

      const result: f64 = aValue * bValue

      resultVector.dataView.setFloat64(i32(index * 8), result, true)
    }
  } else {
    for (let i: u32 = 0, j: u32 = aVector.maxIndex; i <= j; i++) {
      const index = i

      const aValue: f32 = aVector.dataView.getFloat32(i32(index * 4), true)

      const bValue: f32 = bVector.dataView.getFloat32(i32(index * 4), true)

      const result: f32 = f32(f64(aValue) * f64(bValue))

      resultVector.dataView.setFloat32(i32(index * 4), result, true)
    }
  }
}

export function vectorStaticOnes(dimensions: u32, elementByteSize: u8): Vector {
  const vector: Vector = vectorCreate(dimensions, elementByteSize)

  if (vector.is64Bit) {
    for (let i: u32 = 0, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      vector.dataView.setFloat64(i32(index * 8), 1.0, true)
    }
  } else {
    for (let i: u32 = 0, j: u32 = vector.maxIndex; i <= j; i++) {
      const index = i

      vector.dataView.setFloat32(i32(index * 4), 1.0, true)
    }
  }

  return vector
}

export function vectorStaticSub(
  aVector: Vector,
  bVector: Vector,
  resultVector: Vector,
): void {
  if (
    aVector.is64Bit !== bVector.is64Bit ||
    bVector.is64Bit !== resultVector.is64Bit ||
    aVector.dimensions !== bVector.dimensions ||
    bVector.dimensions !== resultVector.dimensions
  ) {
    throw new TypeError(
      'Can only operate on instances of `Vector` with the same dimensions and precision',
    )
  }

  if (aVector.is64Bit) {
    for (let i: u32 = 0, j: u32 = aVector.maxIndex; i <= j; i++) {
      const index = i

      const aValue: f64 = aVector.dataView.getFloat64(i32(index * 8), true)

      const bValue: f64 = bVector.dataView.getFloat64(i32(index * 8), true)

      const result: f64 = aValue - bValue

      resultVector.dataView.setFloat64(i32(index * 8), result, true)
    }
  } else {
    for (let i: u32 = 0, j: u32 = aVector.maxIndex; i <= j; i++) {
      const index = i

      const aValue: f32 = aVector.dataView.getFloat32(i32(index * 4), true)

      const bValue: f32 = bVector.dataView.getFloat32(i32(index * 4), true)

      const result: f32 = f32(f64(aValue) - f64(bValue))

      resultVector.dataView.setFloat32(i32(index * 4), result, true)
    }
  }
}
