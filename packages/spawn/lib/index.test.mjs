import { assertEqual, makeTempDirAsync } from "../../../test/fixture.mjs";
import {
  writeFile as writeFileAsync,
  unlink as unlinkAsync,
} from "fs/promises";
import { tmpdir as getTmpdir, platform } from "node:os";
import plugin from "./index.mjs";

const infos = {
  index: 0,
  ordering: [],
  logTitle: (_title) => {},
  logSubtitle: (_subtitle) => {},
  logParagraph: (_paragraph) => {},
};

const path = `${await makeTempDirAsync()}/main.mjs`;

await writeFileAsync(path, "123;");

const { test } = await plugin(
  {
    [`command-${platform()}`]: "node",
    argv: ["--version", "$TEST"],
  },
  getTmpdir(),
);

assertEqual(await test([{ path }, { path }], infos), undefined);

await unlinkAsync(path);
