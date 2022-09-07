import { equal as assertEqual } from "node:assert";
import { logColor } from "./log.mjs";

assertEqual(logColor("test\n"), undefined);
