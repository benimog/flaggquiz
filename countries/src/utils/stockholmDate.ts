// The daily quiz is seeded by the current date in Stockholm so every player
// gets the same flags regardless of their own timezone.

export function getStockholmDateParts(now: Date = new Date()): {
  year: number;
  month: number;
  day: number;
} {
  // sv-SE formats as "YYYY-MM-DD"; the timeZone option makes this
  // independent of the device timezone.
  const formatted = now.toLocaleDateString("sv-SE", {
    timeZone: "Europe/Stockholm",
  });
  const [year, month, day] = formatted.split("-").map(Number);
  return { year, month, day };
}

// Unpadded "YYYY-M-D" keeps the seed format the app has always used,
// so existing players' daily quiz doesn't change.
export function getDailySeed(now: Date = new Date()): string {
  const { year, month, day } = getStockholmDateParts(now);
  return `${year}-${month}-${day}`;
}
