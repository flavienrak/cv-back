export default isEmpty = (value) => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'number' && isNaN(value)) ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value?.trim().length === 0)
  );
};
