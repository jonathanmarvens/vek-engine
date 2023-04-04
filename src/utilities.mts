/**
 ***********************************************************************
 * Copyright 2022-present Jonathan Barronville                         *
 *                                                                     *
 * This Source Code Form is subject to the terms of the Mozilla Public *
 * License, v. 2.0. If a copy of the MPL was not distributed with this *
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.           *
 ***********************************************************************
 */

type LoadWasmModuleImportsT = {env: Record<string, unknown>}

declare global {
  interface Window {
    _vekDebugModeIsEnabled?: boolean
  }
}

const isEnvBrowser = (() => {
  return (
    typeof window !== 'undefined' &&
    window !== null &&
    typeof window.document !== 'undefined' &&
    window.document !== null &&
    typeof document !== 'undefined' &&
    document === window.document
  )
})()

const isEnvNode = (() => {
  return (
    typeof process !== 'undefined' &&
    process !== null &&
    typeof process.versions !== 'undefined' &&
    process.versions !== null &&
    typeof process.versions.node === 'string'
  )
})()

const {ok: _assertOk} = await (() => {
  if (isEnvBrowser) {
    return import('assert')
  } else if (isEnvNode) {
    return import('node:assert')
  } else {
    throw new TypeError('Could not import the `assert` module')
  }
})()

const {inspect: inspectObject} = await (() => {
  if (isEnvBrowser) {
    return import('util')
  } else if (isEnvNode) {
    return import('node:util')
  } else {
    throw new TypeError('Could not import the `util` module')
  }
})()

const isEnvDebug = (() => {
  if (isEnvBrowser) {
    return window._vekDebugModeIsEnabled === true
  } else if (isEnvNode) {
    return (
      process.env['NODE_ENV'] === 'development' ||
      process.env['NODE_ENV'] === 'test'
    )
  } else {
    return false
  }
})()

const isEnvRelease = (() => !isEnvDebug)()

function assertOk(value: unknown): asserts value {
  void _assertOk(value)
}

const loadWasmModule = async (imports?: LoadWasmModuleImportsT) => {
  const env = (() => {
    if (isEnvDebug) {
      return 'debug' as const
    } else if (isEnvRelease) {
      return 'release' as const
    } else {
      return 'release' as const
    }
  })()

  const wasmLoaderFilePath = `../dist-wasm/${env}.js` as const

  const {instantiate: instantiateModule} = await (async () => {
    type PromisedModuleT = Promise<
      Awaited<typeof import('../dist-wasm/debug.js')>
    >

    switch (env) {
      case 'debug': {
        return import(wasmLoaderFilePath) as unknown as PromisedModuleT
      }

      case 'release': {
        return import(wasmLoaderFilePath) as unknown as PromisedModuleT
      }
    }
  })()

  const wasmFilePath = `../dist-wasm/${env}.wasm` as const

  const wasmFileUrl = new globalThis.URL(wasmFilePath, import.meta.url)

  let module: globalThis.WebAssembly.Module | undefined

  if (isEnvBrowser) {
    const response = await globalThis.fetch(wasmFileUrl)

    module = await globalThis.WebAssembly.compileStreaming(response)
  } else if (isEnvNode) {
    const {readFile} = await import('node:fs/promises')

    const buffer = await readFile(wasmFileUrl)

    module = await globalThis.WebAssembly.compile(buffer)
  } else {
    throw new TypeError('Could not load the WebAssembly module')
  }

  imports = {
    env: {...imports?.env},
  }

  const exports = await instantiateModule(module, imports)

  return Object.freeze({...exports})
}

export {
  assertOk,
  inspectObject,
  isEnvBrowser,
  isEnvDebug,
  isEnvNode,
  isEnvRelease,
  loadWasmModule,
}
