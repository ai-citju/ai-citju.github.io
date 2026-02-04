# SECURITY WARNING
JANGAN PERNAH menyimpan API key, secrets, atau credential apapun di repo atau file lokal (.env, .wrangler/state, dsb). Semua secrets harus dikelola melalui Cloudflare (KV atau secrets wrangler) dan hanya diinput melalui UI/Settings setelah aplikasi live.
# Rekomendasi: Generator & AI agar Produktif, Premium, dan On-Target

Dokumen ini berisi **saran dan rekomendasi** (bukan implementasi) setelah pengecekan fitur generator dan integrasi AI, agar hasil benar-benar menargetkan:

- FYP  
- SEO  
- Banyak viewer  
- Viral  
- Banyak pembeli  
- Banyak follower/subscribe  

---

## 1. Yang Sudah Sesuai & Kuat

- **Preset lengkap** (9 section) sudah dipakai di prompt lewat `buildPresetInstructions(p)`.
- **Keyword Suggest** (client + AI) dan multi-select keyword ada; bisa dipakai untuk SEO/FYP.
- **Platform rules** per platform (YouTube, TikTok, IG, dll.) sudah dimasukkan ke prompt.
- **Export CSV/JSON** dan copy per field memadai untuk produktivitas.
- **Generate Content** vs **Buat 3 variasi**: dua mode (satu platform vs banyak variasi) sudah ada.
- **Tone dari preset** di **generateVariations** (fungsi pertama) sudah dipakai; di **generateFromMain** dan **generateVariations** (fungsi kedua) masih pakai dropdown saja.

---

## 2. Yang Kurang / Perlu Diperbaiki

### 2.1 Tujuan (Goal) belum jadi “otak” utama

- **Preset** punya goal (FYP, SEO, Viewer, Viral, Penjualan) dan itu masuk ke prompt sebagai teks.
- Prompt **tidak** secara eksplisit menyuruh AI: “Konten ini harus dioptimalkan untuk: [FYP / SEO / Viewer / Viral / Penjualan / Follower].”
- **Rekomendasi:**
  - Jika ada preset → ambil `p.goal` dan tambahkan di prompt kalimat tegas, misalnya:  
    `"Tujuan konten (wajib dioptimalkan): [FYP, SEO, Viewer, Viral, Penjualan, Follower]. Sesuaikan hook, keyword, CTA, dan panjang dengan tujuan ini."`
  - Tambah opsi goal **Follower/Subscribe** di preset (multi-select) dan di `buildPresetInstructions`, lalu tekankan di prompt (CTA follow/subscribe, ajakan simpan/share).

### 2.2 Tone saat preset dipilih

- Di **generateFromMain** dan di **generateVariations** (fungsi kedua), `tone` selalu dari **dropdown** (`aiToneSelect`), bukan dari preset.
- Preset bisa punya tone panjang (mis. "Santai, persuasif, relatable, urgency ringan") yang tidak cocok dengan opsi dropdown; saat itu AI tetap dapat nilai dropdown.
- **Rekomendasi:**  
  Jika ada preset dan `p.tone` ada, pakai `p.tone` untuk prompt di **semua** alur (generateFromMain + kedua generateVariations); dropdown hanya dipakai ketika **tidak** ada preset atau preset tanpa tone.

### 2.3 History tidak berfungsi

- Menu **History** di sidebar hanya menampilkan lagi view generator (`showView('generator')`), tidak menampilkan riwayat generate.
- **Rekomendasi (pilih salah satu):**
  - **Opsi A:** Implementasi History: simpan setiap generate (timestamp, title, overview, preset, platform, hasil title/desc/hashtags) ke `localStorage` atau backend; tampilkan daftar di view History dengan opsi copy / pakai lagi.
  - **Opsi B:** Jika History tidak akan dipakai: ganti label jadi “Generator” atau sembunyikan menu History agar tidak membingungkan.

### 2.4 Duplikasi fungsi generateVariations

- Ada **dua** definisi `generateVariations`: satu di atas (lebih lengkap: languageInstruction, keywordNote, tone dari preset), satu di bawah (lebih singkat, tone dari dropdown).
- **Rekomendasi:** Satu saja fungsi `generateVariations`; panggil dari satu tempat (mis. tombol “Buat 3 variasi”). Isi prompt dan sumber tone/ keyword harus sama dengan generator utama (preset = sumber kebenaran untuk tone & goal).

### 2.5 Jumlah variasi hardcoded (3)

