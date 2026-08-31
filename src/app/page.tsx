import Link from "next/link";
import { PersonalInvite } from "@/components/landing/personal-invite";

const GUEST_FEATURES = [
  { title: "Salam dengan namanya", body: "Link personal membuka undangan dengan nama tamu yang Anda kirimi." },
  { title: "Hitung mundur", body: "Sisa waktu menuju akad berjalan langsung di halaman undangan." },
  { title: "RSVP & ucapan", body: "Tamu mengisi kehadiran dan jumlah orang; ucapan tampil di bawahnya." },
  { title: "Peta lokasi", body: "Tautan peta gedung, siap dibuka di aplikasi navigasi tamu." },
  { title: "Galeri foto", body: "Foto prewedding tampil dalam galeri, bukan lampiran terpisah." },
  { title: "Amplop digital", body: "Nomor rekening dengan tombol salin, tanpa tamu perlu mengetik ulang." },
];

const STEPS = [
  { n: "01", title: "Isi data pasangan dan acara", body: "Nama, orang tua, akad, resepsi, alamat gedung, rekening hadiah." },
  { n: "02", title: "Pilih tema dan unggah foto", body: "Tiga tema siap pakai. Ganti kapan saja tanpa mengubah link." },
  { n: "03", title: "Bagikan link ke tamu", body: "Kirim lewat WhatsApp satu per satu dengan nama masing-masing. RSVP masuk ke dashboard." },
];

const THEMES = [
  { name: "Classic", note: "Serif tenang, tata letak simetris", className: "theme-chip--classic" },
  { name: "Floral", note: "Ornamen bunga, warna hangat", className: "theme-chip--floral" },
  { name: "Modern", note: "Tipografi besar, banyak ruang kosong", className: "theme-chip--modern" },
];

export default function Home() {
  return (
    <div className="landing">
      <header className="landing__bar">
        <span className="landing__wordmark">Teman Undangan</span>
        <nav className="landing__nav">
          <Link href="/login">Masuk</Link>
          <Link href="/register" className="btn btn--solid">Buat undangan</Link>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero__copy">
            <p className="eyebrow">Undangan pernikahan digital</p>
            <h1 className="hero__title">
              Setiap tamu membuka undangan <em>dengan namanya sendiri</em>.
            </h1>
            <p className="hero__lede">
              Isi data pernikahan, pilih tema, bagikan linknya lewat WhatsApp. Kehadiran dan ucapan
              masuk ke dashboard Anda, tanpa rekap manual.
            </p>
            <div className="hero__actions">
              <Link href="/register" className="btn btn--solid btn--lg">Buat undangan</Link>
              <Link href="/login" className="btn btn--ghost btn--lg">Saya sudah punya akun</Link>
            </div>
          </div>
          <div className="hero__demo">
            <PersonalInvite />
          </div>
        </section>

        <section className="panel">
          <h2 className="section-title">Yang tamu terima</h2>
          <ul className="feature-grid">
            {GUEST_FEATURES.map((feature) => (
              <li key={feature.title} className="feature">
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel panel--tight">
          <h2 className="section-title">Tiga langkah sampai link siap</h2>
          <ol className="steps">
            {STEPS.map((step) => (
              <li key={step.n} className="step">
                <span className="step__n">{step.n}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="panel panel--tight">
          <h2 className="section-title">Tema</h2>
          <ul className="theme-grid">
            {THEMES.map((theme) => (
              <li key={theme.name} className={`theme-chip ${theme.className}`}>
                <span className="theme-chip__name">{theme.name}</span>
                <span className="theme-chip__note">{theme.note}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="closing">
          <h2>Undangan pertama Anda bisa jadi malam ini.</h2>
          <Link href="/register" className="btn btn--solid btn--lg">Buat undangan</Link>
        </section>
      </main>

      <footer className="landing__foot">
        <span>Teman Undangan</span>
        <span>Berjalan di Cloudflare Workers, D1, dan R2.</span>
      </footer>
    </div>
  );
}
