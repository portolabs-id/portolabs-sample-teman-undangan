import Link from "next/link";
import { PersonalInvite } from "@/components/landing/personal-invite";

const STATS = [
  { value: "3 tema", label: "Classic, Floral, dan Modern, bisa diganti kapan saja" },
  { value: "< 5 menit", label: "Dari daftar sampai link undangan siap dibagikan" },
  { value: "Tanpa cetak", label: "Tidak ada kartu tersisa dan tidak ada ongkos kirim" },
  { value: "1 link", label: "Satu tautan untuk semua tamu, tanpa aplikasi tambahan" },
];

const OWNER_ADVANTAGES = [
  { title: "Link tidak pernah berubah", body: "Ganti tema, foto, atau jam acara sesudah undangan tersebar. Tautan yang sudah dikirim tetap berlaku." },
  { title: "Rekap kehadiran otomatis", body: "Jawaban tamu langsung terkumpul di dashboard, lengkap dengan jumlah orang, siap dipakai menghitung porsi katering." },
  { title: "Ucapan tanpa moderasi manual", body: "Doa dan ucapan tampil di halaman undangan begitu tamu mengirimnya, tersimpan rapi untuk dibaca ulang." },
  { title: "Terbuka di HP apa pun", body: "Halaman biasa di browser. Tamu tidak perlu memasang aplikasi atau membuat akun untuk membuka undangan." },
  { title: "Terlindung dari bot", body: "Verifikasi Cloudflare Turnstile dan batas kiriman per menit menjaga daftar RSVP tetap berisi tamu sungguhan." },
  { title: "Cepat dari mana saja", body: "Halaman disajikan dari jaringan Cloudflare, jadi undangan terbuka cepat baik dari kota besar maupun kampung halaman." },
];

const GUEST_FEATURES = [
  { title: "Salam dengan namanya", body: "Link personal membuka undangan dengan nama tamu yang Anda kirimi." },
  { title: "Hitung mundur", body: "Sisa waktu menuju akad berjalan langsung di halaman undangan." },
  { title: "RSVP & ucapan", body: "Tamu mengisi kehadiran dan jumlah orang; ucapan tampil di bawahnya." },
  { title: "Peta lokasi", body: "Tautan peta gedung, siap dibuka di aplikasi navigasi tamu." },
  { title: "Galeri foto", body: "Foto prewedding tampil dalam galeri, bukan lampiran terpisah." },
  { title: "Amplop digital", body: "Nomor rekening dengan tombol salin, tanpa tamu perlu mengetik ulang." },
];

const STEPS = [
  { n: "01", title: "Isi data pasangan dan acara", body: "Nama, orang tua, akad, resepsi, alamat gedung, dan rekening hadiah." },
  { n: "02", title: "Pilih tema dan unggah foto", body: "Tiga tema siap pakai. Ganti kapan saja tanpa mengubah link undangan." },
  { n: "03", title: "Bagikan link ke tamu", body: "Kirim lewat WhatsApp dengan nama masing-masing. RSVP masuk ke dashboard." },
];

const THEMES = [
  { name: "Classic", note: "Serif tenang, tata letak simetris", sample: "Dinda & Rafi", className: "theme-card--classic" },
  { name: "Floral", note: "Ornamen bunga, warna hangat", sample: "Dinda & Rafi", className: "theme-card--floral" },
  { name: "Modern", note: "Tipografi besar, banyak ruang kosong", sample: "DINDA & RAFI", className: "theme-card--modern" },
];

