/**
 ***********************************************************************
 * Copyright 2022-present Jonathan Barronville                         *
 *                                                                     *
 * This Source Code Form is subject to the terms of the Mozilla Public *
 * License, v. 2.0. If a copy of the MPL was not distributed with this *
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.           *
 ***********************************************************************
 */

/**
 * NOTE:
 * Obviously, this is exactly the same as the simpler `usize(0)` and
 * `u32(0x00000000) === u64(0x0000000000000000)`; I've only written it this way
 * for my own silly reasons (i.e., mostly for readability's sake).
 */
@inline
export const NULL_PTR: usize =
  ASC_TARGET === 2 ? usize(u64(0x0000000000000000)) : usize(u32(0x00000000))

@final
@unmanaged
export class Ptr<T> {
  @inline
  constructor() {
    const size: usize = sizeof<usize>()

    const ptr: usize = heap.alloc(size)

    if (ptr === NULL_PTR) {
      throw new Error(
        `Could not allocate ${size} ${size !== 1 ? 'bytes' : 'byte'} of memory`,
      )
    }

    return changetype<Ptr<T>>(ptr)
  }

  @inline
  destroy(): void {
    const ptr: usize = changetype<usize>(this)

    heap.free(ptr)
  }
}

@inline
export function ptrCreate<T>(): Ptr<T> {
  return new Ptr<T>()
}

@inline
export function ptrDestroy<T>(ptr: Ptr<T>): void {
  ptr.destroy()
}

@inline
export function ptrGetValue<T>(ptr: Ptr<T>, index: isize): T {
  const size: usize = isReference<T>() ? offsetof<T>() : sizeof<T>()

  return load<T>(changetype<usize>(ptr) + usize(index) * size)
}

@inline
export function ptrSetValue<T>(ptr: Ptr<T>, index: isize, value: T): void {
  const size: usize = isReference<T>() ? offsetof<T>() : sizeof<T>()

  store<T>(changetype<usize>(ptr) + usize(index) * size, value)
}
