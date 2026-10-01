# BLANC WEDDINGS — Panduan panel admin

Panduan operasional untuk panel staf di `/admin`: mengelola katalog, aset
pengiriman (Canva + setup guide), order, dan pelanggan.

Beberapa aturan supaya tidak salah paham:

- **Label tombol, status, dan pesan error di dokumen ini ditulis persis seperti
  yang muncul di layar** (bahasa Inggris), jadi mudah dicocokkan. Alamat halaman
  ditulis apa adanya, mis. `/admin/products/new`.
- **Akses hanya untuk akun dengan `profiles.role = 'admin'`.** Setiap halaman dan
  setiap aksi simpan memeriksa ulang di server (`requireAdmin()`), jadi panel
  tidak bisa dibuka dengan menyembunyikan/memalsukan sesuatu di browser.
- **Panel menulis langsung ke database Supabase** (project yang ada di
  `.env.local`). Tidak ada "draft terpisah": begitu disimpan, datanya berubah —
  dan kalau `Published` tercentang, perubahan itu langsung terlihat publik.
- **Pembayaran, email, dan WhatsApp masih simulasi.** Baca §6 sebelum menandai
  order sebagai `paid`.

## Daftar isi

1. [Masuk & keluar](#1-masuk--keluar--sign-in--sign-out)
2. [Peta panel](#2-peta-panel--what-each-screen-does)
3. [Membuat produk baru](#3-membuat-produk-baru--create-a-product)
4. [Delivery assets: Canva + setup guide](#4-delivery-assets-canva--setup-guide)
5. [Publish, unpublish, delete](#5-publish-unpublish-delete)
6. [Orders & konfirmasi pembayaran](#6-orders--konfirmasi-pembayaran)
7. [Customers](#7-customers)
8. [Menambah & mencabut admin](#8-menambah--mencabut-admin)
9. [Checklist produk baru](#9-checklist-sebelum-publish)
10. [Kalau ada yang tidak jalan](#10-kalau-ada-yang-tidak-jalan--troubleshooting)
11. [Referensi cepat](#11-referensi-cepat--quick-reference)
12. [Yang belum tersedia di panel](#12-yang-belum-tersedia-di-panel)

## 1. Masuk & keluar / Sign in & sign out

1. Buka `http://localhost:3000/admin`. Kalau belum login, otomatis diarahkan ke
   `/admin/login?next=%2Fadmin`, lalu kembali ke `/admin` setelah berhasil.
2. Isi email + password admin, klik **Sign in**. Email yang sedang login tampil
   di header panel, dengan tombol **Sign out** di sebelah kanan.
   Simpan password di password manager — **jangan** ditulis di dalam repo.
3. Belum punya akun admin? Lihat §8.

Kalau kamu terlempar keluar, artinya:

| Yang kamu lihat | Artinya |
| --- | --- |
| Tetap di halaman login / pesan dari form login | Email atau password salah |
| Dilempar ke `/account?error=forbidden` | Login **berhasil**, tapi `profiles.role` bukan `admin` |
| Dilempar ke `/admin/login?error=not-configured` | `.env.local` tidak berisi kredensial Supabase, jadi panel memang tidak bisa diakses (mode mock) |

Lupa password → reset dari Supabase (lihat §8).

## 2. Peta panel / What each screen does

| Menu | Alamat | Isi |
| --- | --- | --- |
| Dashboard | `/admin` | Revenue (hanya order `paid`), jumlah order (`paid` / `pending`), jumlah produk (`published`), 8 order terbaru, 5 produk terbaru |
| Products | `/admin/products` | Daftar katalog + pencarian (nama/slug) + filter type & status; tombol **Add a product** |
| Orders | `/admin/orders` | Daftar penjualan + pencarian (nomor order / nama / email) + filter status |
| Customers | `/admin/customers` | Akun pelanggan dari `/signup`, lengkap dengan jumlah order & total belanja |
| Delivery | `/admin/delivery` | Semua produk dengan status **Ready** / **Not configured** — daftar "mana yang bisa dikirim ke pembeli" |

Catatan: daftar produk & order menampilkan 50 baris terbaru (halaman Delivery
100). Menu aktif ditandai garis di kiri. Dashboard menampilkan peringatan kalau
Supabase belum terkonfigurasi — angka-angka di bawahnya saat itu berasal dari
katalog lokal, bukan database.

## 3. Membuat produk baru / Create a product

Satu produk = satu template Canva + satu setup guide PDF.

1. Sidebar → **Products** → **Add a product** (dari Dashboard juga ada tombolnya).
2. Isi form. Kolom bertanda `*` wajib:

| Field | Wajib | Aturan |
| --- | --- | --- |
| Name | ya | Maks 120 karakter. Nama produk, bukan nama pasangan. |
| Slug | ya | Huruf kecil, angka, tanda hubung: pola `[a-z0-9]+(-[a-z0-9]+)*`. Tidak boleh diawali/diakhiri `-` atau ada `--`. Slug ini menjadi alamat produk: `/templates/<slug>`. **Harus unik.** |
| Type | ya | `wedding-website`, `save-the-date`, `bundle`, atau `custom` |
| Style | ya | `modern`, `editorial`, `minimal`, `garden`, `classic`, `romantic`, `other` — lihat catatan di bawah |
| Price | ya | Angka, minimal `0`, tanpa titik/koma ribuan dan tanpa `Rp`. Tulis angka bulat (mis. `29`) supaya tampilan harga konsisten. |
| Compare-at price | tidak | Harga sebelum diskon. Baru tampil sebagai harga coret kalau **lebih besar** dari Price. Database menolak nilai yang lebih kecil atau sama (`check (compare_at_price > price)`), dan pesannya hanya `Could not save the product`. |
| Currency | tidak | Default `USD`, maks 3 huruf. Biarkan `USD` karena semua tampilan harga memakai `$`. |
| Cover image | tidak | **URL lengkap** (`https://…`) atau path lokal (`/images/…`). Boleh dikosongkan: kalau kosong, dipakai gambar pertama dari tabel `product_images`; kalau itu pun kosong, kartu produk tampil tanpa gambar. Belum ada tombol upload di panel. |
| Public demo URL | tidak | **Wajib `https://`** — `http://`, `javascript:`, `data:` dan URL relatif ditolak dengan `Must be a full https:// URL`. Kalau dikosongkan, otomatis memakai `/demo/<slug>`. |
| Short description | tidak | Maks 300 karakter. Dipakai di kartu produk, hasil pencarian, dan meta description. |
| Description | tidak | Maks 8000 karakter. Teks panjang di halaman produk. |
| Included sections | tidak | Satu baris = satu poin di halaman produk. |
| Features | tidak | Satu baris = satu poin keunggulan. |
| What is included | tidak | Satu baris = satu poin "yang kamu terima". |
| Published | — | Tercentang = produk tampil di toko. |
| Featured | — | Tercentang = produk ikut tampil di homepage (Hero + bagian "Featured"). |
| "Starting at" price | — | Harga tampil sebagai `Starting at $…` (untuk jasa custom/made-to-order). |

Tentang **Style**: hanya `minimal`, `garden`, dan `romantic` yang punya tombol
filter di `/shop` dan tile "Shop by style" di homepage. Produk dengan style lain
tetap muncul di toko (di bawah **All**), tetapi tidak bisa difilter. Nilai
`other` bahkan tidak punya label publik.

3. Klik **Create product** → muncul banner `Product created`.
   **Form tidak otomatis pindah ke halaman produk.** Jadi: buka **Products**,
   klik nama produknya untuk masuk ke halaman edit (di sana ada bagian
   _Delivery assets_).
4. Kalau ada yang salah, banner berhenti di `Please fix the highlighted fields`
   dan kolom yang bermasalah diberi pesan:

| Pesan | Artinya |
| --- | --- |
| `Name is required` | Kolom Name kosong |
| `Use lowercase letters, numbers and hyphens only` | Slug tidak sesuai pola |
| `Pick a type` / `Pick a style` | Nilai type/style di luar daftar yang diizinkan |
| `Price must be zero or more` | Price bukan angka, atau negatif |
| `Must be a full https:// URL` | Demo URL bukan URL `https://` |
| `Could not create the product (is the slug already used?)` | Slug sudah dipakai produk lain — ganti slug |
| `Could not save the product` | Perubahan produk gagal disimpan (biasanya koneksi/izin) |

Menambah gambar galeri: baris `product_images` belum bisa diisi dari panel
(gambar pertama dipakai sebagai cover cadangan). Lihat §12.

## 4. Delivery assets: Canva + setup guide

Ini bagian paling penting: **produk tanpa delivery asset tetap bisa dibeli, tapi
pembeli tidak menerima file apa pun.**

Cek kesiapan semua produk di **Delivery** (`/admin/delivery`):
`Ready` = sudah punya aset, `Not configured` = belum. Halaman itu juga
menghitung berapa produk yang belum bisa dikirim.

Cara mengisinya — buka halaman edit produk → bagian **Delivery assets**:

1. **Canva template URL (private)** — wajib, harus `https://`. Pakai tautan
   "view and make a copy" (bukan link edit biasa), supaya pelanggan mengedit
   salinan miliknya sendiri dan desain master tetap privat.
   Kosong → `A Canva template URL is required`.
2. **Setup guide path (private)** — wajib, dan **harus diawali `blanc-private/`**,
   contoh: `blanc-private/<id-produk>/1712345678-setup-guide.pdf`.
   Kosong → `A setup guide path is required`.
   Awalan salah → `The path must start with blanc-private/`.
3. Klik **Save delivery assets** → `Delivery assets saved`.

Upload PDF setup guide (form di bawah bagian yang sama):

- Pilih file `.pdf`, klik **Upload to private storage**.
- Aturan: hanya PDF (`The setup guide must be a PDF`), tidak boleh kosong
  (`Choose a PDF to upload`), maksimal 15 MB (`The PDF must be under 15 MB`).
- File masuk ke bucket **privat** `blanc-private`, dengan nama
  `blanc-private/<id-produk>/<timestamp>-setup-guide.pdf`.
- ⚠️ **Upload tidak otomatis mengisi kolom path.** Setelah upload berhasil,
  banner akan menampilkan path-nya: salin path itu ke **Setup guide path**, lalu
  klik **Save delivery assets**. Kalau langkah ini terlewat, Delivery tetap
  `Not configured`.

Kenapa aman: Canva URL dan path PDF tidak pernah dikirim ke halaman publik
(tidak ada kebijakan RLS publik untuk `delivery_assets`). Pelanggan hanya menerima
tautan bertanda tangan yang berlaku **120 detik**, dan itu pun hanya setelah
order-nya berstatus `paid`.

## 5. Publish, unpublish, delete

Ada di bagian paling atas halaman edit produk, di atas form.

**Publish / Unpublish** — satu klik, langsung berlaku (tidak perlu simpan):

- Tercentang `Published` → produk muncul di `/shop`, hasil pencarian, sitemap,
  dan bisa diproses checkout. Keterangannya: "Visible in the shop, search and
  sitemap."
- Tidak tercentang → "Hidden from the storefront." Produk hilang dari toko,
  pencarian, sitemap, dan halaman `/templates/<slug>`-nya jadi 404 untuk
  pengunjung. Order lama yang memuat produk ini tetap utuh.
- Banner memberi konfirmasi `Product published` / `Product unpublished`.

**Delete** — hanya bisa kalau produk **belum pernah terjual**:

- Punya riwayat penjualan → ditolak dengan `This product has sales history and
  cannot be deleted. Unpublish it instead.` Ini disengaja: baris di `order_items`
  masih menunjuk produk tersebut.
- Kalau boleh dihapus, banner menampilkan `Product deleted`. Aset privatnya
  (`delivery_assets`) dan gambar (`product_images`) ikut terhapus.
- Tidak ada undo. Kalau ragu, **Unpublish** saja.

## 6. Orders & konfirmasi pembayaran

**Daftar** (`/admin/orders`) punya kolom: Order, Customer (nama + email),
WhatsApp, Products, Total, Status, Date. Pencarian `q` mencari nomor order, nama,
dan email; filter Status berisi `all`, `pending`, `paid`, `failed`, `cancelled`,
`refunded`.

**Halaman order** (`/admin/orders/<id>`) menampilkan data pelanggan, rincian
subtotal/diskon/total, catatan dari pelanggan (kalau ada), daftar produk yang
dibeli, lalu bagian **Payment**.

Nama dan harga produk disimpan sebagai snapshot saat pembelian, jadi harga
produk bisa kamu ubah nanti tanpa mengubah isi order lama.

**Penting soal status:** pembayaran masih **simulasi** (`MockPaymentService`
selalu sukses), jadi order hasil checkout masuk sebagai `paid` — pelanggan
langsung menerima tautan akses dari halaman sukses. Bagian `Payment` hanya
menampilkan tombol konfirmasi untuk order yang **belum** `paid`.

**Confirm payment received** (untuk order yang belum `paid`):

1. Isi **Reason / reference** — wajib. Contoh: `Bank transfer received 12 Mar,
   ref 8812`. Kosong → `A reason is required for a manual confirmation`.
2. Klik **Confirm payment received** → `Order marked as paid`.

Yang terjadi di database: `status = 'paid'`, `paid_at` diisi, `confirmed_by`
diisi ID kamu, `confirmed_at` diisi waktu sekarang, `confirmation_note` diisi
alasan kamu — dan satu baris masuk ke `admin_audit_logs`. Ini **membuka akses
produk** untuk pelanggan, jadi hanya klik setelah uang benar-benar masuk.

Yang perlu diingat:

- Aksi ini **tidak mengirim notifikasi apa pun** (email & WhatsApp masih mock).
  Hubungi pelanggan lewat nomor WhatsApp di halaman order kalau perlu.
- Dari panel tidak ada tombol untuk membatalkan, refund, atau mengembalikan
  status. Untuk itu jalankan SQL langsung di Supabase SQL Editor, mis.
  `update public.orders set status = 'cancelled' where order_number = 'BW-…';`
- Order yang kamu tandai `paid` bisa diuji langsung: buka tautan `/access/<token>`
  miliknya (dari halaman sukses checkout, atau dari tabel `purchase_access`).

## 7. Customers

`/admin/customers` menampilkan akun pelanggan (dibuat sendiri oleh pelanggan di
`/signup`, `role = 'customer'`), maksimal 50 akun terbaru:

| Kolom | Isi |
| --- | --- |
| Name / Email / WhatsApp | Data profil; `—` kalau pelanggan tidak mengisinya |
| Orders | Jumlah semua order milik akun itu |
| Spend | Total nilai order berstatus `paid` saja |
| Joined | Tanggal akun dibuat |

- Akun admin **tidak** muncul di daftar ini.
- Belum ada tombol edit/hapus dari panel — perubahan data pelanggan dilakukan di
  Supabase (§8 untuk pola yang sama).
- Pelanggan yang checkout tanpa membuat akun muncul di daftar **Orders**, tetapi
  tidak di sini: kolom Orders/Spend hanya menghitung order yang terhubung ke
  akun pelanggan (`orders.user_id`).

## 8. Menambah & mencabut admin

Tidak ada pendaftaran admin dari web: `/signup` selalu menghasilkan
`role = 'customer'`, dan halaman `/admin/login` hanya untuk staf yang akunnya
sudah diangkat di database.

**Menambah admin baru:**

1. Supabase Dashboard → **Authentication → Users → Add user**: isi email +
   password, centang konfirmasi otomatis (auto-confirm).
   Trigger `on_auth_user_created` akan membuat baris `profiles` dengan
   `role = 'customer'` untuk user itu.
2. Buka **SQL Editor** dan angkat jadi admin:

   ```sql
   update public.profiles set role = 'admin' where email = 'staf@blancweddings.com';

   -- cek hasilnya
   select id, email, role, created_at from public.profiles order by created_at;
   ```

3. Staf itu bisa langsung login di `/admin` (logout–login dulu kalau sedang
   dalam sesi lain).

**Mencabut akses admin** (akun tetap ada, hanya sebagai pelanggan):

```sql
update public.profiles set role = 'customer' where email = 'staf@blancweddings.com';
```

Berlaku pada request berikutnya — tidak perlu restart apa pun.

**Ganti / reset password:** Authentication → Users → pilih user → *Reset password*
(kirim email) atau *Update password* (set langsung). Untuk akunmu sendiri, ini
jalan cepat kalau lupa password admin.

**Hapus akun:** Authentication → Users → *Delete user*. Baris `profiles`-nya ikut
terhapus (relasi `on delete cascade`), dan order lamanya tetap ada dengan
`user_id` jadi `null`.

Kalau `profiles` tidak terbentuk setelah user dibuat, berarti trigger
`on_auth_user_created` bermasalah — cek di Database → Functions/Triggers.

## 9. Checklist sebelum publish

Pakai urutan ini untuk setiap produk baru:

1. [ ] Produk tersimpan — banner `Product created`.
2. [ ] Name, Slug (unik), Type, Style, Price benar; `Short description` terisi.
3. [ ] `Description`, `Included sections`, `Features`, `What is included` terisi.
4. [ ] `Cover image` berisi URL lengkap (atau sengaja dibiarkan untuk diisi nanti).
5. [ ] `Public demo URL` berisi tautan demo `https://`, atau memang sengaja
       memakai `/demo/<slug>`.
6. [ ] Bagian **Delivery assets** tersimpan: Canva URL **dan** path PDF
       (`blanc-private/…`) → banner `Delivery assets saved`.
7. [ ] Halaman **Delivery** menunjukkan `Ready` untuk produk itu.
8. [ ] Uji beli sendiri: `/checkout` → bayar (simulasi selalu sukses) → buka
       `/access/<token>` dari halaman sukses → pastikan tautan Canva dan PDF
       benar-benar terbuka.
9. [ ] Klik **Publish** → cek `/shop`, `/templates/<slug>`, dan homepage
       (kalau `Featured` dicentang).
10. [ ] Kalau ada yang salah: **Unpublish** dulu, perbaiki, publish lagi.

Order uji coba boleh dibersihkan lewat SQL Editor:

```sql
delete from public.orders where order_number = 'BW-XXXXXXXX';
```

Baris `order_items`, `purchase_access`, dan `downloads` milik order itu ikut
terhapus.

## 10. Kalau ada yang tidak jalan / Troubleshooting

| Gejala | Kemungkinan penyebab & solusi |
| --- | --- |
| Banner `Supabase is not configured…` di halaman admin | `.env.local` tidak berisi kredensial. Isi, lalu **restart** `npm run dev` (nilai env dibaca saat server start). Verifikasi dengan `npm run db:check`. |
| Kembali ke halaman login terus | Sesi habis atau password salah. Login ulang. |
| Dilempar ke `/account?error=forbidden` | Akunmu bukan admin (`profiles.role`) → lihat §8. |
| Produk tidak muncul di `/shop` | `Published` belum dicentang — klik **Publish**. |
| Produk tidak muncul di homepage | `Featured` belum dicentang, dan `Published` harus tercentang juga. |
| Kartu produk tanpa gambar | `Cover image` kosong dan tidak ada baris `product_images`. |
| Pembeli tidak menerima file | Halaman **Delivery** masih `Not configured`: Canva URL / path PDF belum tersimpan, atau PDF belum di-upload. Ingat: upload ≠ simpan path (§4). |
| `The PDF must be under 15 MB` | Kompres PDF-nya, lalu upload ulang. |
| `This product has sales history and cannot be deleted.` | Produk pernah terjual → **Unpublish** saja. |
| `Could not create the product (is the slug already used?)` | Slug sudah dipakai. Ganti, mis. `modern-ivory-2`. |
| `Could not save the product` padahal form sudah lengkap | Biasanya **Compare-at price** lebih kecil atau sama dengan **Price** — database menolaknya. Kosongkan kolom itu atau naikkan nilainya. |
| Tombol terasa lambat (`Saving…` lama) | Repo ini ada di folder OneDrive — pindahkan ke luar OneDrive (mis. `C:\dev\wedding-store`) supaya Next.js & npm tidak ikut di-sync cloud. |
| Harga tampil aneh (mis. `$60` untuk 59.5) | Panel membulatkan tampilan harga ke angka penuh → pakai harga bulat. |
| Secret key pernah bocor / terkirim ke orang lain | Supabase → Settings → API Keys → rotate key → perbarui `.env.local` → restart dev server. |

## 11. Referensi cepat / Quick reference

**Alamat halaman**

| Alamat | Untuk |
| --- | --- |
| `/admin` | Dashboard |
| `/admin/login` | Halaman masuk staf |
| `/admin/products` | Daftar produk |
| `/admin/products/new` | Produk baru |
| `/admin/products/<id>` | Edit produk + delivery assets + publish/delete |
| `/admin/orders`, `/admin/orders/<id>` | Order & konfirmasi pembayaran |
| `/admin/customers` | Akun pelanggan |
| `/admin/delivery` | Status kesiapan aset pengiriman |

**Perintah yang berguna**

```bash
npm run dev        # jalankan situs + panel di http://localhost:3000
npm run db:check   # cek .env.local, 9 tabel, dan 2 bucket Supabase
npm run typecheck  # tsc --noEmit
```

**Isi `.env.local`** (contoh lengkap di `.env.example`)

| Variabel | Sifat |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | publik (ikut ke bundle browser) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publik, tetap dibatasi RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **rahasia, hanya server.** Membuka RLS — jangan pernah ditulis di chat, dokumen, atau git. |
| `NEXT_PUBLIC_SITE_URL` | alamat situs, dipakai untuk tautan akses pelanggan |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | email dukungan yang tampil di situs |

**Di mana kodenya**

| Berkas / folder | Isi |
| --- | --- |
| `src/app/admin/**` | Halaman panel — setiap halaman memanggil `requireAdmin()` sendiri |
| `src/app/admin/actions.ts` | Semua aksi tulis (server actions) + validasi + audit log |
| `src/lib/admin/queries.ts` | Semua baca data admin (stats, produk, order, pelanggan) |
| `src/lib/auth/guards.ts` | Aturan akses: `requireAdmin`, `requireUser`, `getSession` |
| `src/components/admin/**` | Form & kontrol panel |
| `supabase/migrations/0001_init.sql` | Skema, RLS, dan 2 storage bucket |

**Audit trail:** setiap simpan / publish / hapus / konfirmasi pembayaran menulis
satu baris ke `admin_audit_logs` (siapa, aksi apa, entitas mana, metadata).
Belum ada halamannya di panel; baca lewat SQL:

```sql
select created_at, action, entity_type, entity_id, admin_user_id
from public.admin_audit_logs
order by created_at desc
limit 50;
```

## 12. Yang belum tersedia di panel

Jujur soal batasannya, supaya tidak dicari-cari:

- **Upload cover / gambar galeri.** `Cover image` masih berupa URL teks, dan
  tabel `product_images` belum punya editor.
- **Mengubah status order** selain menandai `paid` (tidak ada refund/cancel dari UI).
- **Mengirim ulang email / pesan WhatsApp** ke pembeli.
- **Kelola role & akun staf dari UI** (masih lewat Supabase, §8), tanpa undangan
  lewat email.
- **Daftar & tindak lanjut custom inquiry** — form `/custom` masih mengirim email
  ke studio, tidak disimpan ke database.
- **Laporan penjualan / ekspor CSV.**
- **Two-factor authentication** — mengikuti pengaturan Supabase Auth.

Untuk hal teknis di luar panel (kredensial, migrasi, arsitektur), lihat
`README.md`. Kalau perilaku panel berubah, perbarui file ini di commit yang sama
supaya tetap akurat.
