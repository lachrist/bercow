const {getFoo} = require("../foo.js");
exports.getFooBar = () => `${getFoo()}bar`;
