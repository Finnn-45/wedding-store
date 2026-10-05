# Konsep Penjualan — Referensi Pasar
# Sales Concept — Market Reference

Referensi cara menjual produk template wedding website, diadaptasi dari
pola listing Etsy yang sukses (contoh: listing "Shiny Dark Brown Wedding
Website", ID 4506475794 — Etsy memblokir akses otomatis, jadi analisis memakai
pola listing sejenis yang terbuka + struktur toko Blanc itu sendiri).

Dokumen ini acuan bisnis, bukan dokumen teknis. Lihat `README.md` untuk hal
teknis dan `ADMIN.md` untuk operasi admin.

---

## 1. Anatomi Listing Yang Laku (10 elemen)

Listing Etsy dengan rating tinggi di kategori wedding website selalu punya
pola ini — semuanya **wajib ada** di halaman produk Blanc:

1. **Judul = mesin pencari.** Pola: `[Gaya] Wedding Website Template | [Nuansa] |
   [Isi: RSVP, Galeri, Travel, Registry] | [Format: Canva, editable, instant
   download]`. Di toko sendiri ini jadi `<title>`/meta + H1.
2. **Mockup di 2 device** — tampilan desktop + mobile. Calon pengantin membeli
   *tampilan*, bukan file. (Blanc sudah punya galeri `previewImages` +
   `scripts/generate-mockups`.)
3. **Demo bisa diklik** — elemen pembeda Blanc: `/templates/[slug]` dan
   `/demo/[slug]`. Listing Etsy hanya bisa melihat gambar; di sini bisa
   *menjelajah* desain. Ini keunggulan kompetitif — promosikan di copy.
4. **"What's included" eksplisit** — daftar konkret: link template Canva, PDF
   panduan setup, jumlah section, dll. Sudah ada di skema
   (`whatsIncluded`, `includedSections`).
5. **Janji delivery jelas**: "Instant digital download after purchase" +
   penjelasan step-by-step setelah bayar (akses muncul, buka Canva, ganti
   teks, publish). Tanpa janji ini, pembeli ragu.
6. **Variasi & bundle** — penjual Etsy hampir selalu menawarkan paket
   (website + save the date + invitation suite). Skema Blanc sudah punya tipe
   `save-the-date` dan `bundle` — **belum ada produknya** (belum di-seed).
7. **Harga psikologis + coret harga** — rentang pasar terlihat ±$10–$100,
   mayoritas $15–$45. Blanc di **$30** = sudah pas di tengah. Fitur
   `compareAtPrice` (diskon) + `priceFrom` (custom) sudah tersedia.
8. **Ulasan/rating** — mesin kepercayaan utama marketplace. Di toko sendiri
   harus dibangun manual (lihat §5).
9. **FAQ** — lisensi penggunaan, boleh edit apa, update gratis?, refund
   produk digital. Mengurangi beban chat.
10. **Opsi variasi** — warna/jumlah halaman. Nanti: variasi palette per desain.

## 2. Alur Pembeli (Funnel Yang Direferensikan)

```
PIN/POST (Pinterest, IG, TikTok, SEO)          ← traffic
   ↓
Halaman Produk: mockup + demo klik + harga + janji "akses instan"
   ↓
Cart → Checkout (nama, email, WA — 30 detik)   ← Fase 1: bayar manual transfer
   ↓
Order PENDING → instruksi bayar → kirim bukti via WA
   ↓
Admin konfirmasi lunas (/admin/orders/[id])
   ↓
AKSES INSTAN: halaman download → link Canva + panduan PDF
   ↓
Minta ulasan (email/WA H+1) → testimoni → kembali ke §1 elemen 8
```

Setiap tahap sudah ada sistemnya di Blanc; yang belum: **pembayaran (Fase 1)**
dan **traffic (marketing, di luar kode)**.

## 3. Peta Gap: Listing Etsy vs Blanc Sekarang

