import { assertThrow } from "../test/fixture.mjs";

import { assert } from "./util.mjs";

assertThrow(() => assert(false, "message"));
