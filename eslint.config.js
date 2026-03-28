/** @type {import('eslint').Linter.Config[]} */
module.exports = [
    {
        ignores: ['node_modules/', 'coverage/']
    },
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'script',
            globals: {
                require: 'readonly',
                module: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                before: 'readonly',
                beforeEach: 'readonly',
                after: 'readonly',
                afterEach: 'readonly'
            }
        },
        rules: {
            indent: ['error', 4],
            quotes: ['error', 'single', { avoidEscape: true }],
            semi: ['error', 'always'],
            'no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }],
            'no-console': 'off',
            'max-len': ['error', { code: 120, ignoreComments: true, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }]
        }
    }
];
