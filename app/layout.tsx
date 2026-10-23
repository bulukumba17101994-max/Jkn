import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Sistem Pembagian Jasa Manajemen - UPTD RSUD Siwa',
  description: 'Aplikasi pembagian jasa manajemen dan laporan bulanan UPTD Rumah Sakit Umum Daerah Siwa dengan perhitungan otomatis dan integrasi Google Sheets.',
  openGraph: {
    title: 'Sistem Pembagian Jasa Manajemen - UPTD RSUD Siwa',
    description: 'Aplikasi pembagian jasa manajemen dan laporan bulanan UPTD Rumah Sakit Umum Daerah Siwa dengan perhitungan otomatis dan integrasi Google Sheets.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sistem Pembagian Jasa Manajemen - UPTD RSUD Siwa',
    description: 'Aplikasi pembagian jasa manajemen dan laporan bulanan UPTD Rumah Sakit Umum Daerah Siwa dengan perhitungan otomatis dan integrasi Google Sheets.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