export default function Home() {
  return (
    <div className="landing">
      <header className="landing__bar">
        <span className="landing__wordmark">Teman Undangan</span>
        <nav className="landing__nav">
          <Link href="/login" className="btn btn--soft">Masuk</Link>
          <Link href="/register" className="btn btn--solid">Buat undangan</Link>
        </nav>
      </header>

      <main>
        <section className="shell hero">
          <div>
            <p className="badge">Undangan pernikahan digital</p>
            <h1 className="hero__title">
              Setiap tamu membuka undangan <span>dengan namanya sendiri</span>
            </h1>
            <p className="hero__lede">
              Isi data pernikahan, pilih tema, bagikan linknya lewat WhatsApp. Kehadiran dan ucapan
              masuk ke dashboard Anda, tanpa rekap manual.
            </p>
            <div className="hero__actions">
              <Link href="/register" className="btn btn--solid btn--lg">Buat undangan</Link>
              <Link href="/login" className="btn btn--outline btn--lg">Saya sudah punya akun</Link>
            </div>
          </div>
          <PersonalInvite />
        </section>

        <ul className="shell cell-grid cell-grid--4 stats">
          {STATS.map((stat) => (
            <li key={stat.value}>
              <p className="stat__value">{stat.value}</p>
              <p className="stat__label">{stat.label}</p>
            </li>
          ))}
        </ul>

        <section className="shell section">
          <div className="section__head">
            <h2 className="section__title">Yang tamu terima</h2>
            <p className="section__lede">
              Satu halaman berisi semua yang biasanya tersebar di kartu, pesan broadcast, dan
              lampiran foto.
            </p>
          </div>
          <ul className="cell-grid cell-grid--3">
            {GUEST_FEATURES.map((feature) => (
              <li key={feature.title} className="feature">
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="shell section">
          <div className="section__head">
            <h2 className="section__title">Kenapa lewat Teman Undangan</h2>
            <p className="section__lede">
              Sisi yang Anda urus sebagai tuan rumah: mengubah detail acara, membaca jawaban tamu,
              dan memastikan undangan terbuka mulus di tangan siapa pun.
            </p>
          </div>
          <ul className="cell-grid cell-grid--3">
            {OWNER_ADVANTAGES.map((item) => (
              <li key={item.title} className="feature">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="shell section">
          <div className="section__head">
            <h2 className="section__title">Tiga langkah sampai link siap</h2>
          </div>
          <ol className="cell-grid cell-grid--3">
            {STEPS.map((step) => (
              <li key={step.n} className="step">
                <span className="step__n">{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="shell section">
          <div className="section__head">
            <h2 className="section__title">Tema</h2>
            <p className="section__lede">Pilih satu sekarang, ganti kapan saja. Link undangan tetap sama.</p>
          </div>
          <ul className="theme-grid">
            {THEMES.map((theme) => (
              <li key={theme.name} className={`theme-card ${theme.className}`}>
                <div className="theme-card__preview">
                  <span>{theme.sample}</span>
                </div>
                <div className="theme-card__body">
                  <h3>{theme.name}</h3>
                  <p>{theme.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="shell">
          <div className="closing">
            <h2>Undangan pertama Anda bisa jadi malam ini</h2>
            <p>Buat akun, isi data acara, lalu bagikan link personal ke tamu pertama Anda.</p>
            <Link href="/register" className="btn btn--solid btn--lg">Buat undangan</Link>
          </div>
        </section>
      </main>

      <footer className="landing__foot">
        <div className="shell cell-grid cell-grid--4">
          <div>
            <h3>Teman Undangan</h3>
            <p>Undangan pernikahan digital dengan link personal untuk setiap tamu.</p>
          </div>
          <div>
            <h3>Produk</h3>
            <ul>
              <li><Link href="/register">Buat undangan</Link></li>
              <li><Link href="/login">Masuk ke dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3>Fitur</h3>
            <ul>
              <li>RSVP dan buku ucapan</li>
              <li>Galeri foto</li>
              <li>Amplop digital</li>
            </ul>
          </div>
          <div>
            <h3>Teknologi</h3>
            <p>Berjalan di Cloudflare Workers, D1, R2, dan KV.</p>
          </div>
        </div>
        <div className="foot-note">
          <span>© {new Date().getFullYear()} Teman Undangan</span>
          <span>temanundangan.portolabs.id</span>
        </div>
      </footer>
    </div>
  );
}
