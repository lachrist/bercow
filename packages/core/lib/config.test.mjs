import { getTemporaryPath, assertDeepEqual } from "../test/fixture.mjs";
import { writeFileSync as writeFile } from "node:fs";
import { loadConfig } from "./config.mjs";

const { stringify: stringifyJSON } = JSON;

const path = `${getTemporaryPath()}.json`;

writeFile(path, stringifyJSON({ foo: "bar" }), "utf8");

assertDeepEqual(loadConfig(path, "utf8"), { foo: "bar" });
