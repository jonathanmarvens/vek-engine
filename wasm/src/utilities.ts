/**
 ***********************************************************************
 * Copyright 2022-present Jonathan Barronville                         *
 *                                                                     *
 * This Source Code Form is subject to the terms of the Mozilla Public *
 * License, v. 2.0. If a copy of the MPL was not distributed with this *
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.           *
 ***********************************************************************
 */

@inline
export function getIsizeByteSize(): u8 {
  return u8(sizeof<isize>())
}

@inline
export function getUsizeByteSize(): u8 {
  return u8(sizeof<usize>())
}

@inline
export function isIsizeI32(): bool {
  return isize.MAX_VALUE === i32.MAX_VALUE
}

@inline
export function isIsizeI64(): bool {
  return isize.MAX_VALUE === i64.MAX_VALUE
}

@inline
export function isUsizeU32(): bool {
  return usize.MAX_VALUE === u32.MAX_VALUE
}

@inline
export function isUsizeU64(): bool {
  return usize.MAX_VALUE === u64.MAX_VALUE
}
