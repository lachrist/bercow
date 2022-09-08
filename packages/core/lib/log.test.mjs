import { assertEqual } from "../test/fixture.mjs";
import { logColor } from "./log.mjs";

assertEqual(logColor("test\n", "blue"), undefined);
