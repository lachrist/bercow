# @bercow/import-esm-order

Lint plugin for the [bercow](https://github.com/lachrist/bercow) test runner based which enforces import ordering on native modules. Node modules should be first, then external modules, then internal modules. The ordering of internal module follows bercow's ordering. Throws an error if an internal module is imported without being tested first.

* `fix <boolean>`: indicates whether import should be re-ordered or if an error should be throws. *Default*: `true`.
* `babel-generator-options <BabelGeneratorOptions>`: options given to `@babel/generator`.
* `babel-parser-options <BabelParserOptions>`: options given to `@babel/parser`.
