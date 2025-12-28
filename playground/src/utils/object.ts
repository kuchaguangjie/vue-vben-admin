// check is object null/undefined, or all its children are undefined
export function checkAllFieldsUndefined(obj: object): boolean {
  if (!obj) return true;

  // Get an array of the object's values
  const values = Object.values(obj);

  // Check if every value in the array is strictly undefined
  return values.every((value) => value === undefined);
}
