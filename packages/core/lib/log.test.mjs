import { assertEqual } from "../../../test/fixture.mjs";
import * as Log from "./log.mjs";

for (const name of ["logTitle", "logSubtitle", "logParagraph"]) {
  assertEqual(Log[name]("foo\n"), undefined);
}
