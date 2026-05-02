module.exports = {
    env: {
        node: true,
        es2021: true,
        mocha: true
    },
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'script'
    },
    rules: {
        'indent': ['error', 4],
        'quotes': ['error', 'single', { 'avoidEscape': true }],
        'semi': ['error', 'always'],
        'no-unused-vars': ['warn', { 'args': 'none', 'ignoreRestSiblings': true }],
        'no-console': 'off'
    },
    overrides: [
        {
            files: ['src/**/*.js'],
            parserOptions: {
                sourceType: 'module'
            },
            env: {
                browser: true,
                es2021: true
            }
        }
    ]
};
