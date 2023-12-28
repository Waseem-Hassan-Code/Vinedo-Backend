function ParseRange(
  fileSize: number,
  rangeHeader: string
): { start: number; end: number }[] {
  const rangeValues = rangeHeader.replace(/bytes=/, "").split("-");
  const start = parseInt(rangeValues[0], 10) || 0;
  const end = parseInt(rangeValues[1], 10) || fileSize - 1;
  return [{ start, end }];
}

export const parseRange = ParseRange;
