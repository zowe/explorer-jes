module.exports = {
    "extends": "airbnb",
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "rules": {
        "react/jsx-filename-extension": 0,
        "indent": ["error", 4,{ "SwitchCase": 1 }],
        "react/jsx-indent": ["error", 4],
        "react/jsx-indent-props": ["error", 4],
        "jsx-a11y/href-no-hash":0,
        "arrow-body-style": ["error", "always"],
        "arrow-parens": ["error", "as-needed"],
        "react/jsx-boolean-value":["error", "always"],
        "max-len": ["error", 180],
        "jsx-a11y/label-has-for": 0,
        "react/require-default-props": 0,
        "no-underscore-dangle":0,
        "jsx-a11y/no-static-element-interactions":0,
        "lines-between-class-members": ["error", "always"],
        "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }]
    },
    "env": {
        "browser": true,
        "node": true,
        "es6": true,
        "jest": true,
        "mocha": true
    },
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module",
        "ecmaFeatures": {
            "arrowFunctions": true,
            "binaryLiterals": true,
            "blockBindings": true,
            "classes": true,
            "defaultParams": true,
            "destructuring": true,
            "forOf": true,
            "generators": true,
            "modules": true,
            "objectLiteralComputedProperties": true,
            "objectLiteralDuplicateProperties": true,
            "objectLiteralShorthandMethods": true,
            "objectLiteralShorthandProperties": true,
            "octalLiterals": true,
            "regexUFlag": true,
            "regexYFlag": true,
            "spread": true,
            "superInFunctions": true,
            "templateStrings": true,
            "unicodeCodePointEscapes": true,
            "globalReturn": true,
            "jsx": true,
            "experimentalObjectRestSpread": true
        }
    }
};