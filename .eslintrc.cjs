/**
 ***********************************************************************
 * Copyright 2022-present Jonathan Barronville                         *
 *                                                                     *
 * This Source Code Form is subject to the terms of the Mozilla Public *
 * License, v. 2.0. If a copy of the MPL was not distributed with this *
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.           *
 ***********************************************************************
 */

const {memoize: _$memoize} = require('lodash')

const getConfig = _$memoize(() => {
  /**
   * @type {import('eslint').Linter.Config}
   */
  const config = {
    env: {
      es2021: true,
      node: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
    ],
    ignorePatterns: ['*.cjs'],
    overrides: [],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    root: true,
    rules: {'@typescript-eslint/no-explicit-any': 'off'},
    settings: {},
  }

  return config
})

exports = module.exports = getConfig()
