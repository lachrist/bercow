import {
  throws as assertThrow,
  equal as assertEqual,
  deepEqual as assertDeepEqual,
} from "node:assert";

import {
  generateDiscreteFunction,
  inversePair,
  isNotEmptyString,
} from "./util.mjs";

assertEqual(isNotEmptyString(123), true);

assertEqual(isNotEmptyString(""), false);

assertDeepEqual(inversePair([123, 456]), [456, 123]);

assertEqual(generateDiscreteFunction(new Map([[123, 456]]))(123), 456);

assertThrow(() => generateDiscreteFunction(new Map([]))(123));
