// create //

const generateCreateEither = (type) => (data) => ({ type, data });

export const createLeft = generateCreateEither("left");
export const createRight = generateCreateEither("right");

// fromEither //

export const fromEither = ({ type, data }, extractLeft, extractRight) => {
  if (type === "left") {
    return extractLeft(data);
  }
  if (type === "right") {
    return extractRight(data);
  }
  /* c8 ignore start */
  throw new Error("invalid either type");
  /* c8 ignore stop */
};

// map //

const generateMapEither = (type1) => (either, transform) => {
  const { type: type2, data } = either;
  if (type2 === type1) {
    return { type: type2, data: transform(data) };
  }
  return either;
};

export const mapLeft = generateMapEither("left");
export const mapRight = generateMapEither("right");

// mapAsync //

const generateMapEitherAsync = (type1) => async (either, transformAsync) => {
  const { type: type2, data } = either;
  if (type2 === type1) {
    return { type: type2, data: await transformAsync(data) };
  }
  return either;
};

export const mapLeftAsync = generateMapEitherAsync("left");
export const mapRightAsync = generateMapEitherAsync("right");

// bind //

const generateBindEither = (type1) => (either, uplift) => {
  const { type: type2, data } = either;
  if (type2 === type1) {
    return uplift(data);
  }
  return either;
};

export const bindLeft = generateBindEither("left");
export const bindRight = generateBindEither("right");

// bindAsync //

const generateBindEitherAsync = (type1) => async (either, upliftAsync) => {
  const { type: type2, data } = either;
  if (type2 === type1) {
    return await upliftAsync(data);
  }
  return either;
};

export const bindLeftAsync = generateBindEitherAsync("left");
export const bindRightAsync = generateBindEitherAsync("right");

// wrapConstructor //

export const wrapConstructor =
  (construct) =>
  (...args) => {
    try {
      return createRight(new construct(...args));
    } catch ({ message }) {
      return createLeft(message);
    }
  };

// wrap //

export const wrap =
  (compute) =>
  (...args) => {
    try {
      return createRight(compute(...args));
    } catch ({ message }) {
      return createLeft(message);
    }
  };

// wrapAsync //

export const wrapAsync =
  (computeAsync) =>
  async (...args) => {
    try {
      return createRight(await computeAsync(...args));
    } catch ({ message }) {
      return createLeft(message);
    }
  };
