import { strict as Assert } from "assert";
import {
  createLeft,
  createRight,
  fromEither,
  mapLeft,
  mapLeftAsync,
  bindLeft,
  bindLeftAsync,
  wrap,
  wrapAsync,
  wrapConstructor,
} from "./either.mjs";

const { deepEqual: assertDeepEqual, fail: assertFail } = Assert;

const testAsync = async () => {
  // fromEither //
  assertDeepEqual(
    fromEither(
      createLeft("foo"),
      (x) => x + "bar",
      () => assertFail(),
    ),
    "foobar",
  );
  assertDeepEqual(
    fromEither(
      createRight("foo"),
      () => assertFail(),
      (x) => x + "bar",
    ),
    "foobar",
  );
  // map //
  assertDeepEqual(
    mapLeft(createLeft("foo"), (x) => x + "bar"),
    createLeft("foobar"),
  );
  assertDeepEqual(
    mapLeft(createRight("foo"), (x) => assertFail()),
    createRight("foo"),
  );
  // mapAsync //
  assertDeepEqual(
    await mapLeftAsync(createLeft("foo"), (x) => Promise.resolve(x + "bar")),
    createLeft("foobar"),
  );
  assertDeepEqual(
    await mapLeftAsync(createRight("foo"), (x) => assertFail()),
    createRight("foo"),
  );
  // bind //
  assertDeepEqual(
    bindLeft(createLeft("foo"), (x) => createLeft(x + "bar")),
    createLeft("foobar"),
  );
  assertDeepEqual(
    bindLeft(createRight("foo"), (x) => assertFail()),
    createRight("foo"),
  );
  // bindAsync //
  assertDeepEqual(
    await bindLeftAsync(createLeft("foo"), (x) =>
      Promise.resolve(createLeft(x + "bar")),
    ),
    createLeft("foobar"),
  );
  assertDeepEqual(
    await bindLeftAsync(createRight("foo"), (x) => assertFail()),
    createRight("foo"),
  );
  // wrap //
  assertDeepEqual(wrap((x) => x + "bar")("foo"), createRight("foobar"));
  assertDeepEqual(
    wrap((x) => {
      throw new Error(x + "bar");
    })("foo"),
    createLeft("foobar"),
  );
  // wrapAsync //
  assertDeepEqual(
    await wrapAsync((x) => Promise.resolve(x + "bar"))("foo"),
    createRight("foobar"),
  );
  assertDeepEqual(
    await wrapAsync((x) => Promise.reject(new Error(x + "bar")))("foo"),
    createLeft("foobar"),
  );
  // wrapConstructor //
  assertDeepEqual(wrapConstructor(RegExp)("foo", "u"), createRight(/foo/u));
  assertDeepEqual(
    mapLeft(wrapConstructor(RegExp)("foo", "bar"), (message) => "qux"),
    createLeft("qux"),
  );
};

testAsync();
