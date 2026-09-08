"use client";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { TEMPLATES } from "@/lib/invitations/schema";
import { setInvitationStatusAction } from "@/app/(app)/dashboard/actions";
import { saveInvitationAction } from "./actions";
import { GalleryManager } from "./gallery-manager";

type Photo = { id: string; url: string };
type Status = "draft" | "published";
type Props = { id: string; status: Status; values: Record<string, string>; photos: Photo[] };

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

export function BuilderWizard({ id, status, values, photos }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [template, setTemplate] = useState(values.template);
  // React resets an uncontrolled form once its Action settles, re-seeding every
  // field from the server props that are still in flight. Holding the fields in
  // client state keeps what the guest typed, whatever the revalidation does.
  const [fields, setFields] = useState<Record<string, string>>(() => ({
    ...values,
    akadAt: toLocalInput(values.akadAt),
    resepsiAt: toLocalInput(values.resepsiAt),
  }));

  function updateField(name: string, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
  }
  const isGalleryStep = STEPS[step].key === "galeri";
  const isPublished = status === "published";

  async function saveAndContinue(fd: FormData) {
    try {
      await saveInvitationAction(id, fd);
      setStep((s) => Math.min(STEPS.length - 1, s + 1));
    } catch {
      toast.error("Gagal menyimpan, coba lagi.");
    }
  }

  async function changeStatus(next: Status) {
    setPublishing(true);
    try {
      await setInvitationStatusAction(id, next);
      toast.success(next === "published" ? "Undangan terbit" : "Undangan kembali jadi draf");
      router.refresh();
    } catch {
      toast.error("Gagal mengubah status, coba lagi.");
    } finally {
      setPublishing(false);
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
        <form action={saveAndContinue} hidden={isGalleryStep}>
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
              <Field name="groomName" label="Nama pria" value={fields.groomName} onChange={updateField} />
              <Field name="brideName" label="Nama wanita" value={fields.brideName} onChange={updateField} />
              <Field name="groomParents" label="Orang tua pria" value={fields.groomParents} onChange={updateField} />
              <Field name="brideParents" label="Orang tua wanita" value={fields.brideParents} onChange={updateField} />
            </div>
          </div>

          <div hidden={STEPS[step].key !== "acara"}>
            <h2 className="wizard__title">Acara</h2>
            <p className="wizard__lede">Waktu akad dan resepsi dipakai untuk hitung mundur dan tombol tambah ke kalender.</p>
            <div className="field-grid">
              <Field name="akadAt" label="Akad" type="datetime-local" value={fields.akadAt} onChange={updateField} />
              <Field name="resepsiAt" label="Resepsi" type="datetime-local" value={fields.resepsiAt} onChange={updateField} />
              <Field name="venueName" label="Nama tempat" value={fields.venueName} onChange={updateField} />
              <Field name="venueAddress" label="Alamat" value={fields.venueAddress} onChange={updateField} />
              <Field name="mapsUrl" label="Link Google Maps" value={fields.mapsUrl} onChange={updateField} placeholder="https://maps.app.goo.gl/…" full />
            </div>
          </div>

          <div hidden={STEPS[step].key !== "amplop"}>
            <h2 className="wizard__title">Amplop digital</h2>
            <p className="wizard__lede">Tamu melihat nomor rekening dengan tombol salin. Kosongkan jika tidak dipakai.</p>
            <div className="field-grid">
              <Field name="giftBankName" label="Bank" value={fields.giftBankName} onChange={updateField} placeholder="BCA" />
              <Field name="giftAccountNumber" label="No. rekening" value={fields.giftAccountNumber} onChange={updateField} />
              <Field name="giftAccountHolder" label="Atas nama" value={fields.giftAccountHolder} onChange={updateField} full />
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
              <SaveButton />
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
              <div className="wizard__bar-right">
                <button
                  type="button"
                  className={isPublished ? "btn btn--outline" : "btn btn--solid"}
                  onClick={() => changeStatus(isPublished ? "draft" : "published")}
                  disabled={publishing}
                >
                  {publishing ? "Memproses…" : isPublished ? "Jadikan draf" : "Terbitkan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

/**
 * React entangles every state update made inside a form Action into one
 * transition, so an ad-hoc `saving` flag would never paint. `useFormStatus`
 * reads the pending state of the enclosing form instead.
 */
function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn--solid" disabled={pending}>
      {pending ? "Menyimpan…" : "Lanjut"}
    </button>
  );
}

function Field({
  name, label, value, onChange, type = "text", placeholder, full,
}: {
  name: string;
  label: string;
  value?: string;
  onChange: (name: string, value: string) => void;
  type?: string;
  placeholder?: string;
  full?: boolean;
}) {
  return (
    <div className={`field ${full ? "field--full" : ""}`}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(event) => onChange(name, event.target.value)}
      />
    </div>
  );
}
