test('correctly checks empty array', () => {
  const result: any[] = [];
  expect(result).toBeInstanceOf(Array);
  expect(result).toHaveLength(0);
});
