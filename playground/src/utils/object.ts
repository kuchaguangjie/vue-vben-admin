// check is object undefined / null, or all its children are undefined / null / empty string.
export function checkAllFieldsEmpty(obj: object): boolean {
  if (!obj) return true;

  // Get an array of the object's values
  const values = Object.values(obj);

  // Check if every value in the array is strictly undefined
  return values.every((value) => {
    return value === undefined || value === null || value === '';
  });
}

export function removeEmptyFields(obj: object): object {
  return Object.fromEntries(Object.entries(obj).filter((x) => x[1] !== ''));
}
