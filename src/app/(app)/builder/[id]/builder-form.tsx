"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TEMPLATES } from "@/lib/invitations/schema";
import { saveInvitationAction } from "./actions";

type Props = { id: string; values: Record<string, string> };

function toLocalInput(ms: string): string {
  if (!ms) return "";
  const d = new Date(Number(ms));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BuilderForm({ id, values }: Props) {
  const [saving, setSaving] = useState(false);
  return (
    <form
      action={async (fd) => {
        setSaving(true);
        await saveInvitationAction(id, fd);
        setSaving(false);
        toast.success("Tersimpan");
      }}
      className="grid gap-6"
    >
      <fieldset className="grid gap-3">
        <legend className="font-semibold">Tema</legend>
        <select name="template" defaultValue={values.template} className="rounded-md border p-2">
          {TEMPLATES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </fieldset>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="font-semibold">Mempelai</legend>
        <Field name="groomName" label="Nama pria" defaultValue={values.groomName} />
        <Field name="brideName" label="Nama wanita" defaultValue={values.brideName} />
        <Field name="groomParents" label="Orang tua pria" defaultValue={values.groomParents} />
        <Field name="brideParents" label="Orang tua wanita" defaultValue={values.brideParents} />
      </fieldset>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="font-semibold">Acara</legend>
        <Field name="akadAt" label="Akad" type="datetime-local" defaultValue={toLocalInput(values.akadAt)} />
        <Field name="resepsiAt" label="Resepsi" type="datetime-local" defaultValue={toLocalInput(values.resepsiAt)} />
        <Field name="venueName" label="Nama tempat" defaultValue={values.venueName} />
        <Field name="venueAddress" label="Alamat" defaultValue={values.venueAddress} />
        <Field name="mapsUrl" label="Link Google Maps" defaultValue={values.mapsUrl} />
      </fieldset>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="font-semibold">Amplop digital</legend>
        <Field name="giftBankName" label="Bank" defaultValue={values.giftBankName} />
        <Field name="giftAccountNumber" label="No. rekening" defaultValue={values.giftAccountNumber} />
        <Field name="giftAccountHolder" label="Atas nama" defaultValue={values.giftAccountHolder} />
      </fieldset>

      <Button type="submit" disabled={saving}>{saving ? "Menyimpan…" : "Simpan"}</Button>
    </form>
  );
}

function Field({ name, label, defaultValue, type = "text" }: { name: string; label: string; defaultValue?: string; type?: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} />
    </div>
  );
}
