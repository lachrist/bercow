export const generateDiscreteFunction = (mapping) => (input) => {
  if (mapping.has(input)) {
    return mapping.get(input);
  } else {
    throw new Error(`Invalid input domain >> ${String(input)}`);
  }
};

export const inversePair = ([first, second]) => [second, first];

export const isNotEmptyString = (string) => string !== "";
