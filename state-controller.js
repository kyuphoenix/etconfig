import { getByPath, setByPath } from "./path-utils.js";

export function createStateController({ defaultState, groups }) {
  let state = structuredClone(defaultState);
  let generatedInstanceId = crypto.randomUUID();
  const groupOpenState = new Map(
    groups.map((group) => [group.title, !group.collapsed])
  );

  function getState() {
    return state;
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
