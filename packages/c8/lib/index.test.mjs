import { assertEqual } from "../../../test/fixture.mjs";
import {
  writeFile as writeFileAsync,
  mkdir as mkdirAsync,
  rm as rmAsync,
} from "fs/promises";
import { tmpdir as getTmpdir } from "node:os";
import { join as joinPath } from "node:path";
import plugin from "./index.mjs";

const infos = {
  cwd: "/cwd",
  index: 0,
  ordering: [],
  logTitle: (_title) => {},
  logSubtitle: (_subtitle) => {},
  logParagraph: (_paragraph) => {},
};

const home = joinPath(
  getTmpdir(),
  `bercow-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
);

await mkdirAsync(home);

await writeFileAsync(joinPath(home, "main.mjs"), `123;`, "utf8");

await writeFileAsync(
  joinPath(home, "test.mjs"),
  `import "./main.mjs";`,
  "utf8",
);

const { test } = await plugin({}, "/home");

assertEqual(
  await test(
    [
      {
        path: joinPath(home, "main.mjs"),
        content: "foo",
      },
      {
        path: joinPath(home, "test.mjs"),
        content: "bar",
      },
    ],
    infos,
  ),
  undefined,
);

await rmAsync(home, { recursive: true });