- Preset punya field **Jumlah Variasi Output** (`variationCount`, default 3), tapi tombol selalu “Buat 3 variasi” dan pemanggilan `generateVariations(3)` tetap 3.
- **Rekomendasi:**  
  Jika ada preset yang dipilih dan `p.variationCount` ada, panggil `generateVariations(p.variationCount)`; jika tidak, pakai 3. Bisa juga tambah input “Jumlah variasi” di UI (1–10) yang override preset.

### 2.6 Preset “Consistency Rule” tidak dipakai

- Preset punya **Consistency Rule** (aktifkan preset untuk semua output sampai diganti), tapi di generator tidak ada logic: tidak mengunci preset, tidak mengingatkan, tidak auto-apply.
- **Rekomendasi:**  
  Jika mau dipakai: saat user pilih preset dengan `consistencyRule: true`, simpan “preset aktif” (mis. di `localStorage`); di session berikutnya atau di halaman generator, auto-select preset itu dan/atau tampilkan notifikasi kecil “Preset [X] aktif untuk semua generate.” Bisa juga tambah tombol “Nonaktifkan consistency” di generator.

### 2.7 Example output (few-shot) belum dipakai optimal

- Preset punya **Example Output (Few-shot)**; di `buildPresetInstructions` hanya disambung sebagai satu kalimat “Contoh output: …”.
- **Rekomendasi:**  
  Jika `p.exampleOutput` ada, masukkan ke prompt sebagai blok terpisah, misalnya:  
  `"Contoh output yang diinginkan (ikuti gaya dan strukturnya):\n" + p.exampleOutput + "\n\nGenerate konten baru dengan gaya serupa."`  
  Jadi AI benar-benar memakai contoh sebagai referensi gaya/format.

### 2.8 Validasi input

- Generate bisa dijalankan dengan **Title** dan **Overview** kosong; hasil akan kurang kontekstual.
- **Rekomendasi:**  
  Sebelum panggil AI: jika title & overview kosong, tampilkan pesan (toast/alert): “Isi minimal Title atau Overview untuk generate.” Boleh tetap izinkan generate kalau salah satu terisi, tapi minimal satu.

### 2.9 Loading state

- Saat generate (terutama beberapa platform atau beberapa variasi), panel langsung diganti dan hasil muncul belakangan; tidak ada indikator “sedang generate”.
- **Rekomendasi:**  
  Tampilkan loading (spinner/skeleton) di panel output saat generate berjalan; hilangkan setelah semua request selesai. Untuk variasi, bisa tampilkan “Variasi 1/3 …” agar terasa progresif.

### 2.10 Platform vs preset platform

- User bisa pilih **Platform = TikTok** di dropdown, tapi **Preset = YouTube Shorts** (preset punya `platform: 'youtube'`); prompt jadi campur platform.
- **Rekomendasi:**  
  Jika preset dipilih dan preset punya `platform`:  
  - **Opsi A:** Set/sync dropdown platform ke `p.platform` (read-only saat preset dipilih), atau  
  - **Opsi B:** Tampilkan peringatan: “Preset untuk [YouTube]. Platform saat ini [TikTok]. Generate tetap pakai platform dropdown atau preset?” dan pilih salah satu secara eksplisit (mis. “Pakai platform preset” / “Pakai platform pilihan”).

---

## 3. Yang Tidak Perlu / Bisa Disederhanakan

### 3.1 Tone dropdown saat preset aktif

- Saat preset punya tone, dropdown tone bisa disabled dan hanya menampilkan “Tone dari preset”.
- **Rekomendasi:** Tetap pertahankan dropdown untuk mode “tanpa preset”; saat preset aktif, tampilkan saja ringkasan tone preset (bisa read-only text) supaya tidak double input dan tidak membingungkan.

### 3.2 Duplikasi prompt “Virality rules”

- Di **generateFromMain** ada kalimat “Virality rules: Start description with a hook … Add a clear CTA.” Di **generateVariations** tidak selalu ada.
- **Rekomendasi:** Satu blok “Virality rules” (atau “Engagement rules”) dipakai di semua prompt (generateFromMain + generateVariations), bisa diambil dari konstanta atau helper, agar konsisten dan mudah dirawat.

### 3.3 Keyword: “chosenKeyword” vs multi keyword

