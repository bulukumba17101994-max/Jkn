import { CalculationResult, formatRupiah, formatPercentage } from './jaspel';

export interface GoogleSheetsSyncResult {
  success: boolean;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  message: string;
}

/**
 * Generates CSV formatted text specifically structured for Google Sheets / Excel import
 */
export function generateGoogleSheetsCsv(
  calc: CalculationResult,
  periodLabel: string
): string {
  const rows: string[][] = [];

  rows.push(['UPTD RUMAH SAKIT UMUM DAERAH SIWA - KABUPATEN WAJO']);
  rows.push(['LAPORAN PEMBAGIAN JASA PELAYANAN (JASPEL) MANAJEMEN']);
  rows.push([`Periode: ${periodLabel}`, '', `Tanggal Dibuat: ${new Date().toLocaleDateString('id-ID')}`]);
  rows.push([`Total Jasa Manajemen:`, '', `"${formatRupiah(calc.totalAmount)}"`]);
  rows.push([`Total Dialokasikan:`, '', `"${formatRupiah(calc.totalAllocated)}"`]);
  rows.push([`Total Persentase:`, '', `"${formatPercentage(calc.totalPercentage)}"`]);
  rows.push([]);
  rows.push(['--- RINGKASAN ALOKASI PER KELOMPOK ---']);
  rows.push(['No', 'Kelompok / Jabatan', 'Kategori', 'Persentase (%)', 'Jumlah Orang', 'Total Nominal (Rp)', 'Nominal Per Orang (Rp)']);

  calc.groups.forEach((g, idx) => {
    rows.push([
      (idx + 1).toString(),
      `"${g.name}"`,
      `"${g.category}"`,
      `"${g.percentage.toString().replace('.', ',')}%"`,
      g.recipientCount.toString(),
      `"${formatRupiah(g.totalGroupAmount)}"`,
      `"${formatRupiah(g.perPersonAmount)}"`
    ]);
  });

  rows.push([]);
  rows.push(['--- RINCIAN PENERIMA PER PEGAWAI ---']);
  rows.push(['No', 'Nama Pegawai', 'Jabatan / Pos', 'Kelompok', 'Persentase Kelompok', 'Persentase Individu', 'Nominal Diterima (Rp)']);

  calc.allRecipients.forEach((r, idx) => {
    rows.push([
      (idx + 1).toString(),
      `"${r.name}"`,
      `"${r.position}"`,
      `"${r.groupName}"`,
      `"${r.groupPercentage.toString().replace('.', ',')}%"`,
      `"${r.individualPercentage.toString().replace('.', ',')}%"`,
      `"${formatRupiah(r.amount)}"`
    ]);
  });

  return rows.map(r => r.join(',')).join('\n');
}

/**
 * Create or sync with Google Sheets via Google Sheets API v4
 */
