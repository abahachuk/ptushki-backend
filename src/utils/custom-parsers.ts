export function fromStringToValueOrNull(
  val: string,
  to: StringConstructor | NumberConstructor = String,
): string | number | null {
  if (!val) {
    return null;
  }
  return to(val);
}

export function fromNumberToPaddedString(val: number, grade: number): string | null {
  if (!val || !grade) {
    return null;
  }
  return val.toString(10).padStart(grade, '0');
}
