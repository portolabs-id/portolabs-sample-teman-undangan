"use client";
import { useState } from "react";
import { toast } from "sonner";

const SAMPLE_SLUG = "dinda-rafi";
const PUBLIC_HOST = "temanundangan.portolabs.id";

/**
 * The landing page signature: the sample invitation greets whoever the visitor
 * types, and the shareable link updates with it — the same `?to=` personalisation
 * every published invitation gets.
 */
export function PersonalInvite() {
  const [guest, setGuest] = useState("");
  const trimmedGuest = guest.trim();
  const greeting = trimmedGuest || "Bapak/Ibu/Saudara/i";
  const link = `${PUBLIC_HOST}/u/${SAMPLE_SLUG}${trimmedGuest ? `?to=${encodeURIComponent(trimmedGuest)}` : ""}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`https://${link}`);
      toast.success("Link disalin");
    } catch {
      toast.error("Browser menolak menyalin. Salin manual dari kolom link.");
    }
  }

  return (
    <div className="grid gap-5">
      <figure className="invite-card">
        <p className="invite-card__eyebrow">Undangan Pernikahan</p>
        <p className="invite-card__names">
          Dinda <span>&amp;</span> Rafi
        </p>
        <p className="invite-card__date">Sabtu, 12 September 2026 · Gedung Kartika, Bandung</p>
        <hr className="invite-card__rule" />
        <figcaption className="invite-card__to">
          Kepada Yth.
          <strong key={greeting}>{greeting}</strong>
        </figcaption>
      </figure>

      <div className="grid gap-2">
        <label className="field-label" htmlFor="guest">
          Tulis nama tamu
        </label>
        <input
          id="guest"
          value={guest}
          onChange={(e) => setGuest(e.target.value.slice(0, 40))}
          placeholder="Budi Santoso"
          autoComplete="off"
          className="field-input"
        />
        <div className="link-row">
          <code className="link-row__url">{link}</code>
          <button type="button" onClick={copyLink} className="link-row__copy">
            Salin link
          </button>
        </div>
      </div>
    </div>
  );
}
