const {getFoo} = require("./foo.js");
const {getBar} = require("./bar");
exports.getFooBar = () => `${getFoo()}${getBar()}`;
