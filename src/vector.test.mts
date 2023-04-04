/**
 ***********************************************************************
 * Copyright 2022-present Jonathan Barronville                         *
 *                                                                     *
 * This Source Code Form is subject to the terms of the Mozilla Public *
 * License, v. 2.0. If a copy of the MPL was not distributed with this *
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.           *
 ***********************************************************************
 */

import {ok as assertOk} from 'node:assert'
import {decode as decodeMessagepack} from '@msgpack/msgpack'
import {encode as encodeMessagepack} from '@msgpack/msgpack'
import test from 'ava'
import {v} from './index.mjs'
import Vector from './index.mjs'
import type {VectorModalityT} from './index.mjs'
import {VectorModalityType} from './index.mjs'
import {VectorPrecision} from './index.mjs'

const generateRandomNumber = (min: number, max: number, is64Bit?: boolean) => {
  if (typeof is64Bit === 'undefined') {
    is64Bit = true
  }

  const randomNumber = Math.random()

  let result = randomNumber * (max - min) + min

  if (!is64Bit) {
    result = Math.fround(result)
  }

  return result
}

test('`new Vector()` throws an error', (t) => {
  const error = t.throws(
    () => {
      // @ts-expect-error: TS2673
      new Vector(10, VectorPrecision.SINGLE)
    },
    {instanceOf: TypeError},
  )

  t.is(
    error?.message,
    'Can only create instances of `Vector` via `Vector.create()`',
  )
})

