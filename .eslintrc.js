module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:prettier/recommended', // add prettier-eslint plugin which will uses the `.prettierrc.js` config
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/recommended',
    'eslint:recommended',
    '@vue/prettier',
    '@vue/typescript',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
    'vuetify/no-deprecated-classes': 'error',
  },
};
