import * as Util from "util";

export const assert = (boolean, template, ...values) => {
  if (!boolean) {
    throw new Error(Util.format(template, ...values));
  }
};

export const assertReject = (reject, boolean, template, ...values) => {
  if (!boolean) {
    reject(new Error(Util.format(template, ...values)));
  }
};
