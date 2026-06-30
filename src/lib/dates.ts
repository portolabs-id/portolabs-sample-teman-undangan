export type Countdown = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

export function countdownParts(targetMs: number, nowMs: number): Countdown {
  const delta = targetMs - nowMs;
  if (delta <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const s = Math.floor(delta / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: false,
  };
}

function toCalDate(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalendarUrl(o: { title: string; startMs: number; endMs: number; details: string; location: string }): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: o.title,
    dates: `${toCalDate(o.startMs)}/${toCalDate(o.endMs)}`,
    details: o.details,
    location: o.location,
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}