| Elemen | Listing Etsy | Blanc | Aksi |
|---|---|---|---|
| Mockup gallery | ✅ | ✅ | Pertahankan; tambah view mobile bila belum ada |
| Demo interaktif | ❌ | ✅ | Angkat jadi keunggulan di copy/iklan |
| What's included | ✅ | ✅ | Sudah terisi — audit kesesuaian dgn isi asli |
| Janji instant delivery | ✅ | ⚠️ | Tulis eksplisit di halaman produk |
| Bundle/upsell | ✅ | ⚠️ skema ada, produk kosong | Seed produk `save-the-date` + `bundle` |
| Ulasan | ✅ otomatis | ❌ | Rilis testimoni (§5) |
| FAQ | ✅ | ⚠️ cek | Tambah FAQ lisensi/refund/delivery |
| Pembayaran | ✅ instan | ❌ (503) | **Fase 1: mode manual** |
| Traffic search | ✅ (Etsy) | ❌ | Pinterest/IG/TikTok + SEO (§6) |

## 4. Harga & Positioning

- **Template $30** (Modern Ivory, Olive Green, Burgundy) — di tengah pasar
  $15–$45; jangan turunkan, gunakan `compareAtPrice` ($45 → $30) untuk momen
  promo supaya terlihat nilai, bukan murah.
- **Custom design mulai $250** — upsell nilai tinggi; pembeli template yang
  mau beda tapi malas edit jadi pelanggan jasa.
- **Bundle** (website + save the date) di harga $40–$45 → naikkan AOV,
  meniru pola "invitation suite" di Etsy.

## 5. Social Proof — Rencana 10 Ulasan Pertama

Marketplace dapat ulasan otomatis; toko sendiri harus proaktif:
1. 5–10 penjualan pertama: WA/email H+1, minta ulasan (tawarkan diskon 15%
   untuk pembelian berikutnya sebagai imbalan).
2. Tampilkan di halaman produk (bukan cuma halaman terpisah).
3. Screenshot chat testimoni dari pembeli awal = konten iklan murah.
4. Simpan sebagai data publik (tabel `reviews` bila volume mulai ada — saat
   ini belum ada, jangan ditambah sebelum ada isinya).

## 6. Traffic (pengganti "search Etsy")

Etsy kasir pembeli dari search; toko sendiri harus menanam:
1. **Pinterest** — mesin pencari utama calon pengantin. Setiap mockup = 1 pin
   (desktop + mobile), arahkan ke halaman produk. Ini kanal #1 untuk niche
   wedding.
2. **Instagram/TikTok** — video scroll demo `/demo/[slug]` ("lihat wedding
   website jadi dalam 10 menit").
3. **SEO on-page** — pola judul §1 dipakai di title/meta/H1; buat 3 landing
   per desain (slug sudah SEO-friendly).
4. **Etsy sebagai kanal tambahan (opsional)** — jual 3 desain yang sama di
   Etsy untuk traffic marketplace, masukkan insert "beli langsung di
   blancweddings" (margin penuh + data pembeli).

## 7. Checklist Aksi Berurutan

- [ ] **Fase 1: mode pembayaran manual** (checkout pending → admin konfirmasi
      → akses instan). Tanpa ini tidak ada penjualan sama sekali.
- [ ] Audit halaman produk: janji "instant download" + FAQ (lisensi, refund).
- [ ] Seed produk `save-the-date` + `bundle` (skema sudah siap).
- [ ] Supabase Auth URLs + admin pertama (dashboard).
- [ ] Konfirmasi plan hosting (Vercel Hobby = non-commercial).
- [ ] Kumpulkan 10 ulasan pertama; tampilkan di halaman produk.
- [ ] Pasang Pinterest Business + 10 pin pertama.
- [ ] Fase 2: gateway (Stripe/Midtrans/Xendit) di seam `PaymentService`.

---
*Update dokumen ini saat konsep berubah; angka pasar dikumpulkan dari listing
sejenis yang publik terlihat (Etsy memblokir scraping otomatis — cek manual
saat butuh angka segar).*
