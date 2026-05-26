export function getByPath(object, path) {
  return path.split(".").reduce((current, key) => current?.[key], object);
}

export function setByPath(object, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {};
    }
    return current[key];
  }, object);
  target[lastKey] = value;
}
