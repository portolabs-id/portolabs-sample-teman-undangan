import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Countdown } from "@/components/templates/countdown";

afterEach(() => {
  vi.useRealTimers();
});

describe("Countdown", () => {
  it("renders zero-padded digits and updates them as time advances", () => {
    vi.useFakeTimers();
    const now = Date.now();
    // 1 day, 2 hours, 3 minutes, 4 seconds ahead → single-digit hours/minutes/seconds need padding.
    const targetMs = now + ((1 * 24 + 2) * 3600 + 3 * 60 + 4) * 1000;

    render(<Countdown targetMs={targetMs} />);

    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("04")).toBeInTheDocument();
    expect(screen.getByText("Hari")).toBeInTheDocument();
    expect(screen.getByText("Jam")).toBeInTheDocument();
    expect(screen.getByText("Menit")).toBeInTheDocument();
    expect(screen.getByText("Detik")).toBeInTheDocument();

    vi.advanceTimersByTime(1000);
    // seconds ticks down by one, from 04 to 03
    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("clears the interval on unmount", () => {
    vi.useFakeTimers();
    const clearSpy = vi.spyOn(global, "clearInterval");
    const { unmount } = render(<Countdown targetMs={Date.now() + 10_000} />);

    unmount();

    expect(clearSpy).toHaveBeenCalled();
    cleanup();
  });
});
