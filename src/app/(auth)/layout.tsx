import { Check } from "lucide-react";
import { Brand } from "@/components/brand";

const SELLING_POINTS = [
  "Link personal untuk tiap tamu, lengkap dengan namanya",
  "RSVP dan ucapan masuk langsung ke dashboard",
  "Tiga tema siap pakai, bisa diganti tanpa mengubah link",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing auth">
      <aside className="auth__brand">
        <Brand />
        <h2 className="auth__headline">Undangan pernikahan digital yang menyapa tamu Anda</h2>
        <ul className="auth__points">
          {SELLING_POINTS.map((point) => (
            <li key={point}>
              <span className="auth__tick" aria-hidden="true"><Check size={13} strokeWidth={3} /></span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </aside>
      <main className="auth__form-side">{children}</main>
    </div>
  );
}
