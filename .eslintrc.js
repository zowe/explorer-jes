module.exports = {
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
    ],
    "plugins": [
        "@typescript-eslint",
        "react",
        "react-hooks",
        "jsx-a11y",
    ],
    "rules": {
        // Style
        "indent": ["error", 4, { "SwitchCase": 1 }],
        "max-len": ["error", 200],
        "arrow-body-style": ["error", "always"],
        "arrow-parens": ["error", "as-needed"],
        "lines-between-class-members": ["error", "always"],
        "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
        // React style
        "react/jsx-indent": ["error", 4],
        "react/jsx-indent-props": ["error", 4],
        "react/jsx-boolean-value": ["error", "always"],
        // Relaxed — codebase uses these patterns
        "no-underscore-dangle": "off",
        "no-alert": "off",
        "prefer-destructuring": "off",
        "no-restricted-globals": "off",
        "default-param-last": "off",
        "react/destructuring-assignment": "off",
        "react/function-component-definition": "off",
        "react/jsx-one-expression-per-line": "off",
        "react/sort-comp": "off",
        "react/no-unknown-property": "off",
        "react/prop-types": "off",
        "react/display-name": "off",
        "jsx-a11y/no-static-element-interactions": "off",
        // TS handles these
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-require-imports": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-unused-expressions": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-this-alias": "off",
        // Pre-existing patterns in codebase
        "react/no-direct-mutation-state": "off",
        "jsx-a11y/no-autofocus": "off",
        "jsx-a11y/role-has-required-aria-props": "off",
    },
    "env": {
        "browser": true,
        "node": true,
        "es6": true,
        "mocha": true,
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 2020,
        "sourceType": "module",
        "ecmaFeatures": { "jsx": true },
    },
    "settings": {
        "react": { "version": "detect" },
    },
};
