export class ColumnNumericTransformer {
  // eslint-disable-next-line class-methods-use-this
  public to(data: number | null): number | null {
    return data;
  }

  // eslint-disable-next-line class-methods-use-this
  public from(data: string | null): number | null {
    return data ? parseFloat(data) : null;
  }
}
