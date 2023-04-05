/**
 ***********************************************************************
 * Copyright 2022-present Jonathan Barronville                         *
 *                                                                     *
 * This Source Code Form is subject to the terms of the Mozilla Public *
 * License, v. 2.0. If a copy of the MPL was not distributed with this *
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.           *
 ***********************************************************************
 */

declare global {
  interface Window {
    _vekDebugModeIsEnabled?: boolean
  }
}

type LoadWasmModuleImportsT = {env: Record<string, unknown>}

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

const _assertOk = await (async () => {
  type OkT = Awaited<typeof import('node:assert')>['ok']

  let ok: OkT | undefined

  if (isEnvRelease) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    ok = () => {}
  } else if (isEnvBrowser) {
    void ({ok} = await import('assert'))
  } else if (isEnvNode) {
    void ({ok} = await import('node:assert'))
  } else {
    throw new TypeError('Could not import the `assert` module')
  }

  return ok
})()

const inspectObject = await (async () => {
  type InspectT = Awaited<typeof import('node:util')>['inspect']

  let inspect: InspectT | undefined

  if (isEnvBrowser) {
    void ({inspect} = await import('util'))
  } else if (isEnvNode) {
    void ({inspect} = await import('node:util'))
  } else {
    throw new TypeError('Could not import the `util` module')
  }

  return inspect
})()

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

  const {instantiate: instantiateModule} = await (async () => {
    type PromisedModuleT = Promise<
      Awaited<typeof import('../dist-wasm/debug.js')>
    >

    switch (env) {
      case 'debug': {
        return import('../dist-wasm/debug.js')
      }

      case 'release': {
        return import('../dist-wasm/release.js') as unknown as PromisedModuleT
      }
    }
  })()

  const wasmFileUrl = (() => {
    switch (env) {
      case 'debug': {
        return new URL('../dist-wasm/debug.wasm', import.meta.url)
      }

      case 'release': {
        return new URL('../dist-wasm/release.wasm', import.meta.url)
      }
    }
  })()

  let module: WebAssembly.Module | undefined

  if (isEnvBrowser) {
    const response = await fetch(wasmFileUrl)

    module = await WebAssembly.compileStreaming(response)
  } else if (isEnvNode) {
    const {readFile} = await import('node:fs/promises')

    const buffer = await readFile(wasmFileUrl)

    module = await WebAssembly.compile(buffer)
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
