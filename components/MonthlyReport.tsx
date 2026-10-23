'use client';

import React, { useState } from 'react';
import { 
  CalculationResult, 
  formatRupiah, 
  formatPercentage 
} from '../lib/jaspel';
import { 
  Printer, 
  Download, 
  Building2, 
  Eye,
  Sliders
} from 'lucide-react';
import { generateGoogleSheetsCsv } from '../lib/sheets';

interface MonthlyReportProps {
  calc: CalculationResult;
  periodLabel: string;
}

export const MonthlyReport: React.FC<MonthlyReportProps> = ({
  calc,
  periodLabel,
}) => {
  const [reportStatus, setReportStatus] = useState<'Draft' | 'Disetujui' | 'Dicairkan'>('Disetujui');
  const [docNumber, setDocNumber] = useState<string>('045.2/RSUD-SW/JASPEL-MNJ/X/2026');
  const [fundingSource, setFundingSource] = useState<string>('Pendapatan Fungsional BLUD / JKN BPJS Kesehatan');
  
  // Kop Surat UPTD RSUD Siwa
  const [govAgency, setGovAgency] = useState<string>('PEMERINTAH KABUPATEN WAJO');
  const [healthDept, setHealthDept] = useState<string>('DINAS KESEHATAN');
  const [hospitalName, setHospitalName] = useState<string>('UPTD RUMAH SAKIT UMUM DAERAH SIWA');
  const [hospitalAddress, setHospitalAddress] = useState<string>('Jl. Ahmad Yani No. 01 Siwa, Kec. Pitumpanua, Kab. Wajo, Sulawesi Selatan 90992');
  const [hospitalContact, setHospitalContact] = useState<string>('Telp: (0485) 323011 • Email: rsudsiwa@gmail.com • Laman: rsudsiwa.wajokab.go.id');
  const [showEditKop, setShowEditKop] = useState<boolean>(false);

  // Legal Paper print settings
  const [paperSize, setPaperSize] = useState<'legal' | 'a4' | 'folio'>('legal');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showSignColumn, setShowSignColumn] = useState<boolean>(true);
  const [showSummaryTable, setShowSummaryTable] = useState<boolean>(true);
  const [previewLegalPaper, setPreviewLegalPaper] = useState<boolean>(false);

  const handlePrint = () => {
    // Inject legal paper size into dynamic style element before print
    const styleId = 'dynamic-print-paper-size';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const pageSize = paperSize === 'legal' ? 'legal' : paperSize === 'folio' ? '215mm 330mm' : 'A4';
    styleEl.innerHTML = `
      @page {
        size: ${pageSize} ${orientation};
        margin: 12mm 10mm;
      }
    `;

    window.print();
  };

  const handleDownloadCsv = () => {
    const csvContent = generateGoogleSheetsCsv(calc, periodLabel);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Jaspel_Kertas_Legal_${periodLabel.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Control Panel (Hidden on Print) */}
      <div className="no-print bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-amber-400 bg-amber-950/70 border border-amber-800/50 px-2.5 py-0.5 rounded-full">
                Menu Cetak Kertas Legal Resmi
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                reportStatus === 'Dicairkan' 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                  : reportStatus === 'Disetujui'
                  ? 'bg-blue-950 text-blue-300 border border-blue-700/60'
                  : 'bg-amber-950 text-amber-300 border border-amber-700/60'
              }`}>
                Status: {reportStatus}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-serif mt-1">
              Rekapitulasi Dokumen Dinas Format Kertas Legal
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Format cetak lengkap data seluruh penerima, rekapitulasi golongan, dan kolom tanda tangan siap print pada kertas ukuran Legal (8.5 x 14 inci).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setPreviewLegalPaper(!previewLegalPaper)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>{previewLegalPaper ? 'Tutup Pratinjau' : 'Pratinjau Kertas Legal'}</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Unduh CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-950/40 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Kertas Legal)</span>
            </button>
          </div>
        </div>

        {/* Paper & Layout Settings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Paper Size selector */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <label className="font-semibold text-slate-300 uppercase tracking-wider block">
              Ukuran Kertas Cetak
            </label>
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-300 font-semibold focus:outline-none"
            >
              <option value="legal">Legal (8.5 x 14 in / 216 x 356 mm) - Rekomendasi</option>
              <option value="folio">Folio / F4 (215 x 330 mm)</option>
              <option value="a4">A4 (210 x 297 mm)</option>
            </select>
          </div>

          {/* Orientation selector */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <label className="font-semibold text-slate-300 uppercase tracking-wider block">
              Orientasi Halaman
            </label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none"
            >
              <option value="portrait">Tegak (Portrait) - Standar Daftar</option>
              <option value="landscape">Mendatar (Landscape) - Format Meja</option>
            </select>
          </div>

          {/* Document Status */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <label className="font-semibold text-slate-300 uppercase tracking-wider block">
              Status Berkas
            </label>
            <select
              value={reportStatus}
              onChange={(e) => setReportStatus(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none"
            >
              <option value="Draft">Draft (Konsep Sementara)</option>
              <option value="Disetujui">Disetujui (Sudah Diverifikasi)</option>
              <option value="Dicairkan">Dicairkan (Telah Dibayarkan)</option>
            </select>
          </div>

          {/* Nomor Berkas / SK */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <label className="font-semibold text-slate-300 uppercase tracking-wider block">
              Nomor Dokumen / SK
            </label>
            <input
              type="text"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none"
            />
          </div>
        </div>

        {/* Options & Kop Surat Toggle */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSummaryTable}
                onChange={(e) => setShowSummaryTable(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
              />
              <span>Sertakan Tabel Rekapitulasi Alokasi (Bagian I)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSignColumn}
                onChange={(e) => setShowSignColumn(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
              />
              <span>Tampilkan Kolom Tanda Tangan Pegawai (Bagian II)</span>
            </label>
          </div>

          <button
            onClick={() => setShowEditKop(!showEditKop)}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>{showEditKop ? 'Tutup Pengaturan Kop Surat' : 'Edit Kop Surat RSUD Siwa'}</span>
          </button>
        </div>

        {/* Collapsible Kop Surat Editor */}
        {showEditKop && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs animate-in fade-in duration-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pemerintah Daerah</label>
              <input
                type="text"
                value={govAgency}
                onChange={(e) => setGovAgency(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Dinas Pembina</label>
              <input
                type="text"
                value={healthDept}
                onChange={(e) => setHealthDept(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nama Rumah Sakit</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-300 font-bold focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Alamat Instansi</label>
              <input
                type="text"
                value={hospitalAddress}
                onChange={(e) => setHospitalAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Kontak / Email / Web</label>
              <input
                type="text"
                value={hospitalContact}
                onChange={(e) => setHospitalContact(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* The Printable Document Container (Matches Legal Paper geometry in print) */}
      <div 
        className={`bg-white text-slate-900 shadow-2xl transition-all font-serif print-card mx-auto ${
          previewLegalPaper
            ? 'border-4 border-amber-500/40 p-8 sm:p-14 max-w-4xl rounded-2xl'
            : 'border border-slate-300 p-6 sm:p-12 rounded-2xl max-w-5xl'
        }`}
      >
        {/* Kop Surat Resmi Instansi UPTD RSUD Siwa */}
        <div className="border-b-4 border-double border-slate-950 pb-4 text-center">
          <div className="flex items-center justify-center space-x-5 mb-2">
            <div className="w-16 h-16 rounded-full border-2 border-slate-900 flex items-center justify-center shrink-0">
              <Building2 className="w-10 h-10 text-slate-900" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-950">
                {govAgency}
              </h3>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                {healthDept}
              </h4>
              <h2 className="text-base sm:text-2xl font-black uppercase tracking-tight text-slate-950 leading-tight">
                {hospitalName}
              </h2>
              <p className="text-[11px] text-slate-700 font-sans mt-0.5">
                {hospitalAddress}
              </p>
              <p className="text-[10px] text-slate-600 font-sans">
                {hospitalContact}
              </p>
            </div>
          </div>
        </div>

        {/* Title of Document */}
        <div className="text-center my-6">
          <h3 className="text-lg sm:text-xl font-black uppercase underline decoration-2 underline-offset-4 tracking-wide text-slate-950">
            Daftar Lengkap Pembagian Jasa Pelayanan (Jaspel) Manajemen
          </h3>
          <p className="text-xs sm:text-sm font-sans text-slate-800 mt-1.5 font-medium">
            Periode Bulan: <span className="font-bold uppercase text-slate-950">{periodLabel}</span> • Berkas SK: {docNumber}
          </p>
          <p className="text-[11px] font-sans text-slate-600 mt-0.5">
            Sumber Dana: <span className="italic">{fundingSource}</span>
          </p>
        </div>

        {/* Summary Metric Header Card */}
        <div className="mb-6 p-3.5 rounded bg-slate-50 border border-slate-300 font-sans grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block uppercase text-[10px] tracking-wider font-semibold">Total Pagu Jasa:</span>
            <span className="font-bold text-slate-950 text-sm font-serif">{formatRupiah(calc.totalAmount)}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[10px] tracking-wider font-semibold">Total Realisasi:</span>
            <span className="font-bold text-emerald-800 text-sm font-serif">{formatRupiah(calc.totalAllocated)}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[10px] tracking-wider font-semibold">Persentase Alokasi:</span>
            <span className="font-bold text-slate-950 text-sm">{formatPercentage(calc.totalPercentage)} (Tepat 100%)</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[10px] tracking-wider font-semibold">Total Pegawai / Pos:</span>
            <span className="font-bold text-slate-950 text-sm">{calc.totalPersonnel} Penerima</span>
          </div>
        </div>

        {/* Bagian I: Rekapitulasi Alokasi Per Kelompok */}
        {showSummaryTable && (
          <div className="mb-8 font-sans">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
              I. Rekapitulasi Alokasi Per Kelompok Jabatan
            </h4>
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-semibold text-slate-900 border-b border-slate-300 text-[11px]">
                <tr>
                  <th className="border border-slate-300 p-1.5 text-center w-8">No</th>
                  <th className="border border-slate-300 p-1.5">Kelompok / Jabatan</th>
                  <th className="border border-slate-300 p-1.5">Kategori Unit</th>
                  <th className="border border-slate-300 p-1.5 text-center w-20">Proporsi</th>
                  <th className="border border-slate-300 p-1.5 text-center w-14">Jumlah</th>
                  <th className="border border-slate-300 p-1.5 text-right w-32">Total Alokasi (Rp)</th>
                  <th className="border border-slate-300 p-1.5 text-right w-32">Per Orang (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {calc.groups.map((g, idx) => (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-1.5 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-300 p-1.5 font-bold text-slate-950">{g.name}</td>
                    <td className="border border-slate-300 p-1.5 text-slate-700">{g.category}</td>
                    <td className="border border-slate-300 p-1.5 text-center font-mono font-medium">{formatPercentage(g.percentage)}</td>
                    <td className="border border-slate-300 p-1.5 text-center font-bold">{g.recipientCount}</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono font-semibold">{formatRupiah(g.totalGroupAmount)}</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono">{formatRupiah(g.perPersonAmount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-900 text-[11px]">
                <tr>
                  <td colSpan={3} className="border border-slate-300 p-2 text-center uppercase">Total Keseluruhan</td>
                  <td className="border border-slate-300 p-2 text-center font-mono">{formatPercentage(calc.totalPercentage)}</td>
                  <td className="border border-slate-300 p-2 text-center">{calc.totalPersonnel}</td>
                  <td className="border border-slate-300 p-2 text-right font-mono text-emerald-900">{formatRupiah(calc.totalAllocated)}</td>
                  <td className="border border-slate-300 p-2 text-right">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Bagian II: Daftar Nominatif Lengkap Seluruh Pegawai */}
        <div className="mb-8 font-sans">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-serif">
              II. Daftar Nominatif Penerima dan Lembar Tanda Tangan Pegawai
            </h4>
            <span className="text-[10px] text-slate-600 font-sans">
              Total {calc.allRecipients.length} Pegawai / Pos
            </span>
          </div>

          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead className="bg-slate-100 font-semibold text-slate-900 border-b border-slate-300 text-[11px]">
              <tr>
                <th className="border border-slate-300 p-1.5 text-center w-8">No</th>
                <th className="border border-slate-300 p-1.5">Nama Pegawai Penerima</th>
                <th className="border border-slate-300 p-1.5">Jabatan / Pos Kerja</th>
                <th className="border border-slate-300 p-1.5">Kelompok</th>
                <th className="border border-slate-300 p-1.5 text-right w-28">Nominal (Rp)</th>
                {showSignColumn && (
                  <th className="border border-slate-300 p-1.5 text-center w-36">Tanda Tangan / Paraf</th>
                )}
              </tr>
            </thead>
            <tbody>
              {calc.allRecipients.map((rec, idx) => {
                const isEven = (idx + 1) % 2 === 0;
                return (
                  <tr key={rec.id} className="hover:bg-slate-50 break-inside-avoid">
                    <td className="border border-slate-300 p-1.5 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-300 p-1.5 font-bold text-slate-950 uppercase">{rec.name}</td>
                    <td className="border border-slate-300 p-1.5 text-slate-700">{rec.position}</td>
                    <td className="border border-slate-300 p-1.5 text-slate-600">{rec.groupName}</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono font-semibold">{formatRupiah(rec.amount)}</td>
                    {showSignColumn && (
                      <td className="border border-slate-300 p-1.5 text-slate-400">
                        <div className={`text-[10px] ${isEven ? 'text-right pr-2' : 'text-left pl-2'}`}>
                          {idx + 1}. ..................
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-900 text-xs">
              <tr>
                <td colSpan={4} className="border border-slate-300 p-2 text-center uppercase">
                  Jumlah Total Pembayaran Jasa Manajemen
                </td>
                <td className="border border-slate-300 p-2 text-right font-mono text-emerald-900">
                  {formatRupiah(calc.totalAllocated)}
                </td>
                {showSignColumn && <td className="border border-slate-300 p-2"></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
