import { assertEqual } from "../test/fixture.mjs";
import * as Log from "./log.mjs";

const {ownKeys} = Reflect;

for (const name of ownKeys(Log)) {
  assertEqual(Log[name]("foo\n"), undefined);
}