- **generateFromMain** hanya pakai satu keyword (`chosenKeyword` = value pertama dari select).
- **generateVariations** (yang pertama) pakai multi keyword dari `selectedOptions`.
- **Rekomendasi:** Seragamkan: di semua alur, kirim **semua keyword yang terpilih** ke prompt (mis. “Keywords: A, B, C”) agar SEO dan FYP lebih konsisten; bisa helper `getSelectedKeywords()` dipakai di generateFromMain dan generateVariations.

---

## 4. Tambahan agar “Premium” & On-Target

### 4.1 Goal eksplisit di prompt (FYP, SEO, Viewer, Viral, Pembeli, Follower)

- Tambah satu kalimat di **setiap** prompt, misalnya:  
  `"Konten harus dioptimalkan untuk: [daftar goal dari preset atau default]. FYP = hook kuat di 3 detik pertama; SEO = keyword alami di title/deskripsi; Viral = shareable & emosional; Penjualan = CTA beli jelas; Follower = CTA follow/subscribe/save."`
- **Follower/Subscribe** harus ada sebagai opsi goal di preset dan di teks ini.

### 4.2 Batas karakter per platform

- Preset punya **maxWords**; platform punya batas praktis (title 60 char, deskripsi X char).
- **Rekomendasi:** Tampilkan di UI (di bawah title/description) hitungan karakter/kata dan indikator (mis. hijau/kuning/merah) sesuai limit platform yang dipilih; opsional: beri tahu AI di prompt “Max words description: [p.maxWords or platform default].”

### 4.3 CTA mengikuti goal

- Jika goal = Penjualan → CTA harus mengarah ke beli (keranjang, link, dll.).
- Jika goal = Follower/Subscribe → CTA harus follow / subscribe / save.
- **Rekomendasi:** Di `buildPresetInstructions` atau di prompt, tambah panduan singkat: “CTA harus sesuai tujuan utama: jika Penjualan → [ctaMain]; jika Follower → ajakan follow/subscribe/save.”

### 4.4 Hashtag untuk discovery (FYP + SEO)

- Preset punya **hashtagStrategy** dan **hashtagCount**; sudah masuk ke preset instructions.
- **Rekomendasi:** Di prompt, tekankan: “Hashtag harus mix niche + keyword + 1–2 trending agar mendukung FYP dan SEO; jumlah total [hashtagCount].”

### 4.5 Satu sumber kebenaran untuk “otak” AI

- **Rekomendasi:** Definisikan satu fungsi `buildFullPrompt({ title, overview, platform, lang, preset, goals, tone, keywords, ... })` yang:
  - Menggabungkan: language, role (dari preset.role), audience (preset.targetAudience), platform rules, preset instructions (buildPresetInstructions), virality rules, goal eksplisit (FYP/SEO/Viewer/Viral/Penjualan/Follower), contoh (exampleOutput), dan format output JSON.
- **generateFromMain** dan **generateVariations** hanya baca form + preset, lalu panggil `buildFullPrompt` dan kirim ke AI. Dengan begitu “otak” ada di satu tempat, konsisten, dan mudah dirawat.

---

## 5. Ringkasan Prioritas

| Prioritas | Item | Dampak |
|-----------|------|--------|
| Tinggi | Tone dari preset dipakai di generateFromMain & semua variasi | Konsistensi output dengan preset |
| Tinggi | Goal eksplisit di prompt + opsi Follower/Subscribe | Konten benar-benar on-target (FYP, SEO, viral, jualan, follower) |
| Tinggi | Satu fungsi generateVariations + pakai preset.tone & variationCount | Kurang bug, lebih konsisten |
| Sedang | Validasi title/overview sebelum generate | Kurang generate “kosong” |
| Sedang | Loading state saat generate | UX lebih premium |
| Sedang | History riil atau hapus/rename menu History | Jelas dan tidak menyesatkan |
| Sedang | Platform vs preset platform (sync atau peringatan) | Tidak campur platform |
| Sedang | Example output sebagai few-shot di prompt | Hasil lebih sesuai gaya |
| Rendah | Consistency Rule (auto-select preset) | Sesuai desain preset |
| Rendah | Tampilan batas karakter/kata per platform | Lebih siap production |

Dengan rekomendasi di atas, generator dan AI bisa dipoles agar lebih produktif, premium, profesional, dan hasilnya benar-benar menargetkan FYP, SEO, viewer, viral, pembeli, dan follower/subscribe tanpa mengubah struktur besar—hanya penajaman prompt, satu sumber kebenaran prompt, dan perbaikan UX/validasi.
