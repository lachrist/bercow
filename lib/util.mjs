export const isNotEmptyString = (any) => any !== "";

export const isNotNull = (any) => any !== null;

export const assert = (boolean, message) => {
  if (!boolean) {
    throw new Error(message);
  }
};
