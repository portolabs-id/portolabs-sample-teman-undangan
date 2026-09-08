import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home", () => {
  it("renders the header, hero, and CTA links", () => {
    render(<Home />);
    expect(screen.getAllByText("Buat undangan").length).toBeGreaterThan(0);
    expect(screen.getByText("Masuk")).toBeInTheDocument();
    expect(screen.getByText("Saya sudah punya akun")).toBeInTheDocument();
  });

  it("renders every stat", () => {
    render(<Home />);
    expect(screen.getByText("3 tema")).toBeInTheDocument();
    expect(screen.getByText("< 5 menit")).toBeInTheDocument();
    expect(screen.getByText("Tanpa cetak")).toBeInTheDocument();
    expect(screen.getByText("1 link")).toBeInTheDocument();
  });

  it("renders every guest feature", () => {
    render(<Home />);
    expect(screen.getByText("Salam dengan namanya")).toBeInTheDocument();
    expect(screen.getByText("Hitung mundur")).toBeInTheDocument();
    expect(screen.getByText("RSVP & ucapan")).toBeInTheDocument();
    expect(screen.getByText("Peta lokasi")).toBeInTheDocument();
    expect(screen.getAllByText("Galeri foto").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Amplop digital").length).toBeGreaterThan(0);
  });

  it("renders every owner advantage", () => {
    render(<Home />);
    expect(screen.getByText("Link tidak pernah berubah")).toBeInTheDocument();
    expect(screen.getByText("Rekap kehadiran otomatis")).toBeInTheDocument();
    expect(screen.getByText("Ucapan tanpa moderasi manual")).toBeInTheDocument();
    expect(screen.getByText("Terbuka di HP apa pun")).toBeInTheDocument();
    expect(screen.getByText("Terlindung dari bot")).toBeInTheDocument();
    expect(screen.getByText("Cepat dari mana saja")).toBeInTheDocument();
  });

  it("renders every step", () => {
    render(<Home />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("Isi data pasangan dan acara")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("Pilih tema dan unggah foto")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("Bagikan link ke tamu")).toBeInTheDocument();
  });

  it("renders every theme card", () => {
    render(<Home />);
    expect(screen.getByText("Classic")).toBeInTheDocument();
    expect(screen.getByText("Serif tenang, tata letak simetris")).toBeInTheDocument();
    expect(screen.getByText("Floral")).toBeInTheDocument();
    expect(screen.getByText("Ornamen bunga, warna hangat")).toBeInTheDocument();
    expect(screen.getByText("Modern")).toBeInTheDocument();
    expect(screen.getByText("Tipografi besar, banyak ruang kosong")).toBeInTheDocument();
    expect(screen.getAllByText("Dinda & Rafi").length).toBeGreaterThan(0);
    expect(screen.getByText("DINDA & RAFI")).toBeInTheDocument();
  });

  it("renders the closing CTA and footer with the current year", () => {
    render(<Home />);
    expect(screen.getByText("Undangan pertama Anda bisa jadi malam ini")).toBeInTheDocument();
    expect(screen.getByText(`© ${new Date().getFullYear()} Teman Undangan`)).toBeInTheDocument();
    expect(screen.getByText("temanundangan.portolabs.id")).toBeInTheDocument();
    expect(screen.getByText("RSVP dan buku ucapan")).toBeInTheDocument();
    expect(screen.getByText("Berjalan di Cloudflare Workers, D1, R2, dan KV.")).toBeInTheDocument();
  });
});
