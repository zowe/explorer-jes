module.exports = {
    "extends": "airbnb",
    "rules": {
        "react/jsx-filename-extension": 0,
        "react/no-did-update-set-state": 0,
        "indent": ["error", 4,{ "SwitchCase": 1 }],
        "react/jsx-indent": ["error", 4],
        "react/jsx-indent-props": ["error", 4],
        "jsx-a11y/href-no-hash":0,
        "arrow-body-style": ["error", "always"],
        "arrow-parens": ["error", "as-needed"],
        "react/jsx-boolean-value":["error", "always"],
        "max-len": ["error", 200],
        "jsx-a11y/label-has-for": 0,
        "react/require-default-props": 0,
        "no-underscore-dangle":0,
        "no-nested-ternary":0,
        "no-trailing-spaces":0,
        "no-alert":0,
        "jsx-a11y/no-static-element-interactions":0,
        "lines-between-class-members": ["error", "always"],
        "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
        "react/no-unknown-property": "off",
        "prefer-destructuring": "off",
        "no-restricted-globals": "off",
        "react/destructuring-assignment": "off",
        "react/function-component-definition": "off",
        "object-curly-newline": "off",
        "react/jsx-wrap-multilines": "off",
        "jsx-a11y/role-has-required-aria-props": "off",
        "default-param-last": "off",
        "react/jsx-one-expression-per-line": "off",
        "react/sort-comp": "off",
        "import/no-extraneous-dependencies": ["error", {"devDependencies": ["**/fvtTest/**/*.*", "**/tests/**/*.*", "**/WebContent/**/*.*", "webpack.*"]},]
    },
    "env": {
        "browser": true,
        "node": true,
        "es6": true,
        "mocha": true
    },
    "parser": "@babel/eslint-parser",
    "parserOptions": {
        "requireConfigFile": false,
        "babelOptions": { "presets": ["@babel/preset-react"] },
        "ecmaVersion": 6,
        "sourceType": "module",
        "ecmaFeatures": {
            "globalReturn": true,
            "jsx": true
        }
    }
};