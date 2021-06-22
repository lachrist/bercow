const Util = require("util");

exports.assert = (boolean, Error, template, ...values) => {
  if (!boolean) {
    throw new Error(Util.format(template, ...values));
  }
};
