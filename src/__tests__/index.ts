import { sync } from "../index";

describe("errors", () => {
  it("throws when invoked", () => {
    expect(() => sync(null, null, null)).toThrow();
  });
});
