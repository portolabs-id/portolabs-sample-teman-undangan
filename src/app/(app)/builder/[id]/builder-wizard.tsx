"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { TEMPLATES } from "@/lib/invitations/schema";
import { saveInvitationAction } from "./actions";
import { GalleryManager } from "./gallery-manager";

type Photo = { id: string; url: string };
type Props = { id: string; values: Record<string, string>; photos: Photo[] };

const STEPS = [
  { key: "tema", label: "Tema", hint: "Tampilan undangan" },
  { key: "mempelai", label: "Mempelai", hint: "Nama dan orang tua" },
  { key: "acara", label: "Acara", hint: "Akad, resepsi, lokasi" },
  { key: "amplop", label: "Amplop digital", hint: "Rekening hadiah" },
  { key: "galeri", label: "Galeri foto", hint: "Foto prewedding" },
] as const;

const TEMPLATE_NOTES: Record<string, string> = {
  classic: "Serif tenang, tata letak simetris",
  floral: "Ornamen bunga, warna hangat",
  modern: "Tipografi besar, banyak ruang kosong",
};

function toLocalInput(ms: string): string {
  if (!ms) return "";
  const d = new Date(Number(ms));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BuilderWizard({ id, values, photos }: Props) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState(values.template);
  const isGalleryStep = STEPS[step].key === "galeri";

  async function save(fd: FormData) {
    setSaving(true);
    try {
      await saveInvitationAction(id, fd);
      toast.success("Tersimpan");
    } catch {
      toast.error("Gagal menyimpan, coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="wizard">
      <nav className="wizard__nav" aria-label="Langkah pengisian">
        <ol>
          {STEPS.map((s, index) => (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => setStep(index)}
                className={`wizard__step ${index === step ? "is-active" : ""} ${index < step ? "is-done" : ""}`}
                aria-current={index === step ? "step" : undefined}
              >
                <span className="wizard__marker">
                  {index < step ? <Check size={13} strokeWidth={3} /> : index + 1}
                </span>
                <span>
                  <strong>{s.label}</strong>
                  <small>{s.hint}</small>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <section className="wizard__panel">
        <form action={save} hidden={isGalleryStep}>
          <div hidden={STEPS[step].key !== "tema"}>
            <h2 className="wizard__title">Tema</h2>
            <p className="wizard__lede">Pilih tampilan undangan. Bisa diganti kapan saja tanpa mengubah link.</p>
            <div className="template-picker">
              {TEMPLATES.map((t) => (
                <label key={t} className={`template-option ${template === t ? "is-selected" : ""}`}>
                  <input
                    type="radio"
                    name="template"
                    value={t}
                    checked={template === t}
                    onChange={() => setTemplate(t)}
                  />
                  <span className={`template-option__preview theme-card--${t}`}>Dinda &amp; Rafi</span>
                  <span className="template-option__name">{t}</span>
                  <span className="template-option__note">{TEMPLATE_NOTES[t]}</span>
                </label>
              ))}
            </div>
          </div>

          <div hidden={STEPS[step].key !== "mempelai"}>
            <h2 className="wizard__title">Mempelai</h2>
            <p className="wizard__lede">Nama yang tampil besar di undangan, beserta nama orang tua.</p>
            <div className="field-grid">
              <Field name="groomName" label="Nama pria" defaultValue={values.groomName} />
              <Field name="brideName" label="Nama wanita" defaultValue={values.brideName} />
              <Field name="groomParents" label="Orang tua pria" defaultValue={values.groomParents} />
              <Field name="brideParents" label="Orang tua wanita" defaultValue={values.brideParents} />
            </div>
          </div>

          <div hidden={STEPS[step].key !== "acara"}>
            <h2 className="wizard__title">Acara</h2>
            <p className="wizard__lede">Waktu akad dan resepsi dipakai untuk hitung mundur dan tombol tambah ke kalender.</p>
            <div className="field-grid">
              <Field name="akadAt" label="Akad" type="datetime-local" defaultValue={toLocalInput(values.akadAt)} />
              <Field name="resepsiAt" label="Resepsi" type="datetime-local" defaultValue={toLocalInput(values.resepsiAt)} />
              <Field name="venueName" label="Nama tempat" defaultValue={values.venueName} />
              <Field name="venueAddress" label="Alamat" defaultValue={values.venueAddress} />
              <Field name="mapsUrl" label="Link Google Maps" defaultValue={values.mapsUrl} placeholder="https://maps.app.goo.gl/…" full />
            </div>
          </div>

          <div hidden={STEPS[step].key !== "amplop"}>
            <h2 className="wizard__title">Amplop digital</h2>
            <p className="wizard__lede">Tamu melihat nomor rekening dengan tombol salin. Kosongkan jika tidak dipakai.</p>
            <div className="field-grid">
              <Field name="giftBankName" label="Bank" defaultValue={values.giftBankName} placeholder="BCA" />
              <Field name="giftAccountNumber" label="No. rekening" defaultValue={values.giftAccountNumber} />
              <Field name="giftAccountHolder" label="Atas nama" defaultValue={values.giftAccountHolder} full />
            </div>
          </div>

          <div className="wizard__bar">
            <button
              type="button"
              className="btn btn--soft"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              Sebelumnya
            </button>
            <div className="wizard__bar-right">
              <button type="submit" className="btn btn--outline" disabled={saving}>
                {saving ? "Menyimpan…" : "Simpan"}
              </button>
              <button
                type="button"
                className="btn btn--solid"
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                disabled={step === STEPS.length - 1}
              >
                Lanjut
              </button>
            </div>
          </div>
        </form>

        {isGalleryStep && (
          <div>
            <h2 className="wizard__title">Galeri foto</h2>
            <p className="wizard__lede">Foto tampil sebagai galeri di halaman undangan. Format JPG, PNG, atau WebP.</p>
            <GalleryManager id={id} photos={photos} />
            <div className="wizard__bar">
              <button type="button" className="btn btn--soft" onClick={() => setStep((s) => s - 1)}>
                Sebelumnya
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  name, label, defaultValue, type = "text", placeholder, full,
}: {
  name: string; label: string; defaultValue?: string; type?: string; placeholder?: string; full?: boolean;
}) {
  return (
    <div className={`field ${full ? "field--full" : ""}`}>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} placeholder={placeholder} defaultValue={defaultValue ?? ""} />
    </div>
  );
}
