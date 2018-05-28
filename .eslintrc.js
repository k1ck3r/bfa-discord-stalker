module.exports = {
  extends: ['airbnb-base'],
  env: {
    node: true,
    es6: true
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 6
  },
  rules: {
    'no-this-before-super': 'warn',
    'no-undef': 'warn',
    'no-unreachable': 'warn',
    'no-unused-vars': 'warn',
    'constructor-super': 'warn',
    'valid-typeof': 'warn',
    'linebreak-style': ['warn', 'unix'],
    eqeqeq: ['warn', 'smart'],
    'brace-style': ['warn', '1tbs'],
    'max-len': ['warn', 150],
    'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
    'arrow-parens': ['warn', 'as-needed'],
    'comma-dangle': ['warn', 'never'],
    semi: ['warn', 'always']
  },
  globals: {}
}
