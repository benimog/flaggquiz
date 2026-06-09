import { getDailySeed, getStockholmDateParts } from "./stockholmDate";

test("seed uses the unpadded format the app has always used", () => {
  expect(getDailySeed()).toMatch(/^\d{4}-\d{1,2}-\d{1,2}$/);
});

test("uses the Stockholm date, not the UTC date (summer, CEST = UTC+2)", () => {
  // 22:30 UTC on June 9 is 00:30 on June 10 in Stockholm
  expect(getDailySeed(new Date("2026-06-09T22:30:00Z"))).toBe("2026-6-10");
});

test("uses the Stockholm date, not the UTC date (winter, CET = UTC+1)", () => {
  // 23:30 UTC on Jan 1 is 00:30 on Jan 2 in Stockholm
  expect(getDailySeed(new Date("2026-01-01T23:30:00Z"))).toBe("2026-1-2");
});

test("does not roll over before Stockholm midnight", () => {
  // 21:59 UTC on June 9 is 23:59 on June 9 in Stockholm
  expect(getDailySeed(new Date("2026-06-09T21:59:00Z"))).toBe("2026-6-9");
  expect(getStockholmDateParts(new Date("2026-06-09T21:59:00Z"))).toEqual({
    year: 2026,
    month: 6,
    day: 9,
  });
});
