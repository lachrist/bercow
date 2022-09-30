import {
  makeTempDirAsync,
  assertThrow,
  assertDeepEqual,
  assertRejectAsync,
  assertEqual,
} from "../../../test/fixture.mjs";
import { writeFile as writeFileAsync } from "node:fs/promises";
import {
  assert,
  // maybe //
  mapMaybe,
  fromMaybe,
  // closure //
  promisify,
  uncurry,
  bindX_,
  bind_X,
  bind_XX,
  bindXX_,
  // string //
  unprefixString,
  trimString,
  concatString,
  compareString,
  doesNotMatchAnyRegExp,
  // file //
  readFileMissingAsync,
  unlinkMissingAsync,
  // predicate //
  isNotNull,
  isNotEmptyString,
  isDuplicate,
} from "./util.mjs";

assertThrow(() => assert(false, "message"));

///////////
// maybe //
///////////

assertEqual(
  mapMaybe(null, () => {
    throw new Error("deadcode");
  }),
  null,
);

assertEqual(
  mapMaybe("foo", (just) => `${just}bar`),
  "foobar",
);

assertEqual(fromMaybe(123, 456), 123);

assertEqual(fromMaybe(null, 123), 123);

/////////////
// closure //
/////////////

assertEqual(await promisify((callback) => callback(null, 123)), 123);

await assertRejectAsync(
  promisify((callback) => callback(new Error("BOUM"), null)),
  /^Error: BOUM/,
);

const returnArguments = (...args) => args;

assertDeepEqual(uncurry(returnArguments)([1, 2, 3]), [1, 2, 3]);

assertDeepEqual(bindX_(returnArguments, 1)(2), [1, 2]);

assertDeepEqual(bind_X(returnArguments, 2)(1), [1, 2]);

assertDeepEqual(bind_XX(returnArguments, 2, 3)(1), [1, 2, 3]);

assertDeepEqual(bindXX_(returnArguments, 1, 2)(3), [1, 2, 3]);

//////////
// file //
//////////

{
  const path = await `${await makeTempDirAsync()}/file.txt`;
  await unlinkMissingAsync(path);
  assertEqual(await readFileMissingAsync(path, "utf8", "foo"), "foo");
  await writeFileAsync(path, "bar", "utf8");
  assertEqual(await readFileMissingAsync(path, "utf8", "foo"), "bar");
  await unlinkMissingAsync(path);
}

///////////////
// predicate //
///////////////

assertEqual(isNotNull(null), false);

assertEqual(isNotEmptyString(""), false);

assertEqual([1, 2, 3].find(isDuplicate), undefined);

assertEqual([1, 2, 3, 2].find(isDuplicate), 2);

////////////
// string //
////////////

assertEqual(unprefixString("foobar", "foo"), "bar");

assertEqual(unprefixString("foobar", "bar"), "foobar");

assertEqual(trimString(" foo "), "foo");

assertEqual(concatString("foo", "bar"), "foobar");

assertEqual(compareString("a", "b"), -1);

assertEqual(doesNotMatchAnyRegExp("foobar", [/^bar/u, /foo$/u]), true);

assertEqual(doesNotMatchAnyRegExp("foobar", [/^foo/u, /bar$/u]), false);
