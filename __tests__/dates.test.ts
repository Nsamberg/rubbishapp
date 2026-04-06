import { parseDDMMYYYY, getRelativeDateLabel } from '../src/utils/dates';

describe('parseDDMMYYYY', () => {
  it('parses a valid date string', () => {
    const date = parseDDMMYYYY('13/04/2026');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(3); // April = 3 (zero-indexed)
    expect(date.getDate()).toBe(13);
  });

  it('sets time to midnight', () => {
    const date = parseDDMMYYYY('06/04/2026');
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
  });
});

describe('getRelativeDateLabel', () => {
  it('returns "Today" for today', () => {
    const today = new Date();
    expect(getRelativeDateLabel(today)).toBe('Today');
  });

  it('returns "Tomorrow" for tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(getRelativeDateLabel(tomorrow)).toBe('Tomorrow');
  });

  it('returns a formatted date for dates further away', () => {
    const future = new Date(2099, 0, 15); // 15 Jan 2099
    const label = getRelativeDateLabel(future);
    expect(label).not.toBe('Today');
    expect(label).not.toBe('Tomorrow');
    expect(label).toContain('15');
  });

  it('does not return Today or Tomorrow for a past date', () => {
    const past = new Date(2000, 0, 1);
    const label = getRelativeDateLabel(past);
    expect(label).not.toBe('Today');
    expect(label).not.toBe('Tomorrow');
  });
});