test(`\`Vector.create()\` constructs an instance of \`Vector\``, (t) => {
  const vector00 = Vector.create(10)

  t.true(vector00 instanceof Vector)

  const vector01 = Vector.create(10, VectorPrecision.SINGLE)

  t.true(vector01 instanceof Vector)

  const vector02 = Vector.create(10, VectorPrecision.DOUBLE)

  t.true(vector02 instanceof Vector)

  const vector03 = Vector.create([
    0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
  ])

  t.true(vector03 instanceof Vector)

  const vector04 = Vector.create(
    [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    VectorPrecision.SINGLE,
  )

  t.true(vector04 instanceof Vector)

  const vector05 = Vector.create(
    [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    VectorPrecision.DOUBLE,
  )

  t.true(vector05 instanceof Vector)

  const vector06 = (() => {
    const values = encodeMessagepack(
      [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
      {
        forceFloat32: true,
        forceIntegerToFloat: true,
        ignoreUndefined: true,
        initialBufferSize: 512,
        maxDepth: 2,
        sortKeys: true,
      },
    )

    return Vector.create(values)
  })()

  t.true(vector06 instanceof Vector)

  const vector07 = (() => {
    const values = encodeMessagepack(
      [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
      {
        forceFloat32: false,
        forceIntegerToFloat: true,
        ignoreUndefined: true,
        initialBufferSize: 512,
        maxDepth: 2,
        sortKeys: true,
      },
    )

    return Vector.create(values)
  })()

  t.true(vector07 instanceof Vector)

  const vector08 = (() => {
    const values = new Float32Array([
      0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
    ])

    return Vector.create(values)
  })()

  t.true(vector08 instanceof Vector)

  const vector09 = (() => {
    const values = new Float64Array([
      0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
    ])

    return Vector.create(values)
  })()

  t.true(vector09 instanceof Vector)
})

test(`\`v()\` returns a constructed instance of \`Vector\``, (t) => {
  const vector00 = v(10)

  t.true(vector00 instanceof Vector)

  const vector01 = v(10, VectorPrecision.SINGLE)

  t.true(vector01 instanceof Vector)

  const vector02 = v(10, VectorPrecision.DOUBLE)

  t.true(vector02 instanceof Vector)

  const vector03 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  t.true(vector03 instanceof Vector)

  const vector04 = v(
    [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    VectorPrecision.SINGLE,
  )

  t.true(vector04 instanceof Vector)

  const vector05 = v(
    [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    VectorPrecision.DOUBLE,
  )

  t.true(vector05 instanceof Vector)

  const vector06 = (() => {
    const values = encodeMessagepack(
      [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
      {
        forceFloat32: true,
        forceIntegerToFloat: true,
        ignoreUndefined: true,
        initialBufferSize: 512,
        maxDepth: 2,
        sortKeys: true,
      },
    )

    return v(values)
  })()

  t.true(vector06 instanceof Vector)

  const vector07 = (() => {
    const values = encodeMessagepack(
      [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
      {
        forceFloat32: false,
        forceIntegerToFloat: true,
        ignoreUndefined: true,
        initialBufferSize: 512,
        maxDepth: 2,
        sortKeys: true,
      },
    )

    return v(values)
  })()

  t.true(vector07 instanceof Vector)

  const vector08 = (() => {
    const values = new Float32Array([
      0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
    ])

    return v(values)
  })()

  t.true(vector08 instanceof Vector)

  const vector09 = (() => {
    const values = new Float64Array([
      0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
    ])

    return v(values)
  })()

  t.true(vector09 instanceof Vector)
})

test(`\`Vector#dimensions\` returns a vector's dimensions`, (t) => {
  const vector = v(10, VectorPrecision.SINGLE)

  t.is(vector.dimensions, 10)
})

test(`\`Vector#elementByteSize\` returns the size, in bytes, of a vector's elements`, (t) => {
  const vector00 = v(10)

  t.is(vector00.elementByteSize, 8)

  const vector01 = v(10, VectorPrecision.SINGLE)

  t.is(vector01.elementByteSize, 4)

  const vector02 = v(10, VectorPrecision.DOUBLE)

  t.is(vector02.elementByteSize, 8)

  const vector03 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  t.is(vector03.elementByteSize, 8)

  const vector04 = v(
    [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    VectorPrecision.SINGLE,
  )

  t.is(vector04.elementByteSize, 4)

  const vector05 = v(
    [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    VectorPrecision.DOUBLE,
  )

  t.is(vector05.elementByteSize, 8)

  const vector06 = (() => {
    const values = encodeMessagepack(
      [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
      {
        forceFloat32: true,
        forceIntegerToFloat: true,
        ignoreUndefined: true,
        initialBufferSize: 512,
        maxDepth: 2,
        sortKeys: true,
      },
    )

    return v(values)
  })()

  t.is(vector06.elementByteSize, 4)

  const vector07 = (() => {
    const values = encodeMessagepack(
      [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
      {
        forceFloat32: false,
        forceIntegerToFloat: true,
        ignoreUndefined: true,
        initialBufferSize: 512,
        maxDepth: 2,
        sortKeys: true,
      },
    )

    return v(values)
  })()

  t.is(vector07.elementByteSize, 8)

  const vector08 = (() => {
    const values = new Float32Array([
      0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
    ])

    return v(values)
  })()

  t.is(vector08.elementByteSize, 4)

  const vector09 = (() => {
    const values = new Float64Array([
      0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
    ])

    return v(values)
  })()

  t.is(vector09.elementByteSize, 8)
})

test(`\`Vector#is64Bit\` returns a boolean representing whether or not a vector's elements are 64-bit values`, (t) => {
  const vector00 = v(10)

  t.true(vector00.is64Bit)

  const vector01 = v(10, VectorPrecision.SINGLE)

  t.false(vector01.is64Bit)

  const vector02 = v(10, VectorPrecision.DOUBLE)

  t.true(vector02.is64Bit)

  const vector03 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  t.true(vector03.is64Bit)

  const vector04 = v(
    [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    VectorPrecision.SINGLE,
  )

  t.false(vector04.is64Bit)

  const vector05 = v(
    [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    VectorPrecision.DOUBLE,
  )

  t.true(vector05.is64Bit)

  const vector06 = (() => {
    const values = encodeMessagepack(
      [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
      {
        forceFloat32: true,
        forceIntegerToFloat: true,
        ignoreUndefined: true,
        initialBufferSize: 512,
        maxDepth: 2,
        sortKeys: true,
      },
    )

    return v(values)
  })()

  t.false(vector06.is64Bit)

  const vector07 = (() => {
    const values = encodeMessagepack(
      [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
      {
        forceFloat32: false,
        forceIntegerToFloat: true,
        ignoreUndefined: true,
        initialBufferSize: 512,
        maxDepth: 2,
        sortKeys: true,
      },
    )

    return v(values)
  })()

  t.true(vector07.is64Bit)

  const vector08 = (() => {
    const values = new Float32Array([
      0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
    ])

    return v(values)
  })()

  t.false(vector08.is64Bit)

  const vector09 = (() => {
    const values = new Float64Array([
      0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
    ])

    return v(values)
  })()

  t.true(vector09.is64Bit)
})

test(`\`Vector#maxIndex\` returns a vector's max index`, (t) => {
  const vector = v(10, VectorPrecision.SINGLE)

  t.is(vector.maxIndex, 9)
})

test(`\`Vector#precision\` returns the precision of a vector's elements`, (t) => {
  const vector00 = v(10)

  t.is(vector00.precision, VectorPrecision.DOUBLE)

  const vector01 = v(10, VectorPrecision.SINGLE)

  t.is(vector01.precision, VectorPrecision.SINGLE)

  const vector02 = v(10, VectorPrecision.DOUBLE)

  t.is(vector02.precision, VectorPrecision.DOUBLE)

  const vector03 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  t.is(vector03.precision, VectorPrecision.DOUBLE)

  const vector04 = v(
    [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    VectorPrecision.SINGLE,
  )

  t.is(vector04.precision, VectorPrecision.SINGLE)

  const vector05 = v(
    [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    VectorPrecision.DOUBLE,
  )

  t.is(vector05.precision, VectorPrecision.DOUBLE)

  const vector06 = (() => {
    const values = encodeMessagepack(
      [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
      {
        forceFloat32: true,
        forceIntegerToFloat: true,
        ignoreUndefined: true,
        initialBufferSize: 512,
        maxDepth: 2,
        sortKeys: true,
      },
    )

    return v(values)
  })()

  t.is(vector06.precision, VectorPrecision.SINGLE)

  const vector07 = (() => {
    const values = encodeMessagepack(
      [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
      {
        forceFloat32: false,
        forceIntegerToFloat: true,
        ignoreUndefined: true,
        initialBufferSize: 512,
        maxDepth: 2,
        sortKeys: true,
      },
    )

    return v(values)
  })()

  t.is(vector07.precision, VectorPrecision.DOUBLE)

  const vector08 = (() => {
    const values = new Float32Array([
      0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
    ])

    return v(values)
  })()

  t.is(vector08.precision, VectorPrecision.SINGLE)

  const vector09 = (() => {
    const values = new Float64Array([
      0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
    ])

    return v(values)
  })()

  t.is(vector09.precision, VectorPrecision.DOUBLE)
})

test(`An instance of \`Vector\` is an iterable`, (t) => {
  const vector00 = v(10)

  t.deepEqual([...vector00], [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0])

  const vector01 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  t.deepEqual([...vector01], [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector02 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  t.deepEqual([...vector02], [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])
})

test(`\`Vector.add()\` returns the result of adding two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const vector02 = Vector.add(vector00, vector01)

  t.not(vector02, vector00)

  t.not(vector02, vector01)

  t.deepEqual(
    [...vector02],
    [
      0.9, 0.9, 0.8999999999999999, 0.8999999999999999, 0.9, 0.9,
      0.8999999999999999, 0.8999999999999999, 0.9, 0.9,
    ],
  )
})

test(`\`Vector#add()\` returns the result of adding two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const vector02 = vector00.add(vector01)

  t.not(vector02, vector00)

  t.not(vector02, vector01)

  t.deepEqual(
    [...vector02],
    [
      0.9, 0.9, 0.8999999999999999, 0.8999999999999999, 0.9, 0.9,
      0.8999999999999999, 0.8999999999999999, 0.9, 0.9,
    ],
  )
})

test(`\`Vector#arithmeticMean()\` returns a vector's arithmetic mean`, (t) => {
  const vector = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const mean = vector.arithmeticMean()

  t.is(mean, 0.45)
})

test(`\`Vector#clone()\` returns a cloned instance of a vector`, (t) => {
  const vector00 = (() => {
    const values = Array.from({length: 10}, () => {
      return generateRandomNumber(0.0, 0.9)
    })

    return v(values)
  })()

  const vector01 = vector00.clone()

  t.not(vector01, vector00)

  t.deepEqual([...vector00], [...vector01])
})

test(`\`Vector.cosineSimilarity()\` returns the result of computing the cosine similarity of two vectors`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const value00 = Vector.cosineSimilarity(vector00, vector00)

  t.is(value00, 0.9999999999999999)

  const value01 = Vector.cosineSimilarity(vector01, vector01)

  t.is(value01, 0.9999999999999999)

  const value02 = Vector.cosineSimilarity(vector00, vector01)

  t.is(value02, 0.4210526315789473)
})

test(`\`Vector#cosineSimilarity()\` returns the result of computing the cosine similarity of two vectors`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const value00 = vector00.cosineSimilarity(vector00)

  t.is(value00, 0.9999999999999999)

  const value01 = vector01.cosineSimilarity(vector01)

  t.is(value01, 0.9999999999999999)

  const value02 = vector00.cosineSimilarity(vector01)

  t.is(value02, 0.4210526315789473)
})

test(`\`Vector.div()\` returns the result of dividing two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const vector02 = Vector.div(vector00, vector01)

  t.not(vector02, vector00)

  t.not(vector02, vector01)

  t.deepEqual(
    [...vector02],
    [
      0,
      0.125,
      0.28571428571428575,
      0.5,
      0.8,
      1.25,
      2,
      3.4999999999999996,
      8,
      Infinity,
    ],
  )
})

test(`\`Vector#div()\` returns the result of dividing two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const vector02 = vector00.div(vector01)

  t.not(vector02, vector00)

  t.not(vector02, vector01)

  t.deepEqual(
    [...vector02],
    [
      0,
      0.125,
      0.28571428571428575,
      0.5,
      0.8,
      1.25,
      2,
      3.4999999999999996,
      8,
      Infinity,
    ],
  )
})

test(`\`Vector.dot()\` returns the result of computing the dot product of two vectors`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const value = Vector.dot(vector00, vector01)

  t.is(value, 1.2)
})

test(`\`Vector#dot()\` returns the result of computing the dot product of two vectors`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const value = vector00.dot(vector01)

  t.is(value, 1.2)
})

test(`\`Vector.eq()\` returns the result of == comparing two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const values00 = Vector.eq(vector00, vector00)

  values00.forEach((value) => {
    t.true(value)
  })

  const values01 = Vector.eq(vector01, vector01)

  values01.forEach((value) => {
    t.true(value)
  })

  const values02 = Vector.eq(vector00, vector01)

  values02.forEach((value) => {
    t.false(value)
  })
})

test(`\`Vector#eq()\` returns the result of == comparing two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const values00 = vector00.eq(vector00)

  values00.forEach((value) => {
    t.true(value)
  })

  const values01 = vector01.eq(vector01)

  values01.forEach((value) => {
    t.true(value)
  })

  const values02 = vector00.eq(vector01)

  values02.forEach((value) => {
    t.false(value)
  })
})

test(`\`Vector#euclideanNorm()\` returns the result of computing a vector's Euclidean norm`, (t) => {
  const vector = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const norm = vector.euclideanNorm()

  t.is(norm, 1.6881943016134133)
})

test(`\`Vector#fill()\` updates a vector's elements to a value`, (t) => {
  const vector = v(10)

  t.deepEqual([...vector], [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0])

  const randomValue = generateRandomNumber(0.0, 0.9)

  vector.fill(randomValue)

  let index = 0

  void [...vector].forEach((value) => {
    t.is(value, randomValue)

    if (index < 9) {
      index++
    }
  })

  t.is(index, 9)
})

test(`\`Vector#forEach()\` loops through a vector's elements, calling a callback on each iteration`, (t) => {
  const values = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]

  const vector = v(values)

  vector.forEach((value, index, vector_) => {
    t.is(vector_, vector)

    t.is(value, values[index] as number)
  })
})

test(`\`Vector.ge()\` returns the result of >= comparing two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const values00 = Vector.ge(vector00, vector00)

  values00.forEach((value) => {
    t.true(value)
  })

  const values01 = Vector.ge(vector01, vector01)

  values01.forEach((value) => {
    t.true(value)
  })

  const values02 = Vector.ge(vector00, vector01)

  values02.forEach((value, index) => {
    if (index <= 4) {
      t.false(value)
    } else {
      t.true(value)
    }
  })
})

test(`\`Vector#ge()\` returns the result of >= comparing two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const values00 = vector00.ge(vector00)

  values00.forEach((value) => {
    t.true(value)
  })

  const values01 = vector01.ge(vector01)

  values01.forEach((value) => {
    t.true(value)
  })

  const values02 = vector00.ge(vector01)

  values02.forEach((value, index) => {
    if (index <= 4) {
      t.false(value)
    } else {
      t.true(value)
    }
  })
})

test(`\`Vector#get()\` returns a vector's element by its index`, (t) => {
  const values = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]

  const vector = v(values)

  values.forEach((value, index) => {
    const value_ = vector.get(index)

    t.is(value_, value)
  })
})

test(`\`Vector#geometricMean()\` returns a vector's geometric mean`, (t) => {
  const vector = v([1.0, 2.0, 1.0, 2.0, 1.0, 2.0, 1.0, 2.0, 1.0, 2.0])

  const mean = vector.geometricMean()

  t.is(mean, 1.414213562373095)
})

test(`\`Vector.gt()\` returns the result of > comparing two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const values00 = Vector.gt(vector00, vector00)

  values00.forEach((value) => {
    t.false(value)
  })

  const values01 = Vector.gt(vector01, vector01)

  values01.forEach((value) => {
    t.false(value)
  })

  const values02 = Vector.gt(vector00, vector01)

  values02.forEach((value, index) => {
    if (index <= 4) {
      t.false(value)
    } else {
      t.true(value)
    }
  })
})

test(`\`Vector#gt()\` returns the result of > comparing two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const values00 = vector00.gt(vector00)

  values00.forEach((value) => {
    t.false(value)
  })

  const values01 = vector01.gt(vector01)

  values01.forEach((value) => {
    t.false(value)
  })

  const values02 = vector00.gt(vector01)

  values02.forEach((value, index) => {
    if (index <= 4) {
      t.false(value)
    } else {
      t.true(value)
    }
  })
})

test(`\`Vector#indexOfMax()\` returns the index of a vector's maximum element`, (t) => {
  const vector = v([0.1, 0.0, 0.3, 0.2, 0.5, 0.4, 0.7, 0.6, 0.9, 0.8])

  const index = vector.indexOfMax()

  t.is(index, 8)
})

test(`\`Vector#indexOfMin()\` returns the index of a vector's minimum element`, (t) => {
  const vector = v([0.1, 0.0, 0.3, 0.2, 0.5, 0.4, 0.7, 0.6, 0.9, 0.8])

  const index = vector.indexOfMin()

  t.is(index, 1)
})

test(`\`Vector#infinityNorm()\` returns the result of computing a vector's infinity norm`, (t) => {
  const vector = v([-0.9, -0.8, -0.7, -0.6, -0.5, -0.4, -0.3, -0.2, -0.1, -0.0])

  const norm = vector.infinityNorm()

  t.is(norm, 0.9)
})

test(`\`Vector.le()\` returns the result of <= comparing two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const values00 = Vector.le(vector00, vector00)

  values00.forEach((value) => {
    t.true(value)
  })

  const values01 = Vector.le(vector01, vector01)

  values01.forEach((value) => {
    t.true(value)
  })

  const values02 = Vector.le(vector00, vector01)

  values02.forEach((value, index) => {
    if (index <= 4) {
      t.true(value)
    } else {
      t.false(value)
    }
  })
})

test(`\`Vector#le()\` returns the result of <= comparing two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const values00 = vector00.le(vector00)

  values00.forEach((value) => {
    t.true(value)
  })

  const values01 = vector01.le(vector01)

  values01.forEach((value) => {
    t.true(value)
  })

  const values02 = vector00.le(vector01)

  values02.forEach((value, index) => {
    if (index <= 4) {
      t.true(value)
    } else {
      t.false(value)
    }
  })
})

test(`\`Vector.lt()\` returns the result of < comparing two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const values00 = Vector.lt(vector00, vector00)

  values00.forEach((value) => {
    t.false(value)
  })

  const values01 = Vector.lt(vector01, vector01)

  values01.forEach((value) => {
    t.false(value)
  })

  const values02 = Vector.lt(vector00, vector01)

  values02.forEach((value, index) => {
    if (index <= 4) {
      t.true(value)
    } else {
      t.false(value)
    }
  })
})

test(`\`Vector#lt()\` returns the result of < comparing two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const values00 = vector00.lt(vector00)

  values00.forEach((value) => {
    t.false(value)
  })

  const values01 = vector01.lt(vector01)

  values01.forEach((value) => {
    t.false(value)
  })

  const values02 = vector00.lt(vector01)

  values02.forEach((value, index) => {
    if (index <= 4) {
      t.true(value)
    } else {
      t.false(value)
    }
  })
})

test(`\`Vector#manhattanNorm()\` returns the result of computing a vector's Manhattan norm`, (t) => {
  const vector = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const norm = vector.manhattanNorm()

  t.is(norm, 4.5)
})

test(`\`Vector#map()\` loops through a vector's elements, calling a callback on each iteration and using the callback's return values as elements of a new vector, and returns the new vector`, (t) => {
  const values = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]

  const vector00 = v(values)

  const vector01 = vector00.map((value, _index, vector) => {
    t.is(vector, vector00)

    return value * -1
  })

  t.not(vector01, vector00)

  void [...vector01].forEach((value, index) => {
    t.is(value, (values[index] as number) * -1)
  })
})

test(`\`Vector#max()\` returns a vector's maximum element`, (t) => {
  const vector = v([0.1, 0.0, 0.3, 0.2, 0.5, 0.4, 0.7, 0.6, 0.9, 0.8])

  const value = vector.max()

  t.is(value, 0.9)
})

test(`\`Vector#min()\` returns a vector's minimum element`, (t) => {
  const vector = v([0.1, 0.0, 0.3, 0.2, 0.5, 0.4, 0.7, 0.6, 0.9, 0.8])

  const value = vector.min()

  t.is(value, 0.0)
})

test(`\`Vector.mod()\` returns the result of computing the modulo of two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const vector02 = Vector.mod(vector00, vector01)

  t.not(vector02, vector00)

  t.not(vector02, vector01)

  t.deepEqual(
    [...vector02],
    [
      0,
      0.1,
      0.2,
      0.3,
      0.4,
      0.09999999999999998,
      0,
      0.09999999999999992,
      0,
      NaN,
    ],
  )
})

test(`\`Vector#mod()\` returns the result of computing the modulo of two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const vector02 = vector00.mod(vector01)

  t.not(vector02, vector00)

  t.not(vector02, vector01)

  t.deepEqual(
    [...vector02],
    [
      0,
      0.1,
      0.2,
      0.3,
      0.4,
      0.09999999999999998,
      0,
      0.09999999999999992,
      0,
      NaN,
    ],
  )
})

test(`\`Vector#modality()\` returns a vector's modality`, (t) => {
  let modality: VectorModalityT | undefined

  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  modality = vector00.modality()

  t.is(modality.type, VectorModalityType.NULLIMODAL)

  const vector01 = v([1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0])

  modality = vector01.modality()

  t.is(modality.type, VectorModalityType.UNIMODAL)

  t.is(
    (() => {
      assertOk(modality.type === VectorModalityType.UNIMODAL)

      return modality.value
    })(),
    1.0,
  )

  const vector02 = v([0.0, 1.0, 2.0, 1.0, 2.0, 1.0, 2.0, 1.0, 2.0, 3.0])

  modality = vector02.modality()

  t.is(modality.type, VectorModalityType.BIMODAL)

  t.deepEqual(
    (() => {
      assertOk(modality.type === VectorModalityType.BIMODAL)

      return modality.values
    })(),
    [1.0, 2.0],
  )

  const vector03 = v([0.0, 1.0, 2.0, 3.0, 1.0, 2.0, 3.0, 1.0, 2.0, 3.0])

  modality = vector03.modality()

  t.is(modality.type, VectorModalityType.MULTIMODAL)

  t.deepEqual(
    (() => {
      assertOk(modality.type === VectorModalityType.MULTIMODAL)

      return modality.values
    })(),
    [1.0, 2.0, 3.0],
  )
})

test(`\`Vector.mul()\` returns the result of multiplying two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const vector02 = Vector.mul(vector00, vector01)

  t.not(vector02, vector00)

  t.not(vector02, vector01)

  t.deepEqual(
    [...vector02],
    [
      0, 0.08000000000000002, 0.13999999999999999, 0.18, 0.2, 0.2, 0.18,
      0.13999999999999999, 0.08000000000000002, 0,
    ],
  )
})

test(`\`Vector#mul()\` returns the result of multiplying two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const vector02 = vector00.mul(vector01)

  t.not(vector02, vector00)

  t.not(vector02, vector01)

  t.deepEqual(
    [...vector02],
    [
      0, 0.08000000000000002, 0.13999999999999999, 0.18, 0.2, 0.2, 0.18,
      0.13999999999999999, 0.08000000000000002, 0,
    ],
  )
})

test(`\`Vector.ne()\` returns the result of != comparing two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const values00 = Vector.ne(vector00, vector00)

  values00.forEach((value) => {
    t.false(value)
  })

  const values01 = Vector.ne(vector01, vector01)

  values01.forEach((value) => {
    t.false(value)
  })

  const values02 = Vector.ne(vector00, vector01)

  values02.forEach((value) => {
    t.true(value)
  })
})

test(`\`Vector#ne()\` returns the result of != comparing two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const values00 = vector00.ne(vector00)

  values00.forEach((value) => {
    t.false(value)
  })

  const values01 = vector01.ne(vector01)

  values01.forEach((value) => {
    t.false(value)
  })

  const values02 = vector00.ne(vector01)

  values02.forEach((value) => {
    t.true(value)
  })
})

test(`\`Vector#neg()\` returns the result of negating a vector, element-wise`, (t) => {
  const values = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]

  const vector00 = v(values)

  const vector01 = vector00.neg()

  t.not(vector01, vector00)

  void [...vector01].forEach((value, index) => {
    t.is(value, (values[index] as number) * -1)
  })
})

test(`\`Vector.ones()\` returns a constructed instance of \`Vector\`, with all elements initialized to \`1.0\``, (t) => {
  const vector = Vector.ones(10)

  void [...vector].forEach((value) => {
    t.is(value, 1.0)
  })
})

test(`\`Vector#set()\` sets a vector's element by its index and returns a boolean representing whether or not the element was set`, (t) => {
  const vector = v(10)

  const values = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]

  values.forEach((value, index) => {
    const valueWasSet = vector.set(index, value)

    t.true(valueWasSet)
  })

  values.forEach((value, index) => {
    const value_ = vector.get(index)

    t.is(value_, value)
  })
})

test(`\`Vector.sub()\` returns the result of subtracting two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const vector02 = Vector.sub(vector00, vector01)

  t.not(vector02, vector00)

  t.not(vector02, vector01)

  t.deepEqual(
    [...vector02],
    [
      -0.9, -0.7000000000000001, -0.49999999999999994, -0.3,
      -0.09999999999999998, 0.09999999999999998, 0.3, 0.49999999999999994,
      0.7000000000000001, 0.9,
    ],
  )
})

test(`\`Vector#sub()\` returns the result of subtracting two vectors, element-wise`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const vector01 = v([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0])

  const vector02 = vector00.sub(vector01)

  t.not(vector02, vector00)

  t.not(vector02, vector01)

  t.deepEqual(
    [...vector02],
    [
      -0.9, -0.7000000000000001, -0.49999999999999994, -0.3,
      -0.09999999999999998, 0.09999999999999998, 0.3, 0.49999999999999994,
      0.7000000000000001, 0.9,
    ],
  )
})

test(`\`Vector#sum()\` returns the result of computing a vector's sum`, (t) => {
  const vector = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const sum = vector.sum()

  t.is(sum, 4.5)
})

test(`\`Vector#toArray()\` returns a vector's array representation`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const array00 = vector00.toArray()

  t.true(Array.isArray(array00))

  t.deepEqual(array00, [...vector00])

  const vector01 = v(
    [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    VectorPrecision.SINGLE,
  )

  const array01 = vector01.toArray()

  t.true(Array.isArray(array01))

  t.deepEqual(array01, [...vector01])
})

test(`\`Vector#toBuffer()\` returns a vector's buffer representation, encoded via the MessagePack algorithm`, (t) => {
  const vector00 = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const buffer00 = vector00.toBuffer()

  t.true(buffer00 instanceof Uint8Array)

  const decodedArray00 = decodeMessagepack(buffer00) as Array<number>

  t.deepEqual(decodedArray00, [...vector00])

  const vector01 = v(
    [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    VectorPrecision.SINGLE,
  )

  const buffer01 = vector01.toBuffer()

  t.true(buffer01 instanceof Uint8Array)

  const decodedArray01 = decodeMessagepack(buffer01) as Array<number>

  t.deepEqual(decodedArray01, [...vector01])
})

test(`\`Vector#toFloat32Array()\` returns a vector's single-precision floating point array representation`, (t) => {
  const vector = v(
    [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    VectorPrecision.SINGLE,
  )

  const array = vector.toFloat32Array()

  t.true(array instanceof Float32Array)

  t.deepEqual([...array], [...vector])
})

test(`\`Vector#toFloat64Array()\` returns a vector's double-precision floating point array representation`, (t) => {
  const vector = v([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])

  const array = vector.toFloat64Array()

  t.true(array instanceof Float64Array)

  t.deepEqual([...array], [...vector])
})
