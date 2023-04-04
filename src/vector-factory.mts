/**
 ***********************************************************************
 * Copyright 2022-present Jonathan Barronville                         *
 *                                                                     *
 * This Source Code Form is subject to the terms of the Mozilla Public *
 * License, v. 2.0. If a copy of the MPL was not distributed with this *
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.           *
 ***********************************************************************
 */

import {assertOk} from './utilities.mjs'
import {inspectObject} from './utilities.mjs'
import type {InspectOptions} from 'node:util'
import {isEnvDebug} from './utilities.mjs'
import {loadWasmModule} from './utilities.mjs'

type VectorCreateClassOptionsT = Partial<{
  wasm: Partial<{memory: WebAssembly.Memory}>
}>

type VectorModalityT =
  | Readonly<{type: VectorModalityType.NULLIMODAL}>
  | Readonly<{
      type: VectorModalityType.UNIMODAL
      value: number
    }>
  | Readonly<{
      type: VectorModalityType.BIMODAL
      values: Readonly<[number, number]>
    }>
  | Readonly<{
      type: VectorModalityType.MULTIMODAL
      values: Readonly<Array<number>>
    }>

type VectorOptionsT = Partial<{disableArrayIndexing: boolean}>

const enum VectorModalityType {
  NULLIMODAL = 0,
  UNIMODAL = 1,
  BIMODAL = 2,
  MULTIMODAL,
}

const enum VectorPrecision {
  SINGLE = 4,
  DOUBLE = 8,
}

const INT32_MAX_VALUE = 2 ** 31 - 1

