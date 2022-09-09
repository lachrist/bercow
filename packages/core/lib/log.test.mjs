import { assertEqual } from "../../../test/fixture.mjs";
import { EOL } from "node:os";
import * as Log from "./log.mjs";

for (const name of ["logTitle", "logSubtitle", "logParagraph"]) {
  assertEqual(Log[name](`foo${EOL}`), undefined);
}
