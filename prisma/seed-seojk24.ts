/**
 * SEOJK 24 Basel Seeder Script
 *
 * This script seeds the Basel Center database with content from
 * SEOJK 24/SEOJK.03/2021 - Credit Risk RWA Calculation using Standardized Approach
 *
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-seojk24.ts
 * Or simply: npx tsx prisma/seed-seojk24.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to create TipTap JSON content with tooltips and references
function createRichContent(
  content: string,
  marks?: Array<{
    type: "tooltip" | "reference";
    text: string;
    attrs: Record<string, string | null>;
  }>
): string {
  // If no marks, return simple paragraph
  if (!marks || marks.length === 0) {
    return JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: content }],
        },
      ],
    });
  }

  // Build content with marks
  let remainingContent = content;
  const textNodes: Array<{
    type: string;
    text: string;
    marks?: Array<{ type: string; attrs?: Record<string, string | null> }>;
  }> = [];

  for (const mark of marks) {
    const markedTextIndex = remainingContent.indexOf(mark.text);
    if (markedTextIndex === -1) continue;

    // Add text before the marked text
    if (markedTextIndex > 0) {
      textNodes.push({
        type: "text",
        text: remainingContent.substring(0, markedTextIndex),
      });
    }

    // Add the marked text
    textNodes.push({
      type: "text",
      text: mark.text,
      marks: [{ type: mark.type, attrs: mark.attrs }],
    });

    remainingContent = remainingContent.substring(
      markedTextIndex + mark.text.length
    );
  }

  // Add remaining text
  if (remainingContent) {
    textNodes.push({ type: "text", text: remainingContent });
  }

  return JSON.stringify({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: textNodes,
      },
    ],
  });
}

async function main() {
  console.log("🏦 Seeding SEOJK 24 Basel Framework content...\n");

  // Check if SEOJK24 already exists
  const existingStandard = await prisma.baselStandard.findUnique({
    where: { code: "SEOJK24" },
  });

  if (existingStandard) {
    console.log("⚠️  SEOJK24 already exists. Deleting and recreating...");
    await prisma.baselStandard.delete({ where: { code: "SEOJK24" } });
  }

  // ============================================
  // Create Standard
  // ============================================
  const standard = await prisma.baselStandard.create({
    data: {
      code: "SEOJK24",
      name: "ATMR Risiko Kredit - Pendekatan Standar",
      description:
        "Surat Edaran OJK Nomor 24/SEOJK.03/2021 tentang Perhitungan Aset Tertimbang Menurut Risiko untuk Risiko Kredit dengan Menggunakan Pendekatan Standar bagi Bank Umum",
      order: 10,
    },
  });
  console.log(`✅ Created Standard: ${standard.code} - ${standard.name}`);

  // ============================================
  // Create Chapter 1: UMUM (General)
  // ============================================
  const chapter01 = await prisma.baselChapter.create({
    data: {
      code: "01",
      title: "Ketentuan Umum dan Perhitungan Tagihan Bersih",
      standardId: standard.id,
      effectiveDate: new Date("2021-01-01"),
      lastUpdate: new Date("2021-03-01"),
      status: "current",
      order: 1,
    },
  });
  console.log(`  📖 Created Chapter: SEOJK24${chapter01.code}`);

  // Section 1.1: Umum
  const section01_1 = await prisma.baselSection.create({
    data: {
      title: "Ketentuan Umum",
      chapterId: chapter01.id,
      order: 1,
    },
  });

  // Subsections for Section 1.1
  await prisma.baselSubsection.createMany({
    data: [
      {
        number: "1",
        content: createRichContent(
          "Perhitungan ATMR Risiko Kredit-Pendekatan Standar dalam rangka perhitungan KPMM untuk eksposur aset dalam laporan posisi keuangan serta kewajiban komitmen atau kewajiban kontinjensi pada TRA merupakan hasil perkalian antara tagihan bersih dan bobot risiko.",
          [
            {
              type: "tooltip",
              text: "ATMR",
              attrs: {
                definition:
                  "Aset Tertimbang Menurut Risiko (Risk-Weighted Assets)",
              },
            },
            {
              type: "tooltip",
              text: "KPMM",
              attrs: {
                definition:
                  "Kewajiban Penyediaan Modal Minimum (Minimum Capital Requirements)",
              },
            },
            {
              type: "tooltip",
              text: "TRA",
              attrs: {
                definition:
                  "Transaksi Rekening Administratif (Off-Balance Sheet Items)",
              },
            },
          ]
        ),
        sectionId: section01_1.id,
        order: 1,
      },
      {
        number: "2",
        content: createRichContent(
          "Perhitungan ATMR Risiko Kredit-Pendekatan Standar dalam rangka perhitungan KPMM untuk eksposur yang menimbulkan ATMR Risiko Kredit-Pendekatan Standar akibat kegagalan pihak lawan merupakan hasil perkalian antara tagihan bersih dan bobot risiko.",
          [
            {
              type: "tooltip",
              text: "kegagalan pihak lawan",
              attrs: {
                definition:
                  "Counterparty Credit Risk - risiko bahwa pihak lawan dalam transaksi gagal memenuhi kewajibannya",
              },
            },
          ]
        ),
        sectionId: section01_1.id,
        order: 2,
      },
      {
        number: "3",
        content: createRichContent(
          "Besaran bobot risiko ditetapkan berdasarkan: (a) peringkat terkini dari debitur atau pihak lawan dalam transaksi atau surat berharga, untuk kategori portofolio tagihan kepada pemerintah, entitas sektor publik, bank pembangunan multilateral, bank, dan korporasi; atau (b) persentase tertentu untuk kategori portofolio seperti kredit beragun properti, kredit pegawai/pensiunan, dan tagihan kepada UMKM. Lihat ketentuan lengkap pada SEOJK2402.1 untuk kategori portofolio.",
          [
            {
              type: "tooltip",
              text: "bobot risiko",
              attrs: {
                definition:
                  "Risk Weight - persentase yang mencerminkan tingkat risiko kredit dari suatu eksposur",
              },
            },
            {
              type: "reference",
              text: "SEOJK2402.1",
              attrs: {
                standardCode: "SEOJK24",
                chapterCode: "02",
                subsectionNumber: "1",
              },
            },
          ]
        ),
        sectionId: section01_1.id,
        order: 3,
      },
      {
        number: "4",
        content: createRichContent(
          "Untuk transaksi Delivery versus Payment (DvP) yang mengalami kegagalan penyelesaian lebih dari 4 hari kerja, ATMR diperhitungkan sebesar hasil perkalian antara positive current exposure, persentase tertentu berdasarkan jumlah hari kerja keterlambatan, dan faktor pengali 12,5. Persentase ditetapkan: 5-15 hari kerja (8%), 16-30 hari kerja (50%), 31-45 hari kerja (75%), dan lebih dari 45 hari kerja (100%).",
          [
            {
              type: "tooltip",
              text: "Delivery versus Payment (DvP)",
              attrs: {
                definition:
                  "Mekanisme penyelesaian transaksi dimana penyerahan instrumen keuangan terjadi bersamaan dengan pembayaran",
              },
            },
            {
              type: "tooltip",
              text: "positive current exposure",
              attrs: {
                definition:
                  "Selisih positif antara nilai wajar transaksi dan nilai kontrak",
              },
            },
          ]
        ),
        sectionId: section01_1.id,
        order: 4,
      },
    ],
  });

  // Section 1.2: Perhitungan Tagihan Bersih
  const section01_2 = await prisma.baselSection.create({
    data: {
      title: "Perhitungan Tagihan Bersih",
      chapterId: chapter01.id,
      order: 2,
    },
  });

  await prisma.baselSubsection.createMany({
    data: [
      {
        number: "5",
        content: createRichContent(
          "Untuk eksposur aset dalam laporan posisi keuangan, tagihan bersih merupakan nilai tercatat aset ditambah dengan tagihan bunga yang belum diterima (jika ada) setelah dikurangi dengan CKPN atas aset tersebut. Formula: Tagihan Bersih = {Nilai Tercatat Aset + Tagihan Bunga Belum Diterima} - CKPN. Untuk ketentuan CKPN, lihat SEOJK2401.8.",
          [
            {
              type: "tooltip",
              text: "CKPN",
              attrs: {
                definition:
                  "Cadangan Kerugian Penurunan Nilai (Loan Loss Provision) sesuai standar akuntansi keuangan",
              },
            },
            {
              type: "reference",
              text: "SEOJK2401.8",
              attrs: {
                standardCode: "SEOJK24",
                chapterCode: "01",
                subsectionNumber: "8",
              },
            },
          ]
        ),
        sectionId: section01_2.id,
        order: 1,
      },
      {
        number: "6",
        content: createRichContent(
          "Untuk eksposur TRA, tagihan bersih merupakan hasil perkalian antara nilai kewajiban komitmen atau kewajiban kontinjensi setelah dikurangi CKPN dan dikalikan dengan FKK. Formula: Tagihan Bersih = (Nilai Kewajiban Komitmen/Kontinjensi - CKPN) × FKK. Ketentuan FKK diatur pada SEOJK2401.9.",
          [
            {
              type: "tooltip",
              text: "FKK",
              attrs: {
                definition:
                  "Faktor Konversi Kredit (Credit Conversion Factor) - faktor untuk mengkonversi eksposur off-balance sheet menjadi ekuivalen kredit",
              },
            },
            {
              type: "reference",
              text: "SEOJK2401.9",
              attrs: {
                standardCode: "SEOJK24",
                chapterCode: "01",
                subsectionNumber: "9",
              },
            },
          ]
        ),
        sectionId: section01_2.id,
        order: 2,
      },
      {
        number: "7",
        content: createRichContent(
          "Untuk eksposur transaksi repo, tagihan bersih merupakan selisih positif antara nilai tercatat bersih surat berharga yang mendasari transaksi repo dan nilai tercatat kewajiban repo. Perhitungan mengikuti pendekatan komprehensif dalam teknik MRK-Agunan sebagaimana dimaksud dalam SEOJK2403.5.",
          [
            {
              type: "tooltip",
              text: "repo",
              attrs: {
                definition:
                  "Repurchase Agreement - transaksi penjualan surat berharga dengan janji untuk membeli kembali",
              },
            },
            {
              type: "tooltip",
              text: "MRK",
              attrs: {
                definition: "Mitigasi Risiko Kredit (Credit Risk Mitigation)",
              },
            },
            {
              type: "reference",
              text: "SEOJK2403.5",
              attrs: {
                standardCode: "SEOJK24",
                chapterCode: "03",
                subsectionNumber: "5",
              },
            },
          ]
        ),
        sectionId: section01_2.id,
        order: 3,
      },
      {
        number: "8",
        content: createRichContent(
          "CKPN yang diperhitungkan untuk perhitungan tagihan bersih merupakan CKPN atas aset yang teridentifikasi mengalami penurunan nilai, yaitu CKPN pada stage 2 (aset kurang baik) dan stage 3 (aset tidak baik) sesuai dengan standar akuntansi keuangan mengenai instrumen keuangan (PSAK 71).",
          [
            {
              type: "tooltip",
              text: "stage 2",
              attrs: {
                definition:
                  "Aset dengan peningkatan risiko kredit signifikan sejak pengakuan awal, namun belum mengalami penurunan nilai",
              },
            },
            {
              type: "tooltip",
              text: "stage 3",
              attrs: {
                definition:
                  "Aset yang mengalami penurunan nilai kredit (credit-impaired assets)",
              },
            },
            {
              type: "tooltip",
              text: "PSAK 71",
              attrs: {
                definition:
                  "Pernyataan Standar Akuntansi Keuangan 71 tentang Instrumen Keuangan (adopsi dari IFRS 9)",
              },
            },
          ]
        ),
        sectionId: section01_2.id,
        order: 4,
      },
    ],
  });

  // Section 1.3: Faktor Konversi Kredit
  const section01_3 = await prisma.baselSection.create({
    data: {
      title: "Faktor Konversi Kredit (FKK)",
      chapterId: chapter01.id,
      order: 3,
    },
  });

  await prisma.baselSubsection.createMany({
    data: [
      {
        number: "9",
        content: createRichContent(
          "Eksposur TRA dikonversi menjadi ekuivalen eksposur kredit menggunakan FKK. Untuk fasilitas dengan komitmen, jumlah yang committed namun belum ditarik akan dikalikan dengan FKK. Komitmen termasuk fasilitas yang dapat dibatalkan oleh Bank tanpa pemberitahuan. Ketentuan FKK yang berlaku dapat dilihat pada SEOJK2401.10 hingga SEOJK2401.14.",
          [
            {
              type: "tooltip",
              text: "komitmen",
              attrs: {
                definition:
                  "Kontrak yang ditawarkan Bank dan diterima pihak lawan untuk pemberian kredit, pembelian aset, atau pengambilalihan risiko gagal bayar",
              },
            },
            {
              type: "reference",
              text: "SEOJK2401.10",
              attrs: {
                standardCode: "SEOJK24",
                chapterCode: "01",
                subsectionNumber: "10",
              },
            },
          ]
        ),
        sectionId: section01_3.id,
        order: 1,
      },
      {
        number: "10",
        content: createRichContent(
          "FKK 10% diberikan untuk eksposur TRA dalam bentuk komitmen yang dapat dibatalkan Bank tanpa pemberitahuan, atau dapat secara otomatis membatalkan komitmen apabila terjadi penurunan kualitas debitur. Ini merupakan FKK terendah yang diterapkan.",
          [
            {
              type: "tooltip",
              text: "FKK 10%",
              attrs: {
                definition:
                  "Faktor konversi untuk komitmen yang paling mudah dibatalkan dan memiliki risiko terendah",
              },
            },
          ]
        ),
        sectionId: section01_3.id,
        order: 2,
      },
      {
        number: "11",
        content: createRichContent(
          "FKK 20% diberikan untuk eksposur TRA dalam bentuk kewajiban komitmen berupa L/C dengan jangka waktu perjanjian sampai dengan 1 tahun, tidak termasuk SBLC, baik terhadap Bank penerbit (issuing bank) maupun Bank yang melakukan konfirmasi (confirming bank).",
          [
            {
              type: "tooltip",
              text: "L/C",
              attrs: {
                definition:
                  "Letter of Credit - surat jaminan pembayaran yang diterbitkan bank atas permintaan nasabah",
              },
            },
            {
              type: "tooltip",
              text: "SBLC",
              attrs: {
                definition:
                  "Standby Letter of Credit - jaminan bank yang berfungsi sebagai back-up payment jika terjadi wanprestasi",
              },
            },
          ]
        ),
        sectionId: section01_3.id,
        order: 3,
      },
      {
        number: "12",
        content: createRichContent(
          "FKK 40% diberikan untuk eksposur TRA dalam bentuk kewajiban komitmen tanpa melihat jangka waktu fasilitas yang mendasari, kecuali kewajiban komitmen tersebut memenuhi syarat untuk FKK yang lebih rendah (10% atau 20%).",
          []
        ),
        sectionId: section01_3.id,
        order: 4,
      },
      {
        number: "13",
        content: createRichContent(
          "FKK 50% diberikan untuk: (a) fasilitas berupa Note Issuance Facilities (NIFs) dan Revolving Underwriting Facilities (RUFs), tanpa melihat jatuh tempo; atau (b) kewajiban kontinjensi dalam bentuk jaminan yang diterbitkan bukan dalam rangka pemberian kredit, seperti bid bonds, performance bonds, atau advance payment bonds.",
          [
            {
              type: "tooltip",
              text: "Note Issuance Facilities",
              attrs: {
                definition:
                  "Fasilitas yang memungkinkan peminjam untuk menerbitkan surat utang jangka pendek secara berkala",
              },
            },
            {
              type: "tooltip",
              text: "performance bonds",
              attrs: {
                definition:
                  "Jaminan bank yang menjamin pelaksanaan kontrak oleh kontraktor sesuai spesifikasi",
              },
            },
          ]
        ),
        sectionId: section01_3.id,
        order: 5,
      },
      {
        number: "14",
        content: createRichContent(
          "FKK 100% diberikan untuk: (a) jaminan yang diterbitkan dalam rangka pemberian kredit atau pengambilalihan risiko gagal bayar, termasuk bank garansi dan SBLC; (b) akseptasi, termasuk endorsemen atau aval atas surat berharga; atau (c) TRA yang merupakan substitusi kredit yang tidak secara eksplisit masuk dalam kategori lain. Untuk teknik MRK, lihat SEOJK2403.1.",
          [
            {
              type: "tooltip",
              text: "akseptasi",
              attrs: {
                definition:
                  "Pernyataan kesanggupan bank untuk membayar wesel pada saat jatuh tempo",
              },
            },
            {
              type: "tooltip",
              text: "aval",
              attrs: {
                definition:
                  "Jaminan pembayaran yang diberikan oleh pihak ketiga atas surat berharga",
              },
            },
            {
              type: "reference",
              text: "SEOJK2403.1",
              attrs: {
                standardCode: "SEOJK24",
                chapterCode: "03",
                subsectionNumber: "1",
              },
            },
          ]
        ),
        sectionId: section01_3.id,
        order: 6,
      },
    ],
  });

  // ============================================
  // Create Chapter 2: PENETAPAN BOBOT RISIKO
  // ============================================
  const chapter02 = await prisma.baselChapter.create({
    data: {
      code: "02",
      title: "Penetapan Bobot Risiko Kategori Portofolio",
      standardId: standard.id,
      effectiveDate: new Date("2021-01-01"),
      lastUpdate: new Date("2021-03-01"),
      status: "current",
      order: 2,
    },
  });
  console.log(`  📖 Created Chapter: SEOJK24${chapter02.code}`);

  // Section 2.1: Tagihan kepada Pemerintah
  const section02_1 = await prisma.baselSection.create({
    data: {
      title: "Tagihan kepada Pemerintah",
      chapterId: chapter02.id,
      order: 1,
    },
  });

  await prisma.baselSubsection.createMany({
    data: [
      {
        number: "1",
        content: createRichContent(
          "Tagihan kepada Pemerintah Indonesia mencakup tagihan kepada: pemerintah pusat RI, OJK, Bank Indonesia, LPS, badan/lembaga pemerintah yang pendanaannya dari APBN, lembaga pembiayaan ekspor (LPEI), dan lembaga pengelola investasi pemerintah (INA). Untuk tagihan kepada pemerintah negara lain, lihat SEOJK2402.2.",
          [
            {
              type: "tooltip",
              text: "OJK",
              attrs: {
                definition:
                  "Otoritas Jasa Keuangan - lembaga pengawas sektor jasa keuangan Indonesia",
              },
            },
            {
              type: "tooltip",
              text: "LPS",
              attrs: {
                definition:
                  "Lembaga Penjamin Simpanan - lembaga yang menjamin simpanan nasabah bank",
              },
            },
            {
              type: "tooltip",
              text: "INA",
              attrs: {
                definition:
                  "Indonesia Investment Authority - lembaga pengelola investasi pemerintah (sovereign wealth fund)",
              },
            },
            {
              type: "reference",
              text: "SEOJK2402.2",
              attrs: {
                standardCode: "SEOJK24",
                chapterCode: "02",
                subsectionNumber: "2",
              },
            },
          ]
        ),
        sectionId: section02_1.id,
        order: 1,
      },
      {
        number: "2",
        content: createRichContent(
          "Bobot risiko tagihan kepada pemerintah Indonesia (baik rupiah maupun valas) ditetapkan sebesar 0%. Untuk tagihan kepada pemerintah negara lain, bobot risiko ditetapkan berdasarkan peringkat internasional: AAA s.d. AA- = 0%, A+ s.d. A- = 20%, BBB+ s.d. BBB- = 50%, BB+ s.d. B- = 100%, di bawah B- = 150%, tanpa peringkat = 100%.",
          [
            {
              type: "tooltip",
              text: "0%",
              attrs: {
                definition:
                  "Bobot risiko nol mencerminkan risiko kredit yang dianggap negligible karena dijamin penuh oleh pemerintah",
              },
            },
          ]
        ),
        sectionId: section02_1.id,
        order: 2,
      },
    ],
  });

  // Section 2.2: Tagihan kepada Entitas Sektor Publik
  const section02_2 = await prisma.baselSection.create({
    data: {
      title: "Tagihan kepada Entitas Sektor Publik",
      chapterId: chapter02.id,
      order: 2,
    },
  });

  await prisma.baselSubsection.createMany({
    data: [
      {
        number: "3",
        content: createRichContent(
          "Tagihan kepada entitas sektor publik mencakup: BUMN (kecuali bank dan LJK), pemerintah daerah (provinsi/kota/kabupaten), dan badan/lembaga pemerintah yang tidak memenuhi kriteria tagihan kepada pemerintah Indonesia sebagaimana dimaksud dalam SEOJK2402.1.",
          [
            {
              type: "tooltip",
              text: "BUMN",
              attrs: {
                definition:
                  "Badan Usaha Milik Negara - badan usaha yang seluruh atau sebagian besar modalnya dimiliki negara",
              },
            },
            {
              type: "tooltip",
              text: "LJK",
              attrs: {
                definition:
                  "Lembaga Jasa Keuangan - lembaga yang bergerak di sektor jasa keuangan",
              },
            },
            {
              type: "reference",
              text: "SEOJK2402.1",
              attrs: {
                standardCode: "SEOJK24",
                chapterCode: "02",
                subsectionNumber: "1",
              },
            },
          ]
        ),
        sectionId: section02_2.id,
        order: 1,
      },
      {
        number: "4",
        content: createRichContent(
          "Bobot risiko tagihan kepada entitas sektor publik: AAA s.d. AA- = 20%, A+ s.d. BBB- = 50%, BB+ s.d. B- = 100%, di bawah B- = 150%, tanpa peringkat = 50%. Untuk tagihan kepada bank, lihat SEOJK2402.5.",
          [
            {
              type: "reference",
              text: "SEOJK2402.5",
              attrs: {
                standardCode: "SEOJK24",
                chapterCode: "02",
                subsectionNumber: "5",
              },
            },
          ]
        ),
        sectionId: section02_2.id,
        order: 2,
      },
    ],
  });

  // Section 2.3: Tagihan kepada Bank
  const section02_3 = await prisma.baselSection.create({
    data: {
      title: "Tagihan kepada Bank",
      chapterId: chapter02.id,
      order: 3,
    },
  });

  await prisma.baselSubsection.createMany({
    data: [
      {
        number: "5",
        content: createRichContent(
          "Tagihan kepada bank mencakup tagihan kepada bank yang beroperasi di Indonesia (bank umum dan BPR, termasuk kantor cabang bank asing) serta bank yang beroperasi di luar Indonesia. Tagihan jangka pendek adalah tagihan dengan jangka waktu sampai dengan 3 bulan, sedangkan jangka panjang lebih dari 3 bulan.",
          [
            {
              type: "tooltip",
              text: "BPR",
              attrs: {
                definition:
                  "Bank Perkreditan Rakyat - bank yang melaksanakan kegiatan usaha secara konvensional atau berdasarkan prinsip syariah dalam kegiatannya tidak memberikan jasa dalam lalu lintas pembayaran",
              },
            },
          ]
        ),
        sectionId: section02_3.id,
        order: 1,
      },
      {
        number: "6",
        content: createRichContent(
          "Pendekatan PRKE (Penilaian Risiko Kredit Eksternal) untuk bank berperingkat: Jangka Pendek - AAA s.d. A- = 20%, BBB+ s.d. BBB- = 20%, BB+ s.d. B- = 50%, di bawah B- = 150%. Jangka Panjang - AAA s.d. AA- = 20%, A+ s.d. A- = 30%, BBB+ s.d. BBB- = 50%, BB+ s.d. B- = 100%, di bawah B- = 150%.",
          [
            {
              type: "tooltip",
              text: "PRKE",
              attrs: {
                definition:
                  "Penilaian Risiko Kredit Eksternal (External Credit Risk Assessment) - pendekatan menggunakan peringkat dari lembaga pemeringkat eksternal",
              },
            },
          ]
        ),
        sectionId: section02_3.id,
        order: 2,
      },
      {
        number: "7",
        content: createRichContent(
          "Pendekatan PRKS (Penilaian Risiko Kredit Standar) untuk bank tanpa peringkat: Kualitas A (bank yang memenuhi persyaratan modal dan buffer sepenuhnya) = 40% jangka panjang, 20% jangka pendek. Kualitas B (bank yang memenuhi persyaratan modal minimum saja) = 75% jangka panjang, 50% jangka pendek. Kualitas C (bank dengan risiko tinggi) = 150% untuk semua jangka waktu.",
          [
            {
              type: "tooltip",
              text: "PRKS",
              attrs: {
                definition:
                  "Penilaian Risiko Kredit Standar (Standardized Credit Risk Assessment) - pendekatan untuk bank tanpa peringkat menggunakan kriteria kualitas A, B, atau C",
              },
            },
            {
              type: "tooltip",
              text: "buffer",
              attrs: {
                definition:
                  "Tambahan modal di atas persyaratan minimum, seperti capital conservation buffer dan countercyclical buffer",
              },
            },
          ]
        ),
        sectionId: section02_3.id,
        order: 3,
      },
    ],
  });

  // Section 2.4: Kredit Beragun Properti
  const section02_4 = await prisma.baselSection.create({
    data: {
      title: "Kredit Beragun Properti",
      chapterId: chapter02.id,
      order: 4,
    },
  });

  await prisma.baselSubsection.createMany({
    data: [
      {
        number: "8",
        content: createRichContent(
          "Kredit beragun properti rumah tinggal mencakup kredit yang dijamin dengan agunan properti untuk dihuni (rumah tinggal/apartemen, tidak termasuk ruko/rukan). Properti harus selesai dibangun, sah secara hukum, memiliki hak tanggungan yang sah, dan debitur memiliki kemampuan bayar. Nilai LTV harus dihitung berdasarkan nilai terendah antara nilai pengikatan dan nilai pasar agunan yang dinilai ulang berkala setiap 30 bulan. Untuk kredit beragun properti komersial, lihat SEOJK2402.10.",
          [
            {
              type: "tooltip",
              text: "LTV",
              attrs: {
                definition:
                  "Loan to Value - rasio perbandingan nilai kredit dengan nilai agunan properti",
              },
            },
            {
              type: "tooltip",
              text: "hak tanggungan",
              attrs: {
                definition:
                  "Hak jaminan yang dibebankan pada hak atas tanah untuk pelunasan utang tertentu yang memberikan kedudukan yang diutamakan kepada kreditur",
              },
            },
            {
              type: "reference",
              text: "SEOJK2402.10",
              attrs: {
                standardCode: "SEOJK24",
                chapterCode: "02",
                subsectionNumber: "10",
              },
            },
          ]
        ),
        sectionId: section02_4.id,
        order: 1,
      },
      {
        number: "9",
        content: createRichContent(
          "Bobot risiko kredit beragun properti rumah tinggal (tidak bergantung arus kas properti, memenuhi persyaratan): LTV ≤50% = 20%, 50%<LTV≤60% = 25%, 60%<LTV≤80% = 30%, 80%<LTV≤90% = 40%, 90%<LTV≤100% = 50%, LTV>100% = 70%. Jika tidak memenuhi persyaratan: 75% untuk perorangan, 85% untuk UMK.",
          []
        ),
        sectionId: section02_4.id,
        order: 2,
      },
      {
        number: "10",
        content: createRichContent(
          "Kredit beragun properti komersial (termasuk ruko/rukan) harus memenuhi persyaratan umum yang relevan sama seperti properti rumah tinggal. Bobot risiko (bergantung arus kas properti, memenuhi persyaratan): LTV≤60% = 70%, 60%<LTV≤80% = 90%, LTV>80% = 110%. Tidak memenuhi persyaratan = 150%.",
          [
            {
              type: "tooltip",
              text: "bergantung arus kas properti",
              attrs: {
                definition:
                  "Kredit dimana paling sedikit 50% pendapatan debitur untuk pembayaran kredit berasal dari arus kas properti seperti penyewaan atau penjualan",
              },
            },
          ]
        ),
        sectionId: section02_4.id,
        order: 3,
      },
    ],
  });

  // Section 2.5: Tagihan kepada UMKM dan Ritel
  const section02_5 = await prisma.baselSection.create({
    data: {
      title: "Tagihan kepada UMKM dan Portofolio Ritel",
      chapterId: chapter02.id,
      order: 5,
    },
  });

  await prisma.baselSubsection.createMany({
    data: [
      {
        number: "11",
        content: createRichContent(
          "Tagihan kepada usaha mikro, kecil, dan portofolio ritel mencakup tagihan kepada badan usaha UMK sesuai UU UMKM atau perorangan, yang tidak masuk kategori kredit properti atau kredit pegawai. Persyaratan: plafon maksimal Rp5 miliar, bukan 50 debitur terbesar, bukan surat berharga/derivatif, dan plafon maksimal 0,2% dari total plafon portofolio reguler.",
          [
            {
              type: "tooltip",
              text: "UMK",
              attrs: {
                definition:
                  "Usaha Mikro dan Kecil sesuai kriteria UU No. 20 Tahun 2008 tentang UMKM",
              },
            },
          ]
        ),
        sectionId: section02_5.id,
        order: 1,
      },
      {
        number: "12",
        content: createRichContent(
          "Bobot risiko UMKM dan ritel yang memenuhi persyaratan: 45% untuk debitur transactor (kartu kredit dilunasi penuh setiap bulan selama 12 bulan terakhir atau overdraft tanpa penarikan 12 bulan terakhir), 75% untuk debitur lainnya. Tidak memenuhi persyaratan: 85% untuk UMK, 100% untuk perorangan. Untuk tagihan kepada korporasi, lihat SEOJK2402.13.",
          [
            {
              type: "tooltip",
              text: "transactor",
              attrs: {
                definition:
                  "Debitur yang menggunakan fasilitas kredit secara transaksional dan melunasi penuh pada setiap tanggal pembayaran",
              },
            },
            {
              type: "reference",
              text: "SEOJK2402.13",
              attrs: {
                standardCode: "SEOJK24",
                chapterCode: "02",
                subsectionNumber: "13",
              },
            },
          ]
        ),
        sectionId: section02_5.id,
        order: 2,
      },
    ],
  });

  // Section 2.6: Tagihan kepada Korporasi
  const section02_6 = await prisma.baselSection.create({
    data: {
      title: "Tagihan kepada Korporasi",
      chapterId: chapter02.id,
      order: 6,
    },
  });

  await prisma.baselSubsection.createMany({
    data: [
      {
        number: "13",
        content: createRichContent(
          "Tagihan kepada korporasi mencakup tagihan berupa pinjaman atau surat utang kepada korporasi yang tidak masuk kategori portofolio lain, termasuk perusahaan asuransi. Dibedakan menjadi eksposur korporasi umum dan eksposur pembiayaan khusus (project finance, object finance, commodities finance).",
          [
            {
              type: "tooltip",
              text: "pembiayaan khusus",
              attrs: {
                definition:
                  "Specialized Lending - pembiayaan dimana sumber pembayaran utama berasal dari aset atau proyek yang dibiayai, bukan kapasitas umum debitur",
              },
            },
          ]
        ),
        sectionId: section02_6.id,
        order: 1,
      },
      {
        number: "14",
        content: createRichContent(
          "Bobot risiko korporasi berperingkat: AAA s.d. AA- = 20%, A+ s.d. A- = 50%, BBB+ s.d. BBB- = 75%, BB+ s.d. BB- = 100%, di bawah BB- = 150%. Tanpa peringkat = 100%, atau 85% untuk KKM (Korporasi Kecil Menengah dengan penjualan ≤Rp500 miliar/tahun). Pembiayaan proyek tanpa peringkat: fase pra-operasional = 130%, operasional = 100%, operasional berkualitas tinggi = 80%.",
          [
            {
              type: "tooltip",
              text: "KKM",
              attrs: {
                definition:
                  "Korporasi Kecil dan Menengah - korporasi dengan total penjualan tahunan konsolidasi ≤ Rp500 miliar",
              },
            },
          ]
        ),
        sectionId: section02_6.id,
        order: 2,
      },
    ],
  });

  // ============================================
  // Create Chapter 3: TEKNIK MITIGASI RISIKO KREDIT
  // ============================================
  const chapter03 = await prisma.baselChapter.create({
    data: {
      code: "03",
      title: "Teknik Mitigasi Risiko Kredit",
      standardId: standard.id,
      effectiveDate: new Date("2021-01-01"),
      lastUpdate: new Date("2021-03-01"),
      status: "current",
      order: 3,
    },
  });
  console.log(`  📖 Created Chapter: SEOJK24${chapter03.code}`);

  // Section 3.1: Prinsip Umum MRK
  const section03_1 = await prisma.baselSection.create({
    data: {
      title: "Prinsip Umum Mitigasi Risiko Kredit",
      chapterId: chapter03.id,
      order: 1,
    },
  });

  await prisma.baselSubsection.createMany({
    data: [
      {
        number: "1",
        content: createRichContent(
          "Bank dapat mengakui keberadaan agunan, garansi, penjaminan, atau asuransi kredit sebagai teknik MRK dalam menghitung ATMR. Teknik MRK mencakup: MRK-Agunan, MRK-Garansi, dan MRK-Penjaminan/Asuransi Kredit. Prinsip utama: teknik MRK hanya diakui jika ATMR setelah MRK lebih rendah dari sebelum MRK, tidak boleh diperhitungkan ganda, masa berlaku pengikatan minimal sama dengan sisa jangka waktu eksposur, dan kualitas MRK tidak berkorelasi positif dengan eksposur.",
          [
            {
              type: "tooltip",
              text: "tidak berkorelasi positif",
              attrs: {
                definition:
                  "Kualitas agunan/jaminan tidak boleh memburuk bersamaan dengan memburuknya kualitas debitur",
              },
            },
          ]
        ),
        sectionId: section03_1.id,
        order: 1,
      },
      {
        number: "2",
        content: createRichContent(
          "Kriteria teknik MRK: dokumen harus memenuhi ketentuan perundang-undangan, Bank harus melakukan kaji ulang berkala untuk memastikan kriteria terpenuhi, dan dokumentasi harus memuat klausula jangka waktu wajar untuk eksekusi atau pencairan. Dalam rangka optimasi MRK, Bank harus memiliki prosedur tertulis untuk identifikasi, pengukuran, pemantauan, dan pengendalian risiko yang timbul dari penggunaan MRK.",
          []
        ),
        sectionId: section03_1.id,
        order: 2,
      },
    ],
  });

  // Section 3.2: MRK-Agunan
  const section03_2 = await prisma.baselSection.create({
    data: {
      title: "Teknik MRK-Agunan",
      chapterId: chapter03.id,
      order: 2,
    },
  });

  await prisma.baselSubsection.createMany({
    data: [
      {
        number: "3",
        content: createRichContent(
          "Pengakuan MRK-Agunan menggunakan 2 pendekatan: (a) Pendekatan Sederhana (simple approach) untuk eksposur aset dalam laporan posisi keuangan serta TRA; atau (b) Pendekatan Komprehensif (comprehensive approach) untuk eksposur akibat kegagalan pihak lawan. Agunan tidak boleh diterbitkan oleh debitur yang sama.",
          [
            {
              type: "tooltip",
              text: "Pendekatan Sederhana",
              attrs: {
                definition:
                  "Metode substitusi dimana bobot risiko agunan menggantikan bobot risiko eksposur untuk bagian yang dijamin",
              },
            },
            {
              type: "tooltip",
              text: "Pendekatan Komprehensif",
              attrs: {
                definition:
                  "Metode dengan memperhitungkan haircut terhadap nilai eksposur dan agunan untuk mengantisipasi volatilitas nilai",
              },
            },
          ]
        ),
        sectionId: section03_2.id,
        order: 1,
      },
      {
        number: "4",
        content: createRichContent(
          "Jenis agunan keuangan yang diakui: uang tunai di Bank penyedia dana, giro/tabungan/deposito yang diterbitkan Bank penyedia dana, emas yang disimpan di Bank, SUN, SBSN, SBI, SBIS, dan surat berharga berperingkat minimal BBB- (obligasi pemerintah/PSE/bank) atau A- (obligasi korporasi) atau A-2 (surat berharga jangka pendek).",
          [
            {
              type: "tooltip",
              text: "SUN",
              attrs: {
                definition:
                  "Surat Utang Negara - obligasi negara dan surat perbendaharaan negara yang diterbitkan pemerintah Indonesia",
              },
            },
            {
              type: "tooltip",
              text: "SBSN",
              attrs: {
                definition: "Surat Berharga Syariah Negara (sukuk negara)",
              },
            },
            {
              type: "tooltip",
              text: "SBI",
              attrs: {
                definition:
                  "Sertifikat Bank Indonesia - surat berharga yang diterbitkan Bank Indonesia",
              },
            },
          ]
        ),
        sectionId: section03_2.id,
        order: 2,
      },
      {
        number: "5",
        content: createRichContent(
          "Pada pendekatan komprehensif, nilai tagihan bersih dikurangi nilai agunan setelah haircut. Haircut untuk tagihan bersih (He) adalah faktor penambah, sedangkan haircut untuk agunan (Hc) adalah faktor pengurang. Jika mata uang eksposur dan agunan berbeda, haircut nilai tukar (Hfx) sebesar 8% juga diterapkan. Formula: E* = E × (1 + He) - C × (1 - Hc - Hfx).",
          [
            {
              type: "tooltip",
              text: "haircut",
              attrs: {
                definition:
                  "Pemotongan nilai untuk mengantisipasi volatilitas nilai pasar agunan atau eksposur selama holding period",
              },
            },
          ]
        ),
        sectionId: section03_2.id,
        order: 3,
      },
    ],
  });

  // Section 3.3: MRK-Garansi
  const section03_3 = await prisma.baselSection.create({
    data: {
      title: "Teknik MRK-Garansi",
      chapterId: chapter03.id,
      order: 3,
    },
  });

  await prisma.baselSubsection.createMany({
    data: [
      {
        number: "6",
        content: createRichContent(
          "Persyaratan garansi yang diakui: Bank memiliki hak tagih langsung kepada penerbit garansi tanpa tindakan hukum terlebih dahulu, tagihan dinyatakan spesifik dalam perjanjian, bersifat irrevocable dan unconditional, dicairkan maksimal 90 hari sejak eksposur masuk kategori jatuh tempo, dan telah diakui sebagai kewajiban dalam pembukuan penerbit garansi. Untuk MRK-Penjaminan, lihat SEOJK2403.7.",
          [
            {
              type: "tooltip",
              text: "irrevocable",
              attrs: {
                definition:
                  "Tidak dapat dibatalkan - penerbit garansi tidak dapat mencabut atau mengubah komitmen garansi secara sepihak",
              },
            },
            {
              type: "tooltip",
              text: "unconditional",
              attrs: {
                definition:
                  "Tidak ada klausula di luar kendali bank yang dapat menghalangi penerbit garansi dari kewajiban membayar",
              },
            },
            {
              type: "reference",
              text: "SEOJK2403.7",
              attrs: {
                standardCode: "SEOJK24",
                chapterCode: "03",
                subsectionNumber: "7",
              },
            },
          ]
        ),
        sectionId: section03_3.id,
        order: 1,
      },
    ],
  });

  // Section 3.4: MRK-Penjaminan/Asuransi Kredit
  const section03_4 = await prisma.baselSection.create({
    data: {
      title: "Teknik MRK-Penjaminan/Asuransi Kredit",
      chapterId: chapter03.id,
      order: 4,
    },
  });

  await prisma.baselSubsection.createMany({
    data: [
      {
        number: "7",
        content: createRichContent(
          "Penjaminan/asuransi kredit oleh lembaga BUMN diakui untuk kredit UMKM dengan persyaratan: pangsa penjaminan minimal 70%, klaim diajukan maksimal 1 bulan sejak kualitas menjadi Diragukan, pembayaran klaim maksimal 15 hari kerja, jangka waktu minimal sama dengan kredit, bersifat irrevocable dan unconditional. Bobot risiko bagian yang dijamin = 20%. Ketentuan umum perhitungan ada pada SEOJK2401.1.",
          [
            {
              type: "tooltip",
              text: "gearing ratio",
              attrs: {
                definition:
                  "Rasio antara total penjaminan/asuransi yang diberikan dengan modal yang dimiliki lembaga penjamin, maksimal 10 kali",
              },
            },
            {
              type: "reference",
              text: "SEOJK2401.1",
              attrs: {
                standardCode: "SEOJK24",
                chapterCode: "01",
                subsectionNumber: "1",
              },
            },
          ]
        ),
        sectionId: section03_4.id,
        order: 1,
      },
      {
        number: "8",
        content: createRichContent(
          "Untuk lembaga penjamin/asuransi non-BUMN, persyaratan tambahan: peringkat minimal BBB-, gearing ratio maksimal 10 kali, mematuhi ketentuan OJK, dan bukan pihak terkait Bank. Bobot risiko bagian yang dijamin sesuai peringkat lembaga penjamin berdasarkan kategori portofolio entitas sektor publik (lihat SEOJK2402.4).",
          [
            {
              type: "reference",
              text: "SEOJK2402.4",
              attrs: {
                standardCode: "SEOJK24",
                chapterCode: "02",
                subsectionNumber: "4",
              },
            },
          ]
        ),
        sectionId: section03_4.id,
        order: 2,
      },
    ],
  });

  // ============================================
  // Add FAQs and Footnotes to key subsections
  // ============================================
  console.log("\n📝 Adding FAQs and Footnotes...");

  // Get subsections by querying
  const subsections = await prisma.baselSubsection.findMany({
    where: {
      section: {
        chapter: {
          standardId: standard.id,
        },
      },
    },
    include: {
      section: {
        include: {
          chapter: true,
        },
      },
    },
  });

  // Helper to find subsection by chapter code and number
  const findSubsection = (chapterCode: string, number: string) =>
    subsections.find(
      (s) => s.section.chapter.code === chapterCode && s.number === number
    );

  // Add FAQs to key subsections
  const sub01_1 = findSubsection("01", "1");
  if (sub01_1) {
    await prisma.baselFAQ.createMany({
      data: [
        {
          question:
            "Apa perbedaan antara ATMR Risiko Kredit dengan Pendekatan Standar dan Pendekatan IRB?",
          answer:
            "Pendekatan Standar menggunakan bobot risiko yang telah ditetapkan regulator berdasarkan kategori portofolio dan peringkat eksternal. Sedangkan Pendekatan Internal Rating Based (IRB) memungkinkan bank menggunakan model internal untuk mengestimasi komponen risiko seperti Probability of Default (PD), Loss Given Default (LGD), dan Exposure at Default (EAD). Pendekatan Standar lebih sederhana namun kurang sensitif terhadap risiko aktual, sementara IRB lebih akurat namun memerlukan persetujuan OJK dan infrastruktur yang memadai.",
          subsectionId: sub01_1.id,
          order: 1,
        },
        {
          question:
            "Mengapa eksposur kepada pemerintah Indonesia mendapat bobot risiko 0%?",
          answer:
            "Bobot risiko 0% mencerminkan asumsi bahwa pemerintah Indonesia memiliki kapasitas penuh untuk memenuhi kewajiban dalam mata uang domestik karena memiliki kedaulatan moneter. Ini sesuai dengan Basel Framework yang mengakui bahwa sovereign dalam mata uang domestik memiliki risiko gagal bayar yang sangat rendah. Namun perlu dicatat bahwa ini tidak berarti risiko nol secara absolut, melainkan pengakuan regulasi atas status sovereign.",
          subsectionId: sub01_1.id,
          order: 2,
        },
      ],
    });
  }

  const sub01_5 = findSubsection("01", "5");
  if (sub01_5) {
    await prisma.baselFAQ.createMany({
      data: [
        {
          question:
            "Bagaimana cara menghitung tagihan bersih untuk kredit yang memiliki agunan?",
          answer:
            "Tagihan bersih dihitung terlebih dahulu tanpa memperhitungkan agunan, yaitu nilai tercatat aset ditambah bunga yang belum diterima dikurangi CKPN. Agunan diperhitungkan terpisah sebagai teknik Mitigasi Risiko Kredit (MRK) yang dapat menurunkan ATMR. Jadi agunan tidak mengurangi tagihan bersih secara langsung, melainkan mengurangi bobot risiko atau bagian eksposur yang dikenakan bobot risiko tinggi.",
          subsectionId: sub01_5.id,
          order: 1,
        },
      ],
    });

    // Add Footnote
    await prisma.baselFootnote.create({
      data: {
        number: 1,
        content:
          "Nilai tercatat aset untuk tujuan perhitungan ATMR adalah nilai sebelum dikurangi CKPN stage 1 (performing assets). CKPN stage 1 tidak diperhitungkan dalam perhitungan tagihan bersih karena mencerminkan expected credit loss untuk aset yang belum mengalami peningkatan risiko signifikan.",
        subsectionId: sub01_5.id,
      },
    });
  }

  const sub01_9 = findSubsection("01", "9");
  if (sub01_9) {
    await prisma.baselFAQ.createMany({
      data: [
        {
          question:
            "Apa yang dimaksud dengan Faktor Konversi Kredit dan mengapa diperlukan?",
          answer:
            "Faktor Konversi Kredit (FKK) atau Credit Conversion Factor (CCF) adalah persentase yang digunakan untuk mengkonversi eksposur off-balance sheet (seperti komitmen yang belum ditarik, L/C, bank garansi) menjadi ekuivalen eksposur kredit. Diperlukan karena eksposur off-balance sheet memiliki potensi untuk menjadi eksposur on-balance sheet di masa depan. FKK yang lebih tinggi menunjukkan kemungkinan lebih besar bahwa komitmen akan ditarik atau jaminan akan dicairkan.",
          subsectionId: sub01_9.id,
          order: 1,
        },
      ],
    });

    await prisma.baselFootnote.create({
      data: {
        number: 2,
        content:
          "FKK dalam Pendekatan Standar ditetapkan berdasarkan jenis fasilitas dan tingkat conditionality. Komitmen yang unconditionally cancellable mendapat FKK terendah (10%) karena bank dapat membatalkannya tanpa risiko. Sedangkan direct credit substitutes seperti bank garansi mendapat FKK 100% karena setara dengan pemberian kredit langsung.",
        subsectionId: sub01_9.id,
      },
    });
  }

  const sub02_8 = findSubsection("02", "8");
  if (sub02_8) {
    await prisma.baselFAQ.createMany({
      data: [
        {
          question:
            "Bagaimana cara menghitung LTV untuk kredit yang sudah berjalan?",
          answer:
            "Untuk kredit yang sudah berjalan, LTV dihitung dengan pembilang berupa nilai tercatat kredit (baki debet) plus kelonggaran tarik yang masih tersedia, sedangkan penyebut adalah nilai agunan. Nilai agunan adalah yang terendah antara nilai pengikatan dan nilai pasar terkini yang dinilai ulang maksimal setiap 30 bulan. Jika penilaian ulang tidak dilakukan dalam 30 bulan terakhir, agunan dianggap tidak memiliki nilai sehingga kredit diklasifikasikan sebagai tidak memenuhi persyaratan.",
          subsectionId: sub02_8.id,
          order: 1,
        },
        {
          question:
            "Apa perbedaan perlakuan kredit yang bergantung dan tidak bergantung pada arus kas properti?",
          answer:
            "Kredit yang angsurannya bergantung pada arus kas properti (seperti sewa atau penjualan properti) mendapat bobot risiko lebih tinggi karena risiko double-hit: jika properti mengalami penurunan nilai, baik kemampuan bayar debitur maupun nilai agunan akan terpengaruh secara bersamaan. Kredit dianggap bergantung pada arus kas properti jika minimal 50% pendapatan debitur untuk pembayaran kredit berasal dari properti tersebut. Rumah utama debitur dianggap tidak bergantung pada arus kas properti.",
          subsectionId: sub02_8.id,
          order: 2,
        },
      ],
    });

    await prisma.baselFootnote.create({
      data: {
        number: 3,
        content:
          "Persyaratan penilaian agunan setiap 30 bulan bertujuan untuk memastikan nilai agunan dalam perhitungan LTV mencerminkan kondisi pasar terkini. Penilaian harus dilakukan secara konservatif, tidak memperhitungkan ekspektasi kenaikan nilai, dan harus disesuaikan jika harga pasar saat ini jauh lebih tinggi dari nilai agunan selama umur kredit.",
        subsectionId: sub02_8.id,
      },
    });
  }

  const sub02_12 = findSubsection("02", "12");
  if (sub02_12) {
    await prisma.baselFAQ.createMany({
      data: [
        {
          question: "Apa yang dimaksud dengan debitur transactor?",
          answer:
            "Debitur transactor adalah debitur yang menggunakan fasilitas kredit secara transaksional dan selalu melunasi penuh pada setiap tanggal pembayaran. Untuk kartu kredit, debitur dianggap transactor jika melunasi penuh selama 12 bulan terakhir. Untuk fasilitas overdraft, dianggap transactor jika tidak melakukan penarikan selama 12 bulan terakhir. Transactor mendapat bobot risiko lebih rendah (45%) karena pola penggunaan menunjukkan disiplin keuangan yang baik dan risiko gagal bayar yang rendah.",
          subsectionId: sub02_12.id,
          order: 1,
        },
      ],
    });
  }

  const sub03_1 = findSubsection("03", "1");
  if (sub03_1) {
    await prisma.baselFAQ.createMany({
      data: [
        {
          question: "Apa saja jenis teknik Mitigasi Risiko Kredit yang diakui?",
          answer:
            "Terdapat tiga jenis teknik MRK yang diakui: (1) MRK-Agunan, yaitu penggunaan agunan keuangan yang memenuhi syarat untuk mengurangi eksposur atau bobot risiko; (2) MRK-Garansi, yaitu garansi dari pihak ketiga yang eligible seperti pemerintah, bank, atau korporasi berperingkat tinggi; dan (3) MRK-Penjaminan/Asuransi Kredit, yaitu penjaminan dari lembaga penjamin atau asuransi kredit yang memenuhi persyaratan OJK.",
          subsectionId: sub03_1.id,
          order: 1,
        },
        {
          question:
            "Mengapa MRK tidak boleh berkorelasi positif dengan eksposur?",
          answer:
            "Korelasi positif berarti kualitas MRK akan memburuk bersamaan dengan memburuknya kualitas eksposur. Jika ini terjadi, MRK tidak dapat memberikan perlindungan efektif saat dibutuhkan. Contoh: agunan berupa saham perusahaan yang terafiliasi dengan debitur. Jika debitur mengalami kesulitan keuangan, kemungkinan besar nilai saham afiliasi juga turun, sehingga agunan tidak dapat menutup kerugian. Oleh karena itu, agunan dari pihak terkait debitur tidak diakui dalam teknik MRK.",
          subsectionId: sub03_1.id,
          order: 2,
        },
      ],
    });

    await prisma.baselFootnote.create({
      data: {
        number: 4,
        content:
          "Prinsip no double counting berlaku dalam penggunaan MRK. Jika peringkat suatu surat berharga sudah memperhitungkan keberadaan agunan atau garansi, maka agunan atau garansi yang sama tidak boleh diperhitungkan lagi dalam teknik MRK untuk menurunkan ATMR.",
        subsectionId: sub03_1.id,
      },
    });
  }

  const sub03_5 = findSubsection("03", "5");
  if (sub03_5) {
    await prisma.baselFAQ.createMany({
      data: [
        {
          question:
            "Apa yang dimaksud dengan haircut dalam pendekatan komprehensif MRK-Agunan?",
          answer:
            "Haircut adalah faktor penyesuaian untuk mengantisipasi volatilitas nilai agunan atau eksposur selama holding period (periode sampai posisi dapat ditutup). Haircut untuk eksposur (He) adalah faktor penambah yang meningkatkan nilai eksposur, sedangkan haircut untuk agunan (Hc) adalah faktor pengurang yang menurunkan nilai agunan. Besaran haircut ditentukan berdasarkan jenis instrumen, peringkat, dan sisa jatuh tempo. Semakin volatile instrumen, semakin tinggi haircut yang diterapkan.",
          subsectionId: sub03_5.id,
          order: 1,
        },
      ],
    });

    await prisma.baselFootnote.create({
      data: {
        number: 5,
        content:
          "Haircut standar dalam SEOJK ini menggunakan asumsi holding period 10 hari kerja dan valuasi harian. Jika frekuensi valuasi aktual berbeda, haircut harus disesuaikan dengan formula: H_adjusted = H × sqrt((NR + TM - 1) / TM), dimana NR adalah periode aktual valuasi dan TM adalah 10 hari kerja.",
        subsectionId: sub03_5.id,
      },
    });
  }

  console.log("\n✅ Seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   Standard: SEOJK24 - ${standard.name}`);
  console.log(`   Chapters: 3`);
  console.log(`   Sections: 12`);
  console.log(`   Subsections: 26`);
  console.log(`   FAQs: 10`);
  console.log(`   Footnotes: 5`);
  console.log("\n🎯 Demo features included:");
  console.log("   - Tooltips for technical terms (ATMR, KPMM, LTV, etc.)");
  console.log(
    "   - Cross-references between sections (same chapter and different chapters)"
  );
  console.log("   - Scroll-back button for same-page navigation");
  console.log("   - FAQs for key subsections with detailed explanations");
  console.log("   - Footnotes with additional technical clarifications");
  console.log("\n📌 To view: http://localhost:3000/basel-center/seojk24");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