const createClass = async (options?: VectorCreateClassOptionsT) => {
  type VArgsT = VectorStaticCreateArgsT

  type VectorConstructorArgsT =
    | [
        dimensions: number,
        precision?: VectorPrecision | undefined,
        options?: VectorOptionsT | undefined,
      ]
    | [
        array: Array<number>,
        precision?: VectorPrecision | undefined,
        options?: VectorOptionsT | undefined,
      ]
    | [buffer: Uint8Array, options?: VectorOptionsT | undefined]
    | [array: Float32Array, options?: VectorOptionsT | undefined]
    | [array: Float64Array, options?: VectorOptionsT | undefined]

  type VectorEachCallbackT = VectorForEachCallbackT

  type VectorForEachCallbackT = (
    value: number,
    index: number,
    vector: Vector,
  ) => void

  type VectorInstanceInternalScopeT = {
    isArrayIndexingEnabled: boolean
    nativePointer: VectorNativePointer
  }

  type VectorMapCallbackT = (
    value: number,
    index: number,
    vector: Vector,
  ) => number

  type VectorNativePointer = ReturnType<typeof wasmModule.vectorCreate>

  type VectorStaticCreateArgsT = VectorConstructorArgsT

  const customInspectMethodKey = Symbol.for(
    'nodejs.util.inspect.custom' as const,
  )

  const {memory: wasmMemory, module: wasmModule} = await (async () => {
    const memory = (() => {
      let memory: WebAssembly.Memory | undefined

      memory = options?.wasm?.memory

      if (!(memory instanceof WebAssembly.Memory)) {
        memory = new WebAssembly.Memory({
          initial: 1,
          maximum: 65536 /* (1024 * 64) */,
          shared: true,
        })
      }

      return memory
    })()

    const module = await loadWasmModule({
      env: {memory},
    })

    return {
      memory,
      module,
    }
  })()

  const ___instanceInternalScopes = new WeakMap<
    Vector,
    VectorInstanceInternalScopeT
  >()

  let ___isConstructingClassInstance = false

  let _disableArrayIndexing: boolean | null = null

  const ___getInstanceInternalScope = (instance: Vector) => {
    const scope = ___instanceInternalScopes.get(instance)

    return scope ?? null
  }

  const ___getIsArrayIndexingEnabled = (instance: Vector) => {
    const scope = ___getInstanceInternalScope(instance)

    return scope?.isArrayIndexingEnabled ?? null
  }

  const ___getIsConstructingClassInstance = () => ___isConstructingClassInstance

  const ___getNativePointer = (instance: Vector) => {
    const scope = ___getInstanceInternalScope(instance)

    return scope?.nativePointer ?? null
  }

  const ___makeInstanceInternalScope = (
    instance: Vector,
    scope: VectorInstanceInternalScopeT,
  ) => {
    scope = Object.seal(scope)

    ___instanceInternalScopes.set(instance, scope)

    return scope
  }

  const ___setIsConstructingClassInstance = (value: boolean) => {
    ___isConstructingClassInstance = value
  }

  const _getDisableArrayIndexing = () => _disableArrayIndexing

  const _proxifyInstance = (instance: Vector) => {
    return new Proxy(instance, {
      get: (target, name, receiver) => {
        const propertyValue = Reflect.get(target, name, receiver)

        if (typeof propertyValue !== 'undefined') {
          return propertyValue
        }

        if (typeof name === 'symbol') {
          return undefined
        }

        const index = Number(name)

        if (!Number.isInteger(index)) {
          return undefined
        }

        const dataValue = target.get.call(receiver, index)

        return dataValue ?? undefined
      },
      set: (target, name, value, receiver) => {
        if (Reflect.has(target, name)) {
          return Reflect.set(target, name, value, receiver)
        }

        if (typeof name === 'symbol') {
          return false
        }

        const index = Number(name)

        if (!Number.isInteger(index)) {
          return false
        }

        if (typeof value !== 'number') {
          return false
        }

        return target.set.call(receiver, index, value)
      },
    })
  }

  const _setDisableArrayIndexing = (value: boolean | null) => {
    _disableArrayIndexing = value
  }

  const convertElementByteSizeToPrecision = (size?: 4 | 8) => {
    switch (size) {
      case 4: {
        return VectorPrecision.SINGLE
      }

      case 8: {
        return VectorPrecision.DOUBLE
      }

      default: {
        return VectorPrecision.DOUBLE
      }
    }
  }

  const convertPrecisionToElementByteSize = (precision?: VectorPrecision) => {
    switch (precision) {
      case VectorPrecision.DOUBLE: {
        return VectorPrecision.DOUBLE as const as 8
      }

      case VectorPrecision.SINGLE: {
        return VectorPrecision.SINGLE as const as 4
      }

      default: {
        return VectorPrecision.DOUBLE as const as 8
      }
    }
  }

  const isNumbersArrayValid = (
    array: Array<unknown>,
  ): array is Array<number> => {
    return array.every((value) => {
      return isNumberValid(value)
    })
  }

  const isNumberValid = (value: unknown): value is number => {
    if (typeof value !== 'number') {
      return false
    }

    if (Number.isNaN(value)) {
      return false
    }

    return Number.isFinite(value)
  }

  const v = (...args: VArgsT) => Vector.create(...args)

  class Vector {
    public set ___nativePointer(pointer: VectorNativePointer) {
      const scope = ___getInstanceInternalScope(this)

      assertOk(scope !== null)

      scope.nativePointer = pointer
    }

    public get dimensions() {
      return wasmModule.vectorInstanceGetDimensions(this.nativePointer)
    }

    public set disableArrayIndexing(value: boolean | null) {
      _setDisableArrayIndexing(value)
    }

    public get elementByteSize() {
      return wasmModule.vectorInstanceGetElementByteSize(this.nativePointer) as
        | 4
        | 8
    }

    public get is64Bit() {
      return wasmModule.vectorInstanceGetIs64Bit(this.nativePointer)
    }

    public get isDebugModeActive() {
      return isEnvDebug
    }

    public get maxIndex() {
      return wasmModule.vectorInstanceGetMaxIndex(this.nativePointer)
    }

    public get nativePointer() {
      const pointer = ___getNativePointer(this)

      assertOk(pointer !== null)

      return pointer
    }

    public get precision() {
      return convertElementByteSizeToPrecision(this.elementByteSize)
    }

    public get wasmMemory() {
      return wasmMemory
    }

    public get wasmModule() {
      return wasmModule
    }

    private constructor(...args: VectorConstructorArgsT) {
      if (!___getIsConstructingClassInstance()) {
        throw new TypeError(
          'Can only create instances of `Vector` via `Vector.create()`',
        )
      }

      if (args.length < 1) {
        throw new TypeError('Could not create an instance of `Vector`')
      }

      let instanceIsReadyForInitialization = false

      let disableArrayIndexingOptionValue: boolean | undefined

      let nativePointer: VectorNativePointer | undefined

      if (
        typeof args[0] === 'number' &&
        Number.isInteger(args[0]) &&
        args[0] > 0 &&
        (typeof args[1] === 'undefined' ||
          args[1] === VectorPrecision.DOUBLE ||
          args[1] === VectorPrecision.SINGLE) &&
        (typeof args[2] === 'undefined' ||
          (typeof args[2] === 'object' && args[2] !== null))
      ) {
        const [dimensions, precision, options] = args

        disableArrayIndexingOptionValue =
          typeof options?.disableArrayIndexing === 'boolean'
            ? options.disableArrayIndexing
            : undefined

        const elementByteSize = convertPrecisionToElementByteSize(precision)

        if (dimensions * elementByteSize > INT32_MAX_VALUE) {
          throw new TypeError('Could not create an instance of `Vector`')
        }

        nativePointer = wasmModule.vectorCreate(dimensions, elementByteSize)

        instanceIsReadyForInitialization = true
      } else if (
        Array.isArray(args[0]) &&
        isNumbersArrayValid(args[0]) &&
        (typeof args[1] === 'undefined' ||
          args[1] === VectorPrecision.DOUBLE ||
          args[1] === VectorPrecision.SINGLE) &&
        (typeof args[2] === 'undefined' ||
          (typeof args[2] === 'object' && args[2] !== null))
      ) {
        const array = args[0].slice()

        const [, precision, options] = args

        const vector = new Vector(array.length, precision, options)

        for (let i = 0, j = vector.maxIndex; i <= j; i++) {
          const index = i

          const value = array[index]

          assertOk(typeof value !== 'undefined')

          vector.set(index, value)
        }

        return vector
      } else if (
        args[0] instanceof Uint8Array &&
        (typeof args[1] === 'undefined' ||
          (typeof args[1] === 'object' && args[1] !== null))
      ) {
        const buffer = args[0].slice()

        const [, options] = args

        const vector = new Vector(1, VectorPrecision.SINGLE, options)

        const nativePointer = wasmModule.vectorStaticFromBuffer(buffer.buffer)

        vector.___nativePointer = nativePointer

        return vector
      } else if (
        args[0] instanceof Float32Array &&
        (typeof args[1] === 'undefined' ||
          (typeof args[1] === 'object' && args[1] !== null))
      ) {
        const array = args[0].slice()

        const [, options] = args

        const vector = new Vector(array.length, VectorPrecision.SINGLE, options)

        for (let i = 0, j = vector.maxIndex; i <= j; i++) {
          const index = i

          const value = array[index]

          assertOk(typeof value !== 'undefined')

          vector.set(index, value)
        }

        return vector
      } else if (
        args[0] instanceof Float64Array &&
        (typeof args[1] === 'undefined' ||
          (typeof args[1] === 'object' && args[1] !== null))
      ) {
        const array = args[0].slice()

        const [, options] = args

        const vector = new Vector(array.length, VectorPrecision.DOUBLE, options)

        for (let i = 0, j = vector.maxIndex; i <= j; i++) {
          const index = i

          const value = array[index]

          assertOk(typeof value !== 'undefined')

          vector.set(index, value)
        }

        return vector
      }

      if (!instanceIsReadyForInitialization) {
        throw new TypeError('Could not create an instance of `Vector`')
      }

      const enableArrayIndexing = (() => {
        let disableArrayIndexing = _getDisableArrayIndexing()

        if (disableArrayIndexing !== null) {
          return !disableArrayIndexing
        }

        disableArrayIndexing = disableArrayIndexingOptionValue ?? false

        return !disableArrayIndexing
      })()

      assertOk(typeof nativePointer !== 'undefined')

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let vector: Vector = this

      if (enableArrayIndexing) {
        vector = _proxifyInstance(this)
      }

      ;(
        [
          [this, nativePointer],
          [vector, nativePointer],
        ] satisfies Array<[Vector, typeof nativePointer]>
      ).forEach((values) => {
        const [vector, nativePointer] = values

        ___makeInstanceInternalScope(vector, {
          isArrayIndexingEnabled: enableArrayIndexing,
          nativePointer,
        })
      })

      return vector
    }

    public *[Symbol.iterator]() {
      const iteratorPointer = wasmModule.vectorIteratorCreate(
        this.nativePointer,
      )

      if (this.is64Bit) {
        while (true) {
          const {isDone, value} =
            wasmModule.vectorIteratorInstanceNext(iteratorPointer)

          yield value

          if (isDone) {
            break
          }
        }
      } else {
        while (true) {
          const {isDone, value} =
            wasmModule.vectorIteratorInstanceNext(iteratorPointer)

          yield Math.fround(value)

          if (isDone) {
            break
          }
        }
      }
    }

    public add(otherVector: Vector) {
      return Vector.add(this, otherVector)
    }

    public static add(aVector: Vector, bVector: Vector) {
      if (
        aVector.wasmModule !== bVector.wasmModule &&
        aVector.wasmMemory !== bVector.wasmMemory
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` in the same memory space',
        )
      }

      if (
        aVector.is64Bit !== bVector.is64Bit ||
        aVector.dimensions !== bVector.dimensions
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` with the same dimensions and precision',
        )
      }

      let options: VectorOptionsT | undefined

      {
        let isArrayIndexingEnabled = ___getIsArrayIndexingEnabled(aVector)

        if (isArrayIndexingEnabled === null) {
          isArrayIndexingEnabled = ___getIsArrayIndexingEnabled(bVector)
        }

        if (isArrayIndexingEnabled === false) {
          options = Object.assign({...options}, {disableArrayIndexing: true})
        }
      }

      const resultVector = Vector.create(
        aVector.dimensions,
        aVector.precision,
        options,
      )

      wasmModule.vectorStaticAdd(
        aVector.nativePointer,
        bVector.nativePointer,
        resultVector.nativePointer,
      )

      return resultVector
    }

    public arithmeticMean() {
      let value = wasmModule.vectorInstanceArithmeticMean(this.nativePointer)

      if (!this.is64Bit) {
        value = Math.fround(value)
      }

      return value
    }

    public average() {
      return this.arithmeticMean()
    }

    public avg() {
      return this.arithmeticMean()
    }

    public clone() {
      let options: VectorOptionsT | undefined

      {
        const isArrayIndexingEnabled = ___getIsArrayIndexingEnabled(this)

        if (isArrayIndexingEnabled === false) {
          options = Object.assign({...options}, {disableArrayIndexing: true})
        }
      }

      if (this.is64Bit) {
        const array = this.toFloat64Array()

        return Vector.create(array, options)
      } else {
        const array = this.toFloat32Array()

        return Vector.create(array, options)
      }
    }

    public cosineSimilarity(otherVector: Vector) {
      return Vector.cosineSimilarity(this, otherVector)
    }

    public static cosineSimilarity(aVector: Vector, bVector: Vector) {
      if (
        aVector.wasmModule !== bVector.wasmModule &&
        aVector.wasmMemory !== bVector.wasmMemory
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` in the same memory space',
        )
      }

      if (
        aVector.is64Bit !== bVector.is64Bit ||
        aVector.dimensions !== bVector.dimensions
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` with the same dimensions and precision',
        )
      }

      let value = wasmModule.vectorStaticCosineSimilarity(
        aVector.nativePointer,
        bVector.nativePointer,
      )

      if (!aVector.is64Bit) {
        value = Math.fround(value)
      }

      return value
    }

    public static create(...args: VectorStaticCreateArgsT) {
      ___setIsConstructingClassInstance(true)

      const vector = new Vector(...args)

      ___setIsConstructingClassInstance(false)

      return vector
    }

    public div(otherVector: Vector) {
      return Vector.div(this, otherVector)
    }

    public static div(aVector: Vector, bVector: Vector) {
      if (
        aVector.wasmModule !== bVector.wasmModule &&
        aVector.wasmMemory !== bVector.wasmMemory
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` in the same memory space',
        )
      }

      if (
        aVector.is64Bit !== bVector.is64Bit ||
        aVector.dimensions !== bVector.dimensions
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` with the same dimensions and precision',
        )
      }

      let options: VectorOptionsT | undefined

      {
        let isArrayIndexingEnabled = ___getIsArrayIndexingEnabled(aVector)

        if (isArrayIndexingEnabled === null) {
          isArrayIndexingEnabled = ___getIsArrayIndexingEnabled(bVector)
        }

        if (isArrayIndexingEnabled === false) {
          options = Object.assign({...options}, {disableArrayIndexing: true})
        }
      }

      const resultVector = Vector.create(
        aVector.dimensions,
        aVector.precision,
        options,
      )

      wasmModule.vectorStaticDiv(
        aVector.nativePointer,
        bVector.nativePointer,
        resultVector.nativePointer,
      )

      return resultVector
    }

    public divide(otherVector: Vector) {
      return Vector.divide(this, otherVector)
    }

    public static divide(aVector: Vector, bVector: Vector) {
      return Vector.div(aVector, bVector)
    }

    public dot(otherVector: Vector) {
      return Vector.dot(this, otherVector)
    }

    public static dot(aVector: Vector, bVector: Vector) {
      if (
        aVector.wasmModule !== bVector.wasmModule &&
        aVector.wasmMemory !== bVector.wasmMemory
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` in the same memory space',
        )
      }

      if (
        aVector.is64Bit !== bVector.is64Bit ||
        aVector.dimensions !== bVector.dimensions
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` with the same dimensions and precision',
        )
      }

      let value = wasmModule.vectorStaticDot(
        aVector.nativePointer,
        bVector.nativePointer,
      )

      if (!aVector.is64Bit) {
        value = Math.fround(value)
      }

      return value
    }

    public dotProduct(otherVector: Vector) {
      return Vector.dotProduct(this, otherVector)
    }

    public static dotProduct(aVector: Vector, bVector: Vector) {
      return Vector.dot(aVector, bVector)
    }

    public each(callback: VectorEachCallbackT) {
      this.forEach(callback)
    }

    public eq(otherVector: Vector) {
      return Vector.eq(this, otherVector)
    }

    public static eq(aVector: Vector, bVector: Vector) {
      if (
        aVector.wasmModule !== bVector.wasmModule &&
        aVector.wasmMemory !== bVector.wasmMemory
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` in the same memory space',
        )
      }

      if (
        aVector.is64Bit !== bVector.is64Bit ||
        aVector.dimensions !== bVector.dimensions
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` with the same dimensions and precision',
        )
      }

      const arrayBuffer = wasmModule.vectorStaticCmp(
        aVector.nativePointer,
        bVector.nativePointer,
      )

      const buffer = new Int8Array(arrayBuffer, 0, arrayBuffer.byteLength)

      return buffer.reduce(
        (values, value, index) => {
          values[index] = value === 0

          return values
        },
        (() => {
          return new Array<boolean>(buffer.length)
        })(),
      )
    }

    public equals(otherVector: Vector) {
      return Vector.equals(this, otherVector)
    }

    public static equals(aVector: Vector, bVector: Vector) {
      return Vector.eq(aVector, bVector)
    }

    public euclideanNorm() {
      return this.pNorm(2.0)
    }

    public fill(value: number) {
      if (typeof value !== 'number' || !isNumberValid(value)) {
        throw new TypeError('`value` must be a non-NaN finite number')
      }

      wasmModule.vectorInstanceFill(this.nativePointer, value)

      return this
    }

    public forEach(callback: VectorForEachCallbackT) {
      let i = 0

      for (const value of this) {
        const index = i

        callback(value, index, this)

        i++
      }
    }

    public ge(otherVector: Vector) {
      return Vector.ge(this, otherVector)
    }

    public static ge(aVector: Vector, bVector: Vector) {
      if (
        aVector.wasmModule !== bVector.wasmModule &&
        aVector.wasmMemory !== bVector.wasmMemory
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` in the same memory space',
        )
      }

      if (
        aVector.is64Bit !== bVector.is64Bit ||
        aVector.dimensions !== bVector.dimensions
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` with the same dimensions and precision',
        )
      }

      const arrayBuffer = wasmModule.vectorStaticCmp(
        aVector.nativePointer,
        bVector.nativePointer,
      )

      const buffer = new Int8Array(arrayBuffer, 0, arrayBuffer.byteLength)

      return buffer.reduce(
        (values, value, index) => {
          values[index] = value === 1 || value === 0

          return values
        },
        (() => {
          return new Array<boolean>(buffer.length)
        })(),
      )
    }

    public get(index: number) {
      if (!Number.isInteger(index)) {
        return null
      }

      if (index < 0 || index > this.maxIndex) {
        return null
      }

      let value = wasmModule.vectorInstanceGetValue(this.nativePointer, index)

      if (!this.is64Bit) {
        value = Math.fround(value)
      }

      return value
    }

    public geometricMean() {
      let value = wasmModule.vectorInstanceGeometricMean(this.nativePointer)

      if (!this.is64Bit) {
        value = Math.fround(value)
      }

      return value
    }

    public greaterThan(otherVector: Vector) {
      return Vector.greaterThan(this, otherVector)
    }

    public static greaterThan(aVector: Vector, bVector: Vector) {
      return Vector.gt(aVector, bVector)
    }

    public greaterThanOrEquals(otherVector: Vector) {
      return Vector.greaterThanOrEquals(this, otherVector)
    }

    public static greaterThanOrEquals(aVector: Vector, bVector: Vector) {
      return Vector.ge(aVector, bVector)
    }

    public gt(otherVector: Vector) {
      return Vector.gt(this, otherVector)
    }

    public static gt(aVector: Vector, bVector: Vector) {
      if (
        aVector.wasmModule !== bVector.wasmModule &&
        aVector.wasmMemory !== bVector.wasmMemory
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` in the same memory space',
        )
      }

      if (
        aVector.is64Bit !== bVector.is64Bit ||
        aVector.dimensions !== bVector.dimensions
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` with the same dimensions and precision',
        )
      }

      const arrayBuffer = wasmModule.vectorStaticCmp(
        aVector.nativePointer,
        bVector.nativePointer,
      )

      const buffer = new Int8Array(arrayBuffer, 0, arrayBuffer.byteLength)

      return buffer.reduce(
        (values, value, index) => {
          values[index] = value === 1

          return values
        },
        (() => {
          return new Array<boolean>(buffer.length)
        })(),
      )
    }

    public idxmax() {
      return this.indexOfMax()
    }

    public idxmin() {
      return this.indexOfMin()
    }

    public indexOfMax() {
      let value = wasmModule.vectorInstanceIndexOfMax(this.nativePointer)

      if (!this.is64Bit) {
        value = Math.fround(value)
      }

      return value
    }

    public indexOfMin() {
      let value = wasmModule.vectorInstanceIndexOfMin(this.nativePointer)

      if (!this.is64Bit) {
        value = Math.fround(value)
      }

      return value
    }

    public infinityNorm() {
      let value = wasmModule.vectorInstanceInfinityNorm(this.nativePointer)

      if (!this.is64Bit) {
        value = Math.fround(value)
      }

      return value
    }

    public innerProduct(otherVector: Vector) {
      return Vector.innerProduct(this, otherVector)
    }

    public static innerProduct(aVector: Vector, bVector: Vector) {
      return Vector.dot(aVector, bVector)
    }

    public isBimodal() {
      const type = this.modalityType()

      return type === VectorModalityType.BIMODAL
    }

    public isMultimodal() {
      const type = this.modalityType()

      return type === VectorModalityType.MULTIMODAL
    }

    public isNullimodal() {
      const type = this.modalityType()

      return type === VectorModalityType.NULLIMODAL
    }

    public isUnimodal() {
      const type = this.modalityType()

      return type === VectorModalityType.UNIMODAL
    }

    public l1Norm() {
      return this.pNorm(1.0)
    }

    public l2Norm() {
      return this.pNorm(2.0)
    }

    public le(otherVector: Vector) {
      return Vector.le(this, otherVector)
    }

    public static le(aVector: Vector, bVector: Vector) {
      if (
        aVector.wasmModule !== bVector.wasmModule &&
        aVector.wasmMemory !== bVector.wasmMemory
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` in the same memory space',
        )
      }

      if (
        aVector.is64Bit !== bVector.is64Bit ||
        aVector.dimensions !== bVector.dimensions
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` with the same dimensions and precision',
        )
      }

      const arrayBuffer = wasmModule.vectorStaticCmp(
        aVector.nativePointer,
        bVector.nativePointer,
      )

      const buffer = new Int8Array(arrayBuffer, 0, arrayBuffer.byteLength)

      return buffer.reduce(
        (values, value, index) => {
          values[index] = value === -1 || value === 0

          return values
        },
        (() => {
          return new Array<boolean>(buffer.length)
        })(),
      )
    }

    public lessThan(otherVector: Vector) {
      return Vector.lessThan(this, otherVector)
    }

    public static lessThan(aVector: Vector, bVector: Vector) {
      return Vector.lt(aVector, bVector)
    }

    public lessThanOrEquals(otherVector: Vector) {
      return Vector.lessThanOrEquals(this, otherVector)
    }

    public static lessThanOrEquals(aVector: Vector, bVector: Vector) {
      return Vector.le(aVector, bVector)
    }

    public lInfinityNorm() {
      return this.infinityNorm()
    }

    public lt(otherVector: Vector) {
      return Vector.lt(this, otherVector)
    }

    public static lt(aVector: Vector, bVector: Vector) {
      if (
        aVector.wasmModule !== bVector.wasmModule &&
        aVector.wasmMemory !== bVector.wasmMemory
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` in the same memory space',
        )
      }

      if (
        aVector.is64Bit !== bVector.is64Bit ||
        aVector.dimensions !== bVector.dimensions
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` with the same dimensions and precision',
        )
      }

      const arrayBuffer = wasmModule.vectorStaticCmp(
        aVector.nativePointer,
        bVector.nativePointer,
      )

      const buffer = new Int8Array(arrayBuffer, 0, arrayBuffer.byteLength)

      return buffer.reduce(
        (values, value, index) => {
          values[index] = value === -1

          return values
        },
        (() => {
          return new Array<boolean>(buffer.length)
        })(),
      )
    }

    public manhattanNorm() {
      return this.pNorm(1.0)
    }

    public map(callback: VectorMapCallbackT) {
      let options: VectorOptionsT | undefined

      {
        const isArrayIndexingEnabled = ___getIsArrayIndexingEnabled(this)

        if (isArrayIndexingEnabled === false) {
          options = Object.assign({...options}, {disableArrayIndexing: true})
        }
      }

      const vector = Vector.create(this.dimensions, this.precision, options)

      {
        let i = 0

        for (const value of this) {
          const index = i

          const newValue = callback(value, index, this)

          if (typeof newValue !== 'number' || !isNumberValid(newValue)) {
            throw new TypeError(
              '`callback()` must return a non-NaN finite number',
            )
          }

          vector.set(index, newValue)

          i++
        }
      }

      return vector
    }

    public max() {
      let value = wasmModule.vectorInstanceMax(this.nativePointer)

      if (!this.is64Bit) {
        value = Math.fround(value)
      }

      return value
    }

    public maximum() {
      return this.max()
    }

    public maxNorm() {
      return this.infinityNorm()
    }

    public mean() {
      return this.arithmeticMean()
    }

    public min() {
      let value = wasmModule.vectorInstanceMin(this.nativePointer)

      if (!this.is64Bit) {
        value = Math.fround(value)
      }

      return value
    }

    public minimum() {
      return this.min()
    }

    public mod(otherVector: Vector) {
      return Vector.mod(this, otherVector)
    }

    public static mod(aVector: Vector, bVector: Vector) {
      if (
        aVector.wasmModule !== bVector.wasmModule &&
        aVector.wasmMemory !== bVector.wasmMemory
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` in the same memory space',
        )
      }

      if (
        aVector.is64Bit !== bVector.is64Bit ||
        aVector.dimensions !== bVector.dimensions
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` with the same dimensions and precision',
        )
      }

      let options: VectorOptionsT | undefined

      {
        let isArrayIndexingEnabled = ___getIsArrayIndexingEnabled(aVector)

        if (isArrayIndexingEnabled === null) {
          isArrayIndexingEnabled = ___getIsArrayIndexingEnabled(bVector)
        }

        if (isArrayIndexingEnabled === false) {
          options = Object.assign({...options}, {disableArrayIndexing: true})
        }
      }

      const resultVector = Vector.create(
        aVector.dimensions,
        aVector.precision,
        options,
      )

      wasmModule.vectorStaticMod(
        aVector.nativePointer,
        bVector.nativePointer,
        resultVector.nativePointer,
      )

      return resultVector
    }

    public modality() {
      const values = wasmModule.vectorInstanceMode(this.nativePointer)

      if (values.length === 1) {
        let [value] = values

        assertOk(typeof value !== 'undefined')

        if (!Number.isFinite(value)) {
          return Object.freeze({
            type: VectorModalityType.NULLIMODAL,
          }) satisfies VectorModalityT
        }

        if (!this.is64Bit) {
          value = Math.fround(value)
        }

        return Object.freeze({
          type: VectorModalityType.UNIMODAL,
          value,
        }) satisfies VectorModalityT
      } else if (values.length === 2) {
        let [valueA, valueB] = values

        assertOk(typeof valueA !== 'undefined' && typeof valueB !== 'undefined')

        if (!this.is64Bit) {
          valueA = Math.fround(valueA)

          valueB = Math.fround(valueB)
        }

        return Object.freeze({
          type: VectorModalityType.BIMODAL,
          values: Object.freeze([valueA, valueB] as const),
        }) satisfies VectorModalityT
      } else {
        const newValues = (() => {
          if (this.is64Bit) {
            return values.reduce(
              (values, value, index) => {
                values[index] = value

                return values
              },
              (() => {
                return new Array<number>(values.length)
              })(),
            )
          } else {
            return values.reduce(
              (values, value, index) => {
                value = Math.fround(value)

                values[index] = value

                return values
              },
              (() => {
                return new Array<number>(values.length)
              })(),
            )
          }
        })()

        return Object.freeze({
          type: VectorModalityType.MULTIMODAL,
          values: Object.freeze(newValues),
        }) satisfies VectorModalityT
      }
    }

    public modalityType() {
      const {type} = this.modality()

      return type
    }

    public mode() {
      const info = this.modality()

      switch (info.type) {
        case VectorModalityType.NULLIMODAL: {
          return -Infinity
        }

        case VectorModalityType.UNIMODAL: {
          return info.value
        }

        case VectorModalityType.BIMODAL: {
          return info.values
        }

        case VectorModalityType.MULTIMODAL: {
          return info.values
        }
      }
    }

    public modulo(otherVector: Vector) {
      return Vector.modulo(this, otherVector)
    }

    public static modulo(aVector: Vector, bVector: Vector) {
      return Vector.mod(aVector, bVector)
    }

    public mul(otherVector: Vector) {
      return Vector.mul(this, otherVector)
    }

    public static mul(aVector: Vector, bVector: Vector) {
      if (
        aVector.wasmModule !== bVector.wasmModule &&
        aVector.wasmMemory !== bVector.wasmMemory
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` in the same memory space',
        )
      }

      if (
        aVector.is64Bit !== bVector.is64Bit ||
        aVector.dimensions !== bVector.dimensions
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` with the same dimensions and precision',
        )
      }

      let options: VectorOptionsT | undefined

      {
        let isArrayIndexingEnabled = ___getIsArrayIndexingEnabled(aVector)

        if (isArrayIndexingEnabled === null) {
          isArrayIndexingEnabled = ___getIsArrayIndexingEnabled(bVector)
        }

        if (isArrayIndexingEnabled === false) {
          options = Object.assign({...options}, {disableArrayIndexing: true})
        }
      }

      const resultVector = Vector.create(
        aVector.dimensions,
        aVector.precision,
        options,
      )

      wasmModule.vectorStaticMul(
        aVector.nativePointer,
        bVector.nativePointer,
        resultVector.nativePointer,
      )

      return resultVector
    }

    public multiply(otherVector: Vector) {
      return Vector.multiply(this, otherVector)
    }

    public static multiply(aVector: Vector, bVector: Vector) {
      return Vector.mul(aVector, bVector)
    }

    public ne(otherVector: Vector) {
      return Vector.ne(this, otherVector)
    }

    public static ne(aVector: Vector, bVector: Vector) {
      if (
        aVector.wasmModule !== bVector.wasmModule &&
        aVector.wasmMemory !== bVector.wasmMemory
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` in the same memory space',
        )
      }

      if (
        aVector.is64Bit !== bVector.is64Bit ||
        aVector.dimensions !== bVector.dimensions
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` with the same dimensions and precision',
        )
      }

      const arrayBuffer = wasmModule.vectorStaticCmp(
        aVector.nativePointer,
        bVector.nativePointer,
      )

      const buffer = new Int8Array(arrayBuffer, 0, arrayBuffer.byteLength)

      return buffer.reduce(
        (values, value, index) => {
          values[index] = value !== 0

          return values
        },
        (() => {
          return new Array<boolean>(buffer.length)
        })(),
      )
    }

    public neg() {
      let options: VectorOptionsT | undefined

      {
        const isArrayIndexingEnabled = ___getIsArrayIndexingEnabled(this)

        if (isArrayIndexingEnabled === false) {
          options = Object.assign({...options}, {disableArrayIndexing: true})
        }
      }

      const vector = Vector.create(this.dimensions, this.precision, options)

      wasmModule.vectorInstanceNeg(this.nativePointer, vector.nativePointer)

      return vector
    }

    public negate() {
      return this.neg()
    }

    public notEquals(otherVector: Vector) {
      return Vector.notEquals(this, otherVector)
    }

    public static notEquals(aVector: Vector, bVector: Vector) {
      return Vector.ne(aVector, bVector)
    }

    public static ones(
      dimensions: number,
      precision?: VectorPrecision,
      options?: VectorOptionsT,
    ) {
      const elementByteSize = convertPrecisionToElementByteSize(precision)

      if (
        !Number.isInteger(dimensions) ||
        dimensions < 1 ||
        dimensions * elementByteSize > INT32_MAX_VALUE
      ) {
        throw new TypeError(
          `\`dimensions\` must be >= \`1\` and \`(dimensions * elementByteSize)\` must <= \`${INT32_MAX_VALUE}\``,
        )
      }

      const vector = Vector.create(1, VectorPrecision.SINGLE, options)

      const nativePointer = wasmModule.vectorStaticOnes(
        dimensions,
        elementByteSize,
      )

      vector.___nativePointer = nativePointer

      return vector
    }

    public pNorm(p: 1.0 | 2.0) {
      if (p !== 1.0 && p !== 2.0) {
        throw new TypeError('`p` must be `1.00` or `2.00`')
      }

      let value = wasmModule.vectorInstancePNorm(this.nativePointer, p)

      if (!this.is64Bit) {
        value = Math.fround(value)
      }

      return value
    }

    public scalarProduct(otherVector: Vector) {
      return Vector.scalarProduct(this, otherVector)
    }

    public static scalarProduct(aVector: Vector, bVector: Vector) {
      return Vector.dot(aVector, bVector)
    }

    public set(index: number, value: number) {
      if (!Number.isInteger(index)) {
        return false
      }

      if (index < 0 || index > this.maxIndex) {
        return false
      }

      if (!this.is64Bit) {
        value = Math.fround(value)
      }

      return wasmModule.vectorInstanceSetValue(this.nativePointer, index, value)
    }

    public sub(otherVector: Vector) {
      return Vector.sub(this, otherVector)
    }

    public static sub(aVector: Vector, bVector: Vector) {
      if (
        aVector.wasmModule !== bVector.wasmModule &&
        aVector.wasmMemory !== bVector.wasmMemory
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` in the same memory space',
        )
      }

      if (
        aVector.is64Bit !== bVector.is64Bit ||
        aVector.dimensions !== bVector.dimensions
      ) {
        throw new TypeError(
          'Can only operate on instances of `Vector` with the same dimensions and precision',
        )
      }

      let options: VectorOptionsT | undefined

      {
        let isArrayIndexingEnabled = ___getIsArrayIndexingEnabled(aVector)

        if (isArrayIndexingEnabled === null) {
          isArrayIndexingEnabled = ___getIsArrayIndexingEnabled(bVector)
        }

        if (isArrayIndexingEnabled === false) {
          options = Object.assign({...options}, {disableArrayIndexing: true})
        }
      }

      const resultVector = Vector.create(
        aVector.dimensions,
        aVector.precision,
        options,
      )

      wasmModule.vectorStaticSub(
        aVector.nativePointer,
        bVector.nativePointer,
        resultVector.nativePointer,
      )

      return resultVector
    }

    public subtract(otherVector: Vector) {
      return Vector.subtract(this, otherVector)
    }

    public static subtract(aVector: Vector, bVector: Vector) {
      return Vector.sub(aVector, bVector)
    }

    public sum() {
      let value = wasmModule.vectorInstanceSum(this.nativePointer)

      if (!this.is64Bit) {
        value = Math.fround(value)
      }

      return value
    }

    public toArray() {
      return Array.from(this)
    }

    public toBuffer() {
      const buffer = wasmModule.vectorInstanceToBuffer(this.nativePointer)

      return new Uint8Array(buffer, 0, buffer.byteLength)
    }

    public toFloat32Array() {
      const array = new Float32Array(this.dimensions)

      {
        let i = 0

        for (const value of this) {
          const index = i

          array[index] = Math.fround(value)

          i++
        }
      }

      return array
    }

    public toFloat64Array() {
      return Float64Array.from(this)
    }

    public toJSON(_key?: unknown) {
      return this.toArray()
    }

    public toString() {
      return JSON.stringify(this)
    }

    public valueOf() {
      return `${this}`
    }

    public static zeros(
      dimensions: number,
      precision?: VectorPrecision,
      options?: VectorOptionsT,
    ) {
      return Vector.create(dimensions, precision, options)
    }
  }

  Object.assign(Vector.prototype, {
    [customInspectMethodKey]: function (
      this: Vector,
      _depth: number,
      options: InspectOptions,
      inspect: typeof inspectObject,
    ) {
      return `Vek:Vector<${inspect([...this], options)}>`
    },
  })

  return {default: Vector, v, Vector, wasmMemory, wasmModule}
}

export {
  createClass,
  type VectorCreateClassOptionsT,
  type VectorModalityT,
  VectorModalityType,
  type VectorOptionsT,
  VectorPrecision,
}
