export function getTop10PanelState(mergedData, mergedDataError) {
  if (mergedDataError) {
    return "error";
  }

  if (!mergedData?.features?.length) {
    return "loading";
  }

  return "ready";
}