export async function syncToGoogleSheets(
  accessToken: string,
  calc: CalculationResult,
  periodLabel: string,
  existingSpreadsheetId?: string
): Promise<GoogleSheetsSyncResult> {
  try {
    let spreadsheetId = existingSpreadsheetId?.trim();
    let spreadsheetUrl = '';

    if (!spreadsheetId) {
      // Create new spreadsheet via Google Sheets API
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: `Laporan Jaspel Manajemen - ${periodLabel}`,
          },
          sheets: [
            { properties: { title: 'Rekapitulasi Alokasi' } },
            { properties: { title: 'Daftar Nominatif Pegawai' } }
          ]
        }),
      });

      if (!createRes.ok) {
        const errJson = await createRes.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Gagal membuat spreadsheet (${createRes.status})`);
      }

      const createdData = await createRes.json();
      spreadsheetId = createdData.spreadsheetId;
      spreadsheetUrl = createdData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

      // Populate Sheet 1: Rekapitulasi Alokasi
      const summaryValues: any[][] = [
        ['LAPORAN REKAPITULASI PEMBAGIAN JASA PELAYANAN (JASPEL) MANAJEMEN'],
        [`Periode: ${periodLabel}`, '', `Tanggal Sinkronisasi: ${new Date().toLocaleDateString('id-ID')}`],
        ['Total Pagu Jasa', calc.totalAmount],
        ['Total Dialokasikan', calc.totalAllocated],
        ['Persentase Alokasi', `${calc.totalPercentage}%`],
        [],
        ['No', 'Kelompok / Jabatan', 'Kategori', 'Persentase (%)', 'Jumlah Penerima', 'Total Alokasi (Rp)', 'Nominal / Orang (Rp)'],
        ...calc.groups.map((g, idx) => [
          idx + 1,
          g.name,
          g.category,
          `${g.percentage}%`,
          g.recipientCount,
          g.totalGroupAmount,
          g.perPersonAmount,
        ]),
        [],
        ['TOTAL KESELURUHAN', '', '', `${calc.totalPercentage}%`, calc.totalPersonnel, calc.totalAllocated, '']
      ];

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Rekapitulasi%20Alokasi!A1?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            range: 'Rekapitulasi Alokasi!A1',
            majorDimension: 'ROWS',
            values: summaryValues,
          }),
        }
      );

      // Populate Sheet 2: Daftar Nominatif Pegawai
      const detailValues: any[][] = [
        ['DAFTAR NOMINATIF PENERIMAAN JASA MANAJEMEN'],
        [`Periode: ${periodLabel}`, '', `Total Pegawai / Pos: ${calc.allRecipients.length}`],
        [],
        ['No', 'Nama Pegawai', 'Jabatan / Pos', 'Kelompok', 'Nominal Diterima (Rp)'],
        ...calc.allRecipients.map((r, idx) => [
          idx + 1,
          r.name,
          r.position,
          r.groupName,
          r.amount,
        ]),
        [],
        ['TOTAL PENCAIRAN', '', '', '', calc.totalAllocated]
      ];

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Daftar%20Nominatif%20Pegawai!A1?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            range: 'Daftar Nominatif Pegawai!A1',
            majorDimension: 'ROWS',
            values: detailValues,
          }),
        }
      );

    } else {
      // Existing spreadsheet: write to the first sheet
      spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

      const updateValues: any[][] = [
        ['LAPORAN REKAPITULASI PEMBAGIAN JASA PELAYANAN (JASPEL) MANAJEMEN'],
        [`Periode: ${periodLabel}`, '', `Tanggal Sinkronisasi: ${new Date().toLocaleDateString('id-ID')}`],
        ['Total Pagu Jasa', calc.totalAmount],
        ['Total Dialokasikan', calc.totalAllocated],
        ['Persentase Alokasi', `${calc.totalPercentage}%`],
        [],
        ['No', 'Kelompok / Jabatan', 'Kategori', 'Persentase (%)', 'Jumlah Penerima', 'Total Alokasi (Rp)', 'Nominal / Orang (Rp)'],
        ...calc.groups.map((g, idx) => [
          idx + 1,
          g.name,
          g.category,
          `${g.percentage}%`,
          g.recipientCount,
          g.totalGroupAmount,
          g.perPersonAmount,
        ]),
        [],
        ['DAFTAR PENERIMA LENGKAP'],
        ['No', 'Nama Pegawai', 'Jabatan', 'Kelompok', 'Nominal Diterima (Rp)'],
        ...calc.allRecipients.map((r, idx) => [
          idx + 1,
          r.name,
          r.position,
          r.groupName,
          r.amount,
        ]),
      ];

      const updateRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            range: 'A1',
            majorDimension: 'ROWS',
            values: updateValues,
          }),
        }
      );

      if (!updateRes.ok) {
        const err = await updateRes.json().catch(() => ({}));
        throw new Error(err.error?.message || `Gagal memperbarui nilai spreadsheet (${updateRes.status})`);
      }
    }

    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      message: `Berhasil disinkronkan ke Google Sheets! Dokumen telah siap diakses di Google Drive Anda.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan saat menghubungkan ke Google Sheets API',
    };
  }
}
