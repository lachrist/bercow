import { assertEqual } from "../../../test/fixture.mjs";
import {
  writeFile as writeFileAsync,
  unlink as unlinkAsync,
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

const path = joinPath(
  getTmpdir(),
  `bercow-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2)}.mjs`,
);

await writeFileAsync(path, "123;");

const { test } = await plugin(
  {
    command: "node",
    argv: ["--version", "$TEST"],
  },
  getTmpdir(),
);

assertEqual(await test([{ path }, { path }], infos), undefined);

await unlinkAsync(path);
