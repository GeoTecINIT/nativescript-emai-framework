export function toTimestampWithTimezoneOffset(date: Date): any {
  return {
    value: date.getTime(),
    offset: date.getTimezoneOffset()
  };
}

export function jsonDateReplacer(key: string, value: any) {
  if (this[key] instanceof Date) {
    return toTimestampWithTimezoneOffset(this[key]);
  }

  if (typeof value === "string" && isDateString(this[key])) {
    return toTimestampWithTimezoneOffset(new Date(this[key]));
  }

  return value;
}

function isDateString(value: string): boolean {
  const possibleDate = Date.parse(value);
  return !isNaN(possibleDate);
}
