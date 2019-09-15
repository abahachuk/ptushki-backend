export function fromStringToValueOrNull(
  val: string,
  to: StringConstructor | NumberConstructor = String,
): string | number | null {
  if (!val) {
    return null;
  }
  return to(val);
}
