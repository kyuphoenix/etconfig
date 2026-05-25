export function createStateController({ defaultState, groups }) {
  let state = structuredClone(defaultState);
  let generatedInstanceId = crypto.randomUUID();
  const groupOpenState = new Map(
    groups.map((group) => [group.title, !group.collapsed])
  );

  function getState() {
    return state;
  }

  function getByPath(object, path) {
    return path.split(".").reduce((current, key) => current?.[key], object);
  }

  function setByPath(object, path, value) {
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

  function getEffectiveInstanceId() {
    const manualValue = String(state.instance_id || "").trim();
    return manualValue || generatedInstanceId;
  }

  function resetState() {
    state = structuredClone(defaultState);
    generatedInstanceId = crypto.randomUUID();
    groups.forEach((group) => {
      groupOpenState.set(group.title, !group.collapsed);
    });
  }

  return {
    getState,
    getByPath,
    setByPath,
    getEffectiveInstanceId,
    resetState,
    groupOpenState
  };
}
