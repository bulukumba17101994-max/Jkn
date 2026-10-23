'use client';

import React, { useState, useMemo } from 'react';
import { 
  RuleGroup, 
  CalculationResult, 
  formatRupiah, 
  formatPercentage,
  CalculatedRecipient,
  simulateEmployeeChange 
} from '../lib/jaspel';
import { 
  Search, 
  Filter, 
  UserPlus, 
  UserMinus,
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Users, 
  ArrowUpDown,
  Download,
  Sparkles,
  Calculator,
  Info
} from 'lucide-react';

interface RecipientsTableProps {
  groups: RuleGroup[];
  setGroups: React.Dispatch<React.SetStateAction<RuleGroup[]>>;
  calc: CalculationResult;
  periodLabel: string;
  totalAmount: number;
}

export const RecipientsTable: React.FC<RecipientsTableProps> = ({
  groups,
  setGroups,
  calc,
  periodLabel,
  totalAmount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'name' | 'position' | 'amount' | 'group'>('group');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Simulation state
  const [simulatingGroupId, setSimulatingGroupId] = useState<string>('kasubag_kasie');
  const [showSimModal, setShowSimModal] = useState<boolean>(false);

  // Edit / Add modal state
  const [editingRecipient, setEditingRecipient] = useState<{
    groupId: string;
    recipientId?: string;
    name: string;
    position: string;
  } | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const list = Array.from(new Set(groups.map((g) => g.category)));
    return ['ALL', ...list];
  }, [groups]);

  // Filtered and sorted recipients
  const filteredRecipients = useMemo(() => {
    let list = [...calc.allRecipients];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.position.toLowerCase().includes(q) ||
          r.groupName.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'ALL') {
      list = list.filter((r) => r.category === selectedCategory);
    }

    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'position') {
        comparison = a.position.localeCompare(b.position);
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'group') {
        comparison = a.groupName.localeCompare(b.groupName);
      }
      return sortAsc ? comparison : -comparison;
    });

    return list;
  }, [calc.allRecipients, searchQuery, selectedCategory, sortField, sortAsc]);

  const handleSort = (field: 'name' | 'position' | 'amount' | 'group') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleSaveRecipient = () => {
    if (!editingRecipient || !editingRecipient.name.trim()) return;

    setGroups((prevGroups) => {
      return prevGroups.map((group) => {
        if (group.id !== editingRecipient.groupId) return group;

        if (editingRecipient.recipientId) {
          // Edit existing
          return {
            ...group,
            recipients: group.recipients.map((rec) =>
              rec.id === editingRecipient.recipientId
                ? {
                    ...rec,
                    name: editingRecipient.name.toUpperCase(),
                    position: editingRecipient.position.toUpperCase() || group.name,
                  }
                : rec
            ),
          };
        } else {
          // Add new
          const newId = `rec-${Date.now()}`;
          return {
            ...group,
            recipients: [
              ...group.recipients,
              {
                id: newId,
                name: editingRecipient.name.toUpperCase(),
                position: editingRecipient.position.toUpperCase() || group.name,
              },
            ],
          };
        }
      });
    });

    setEditingRecipient(null);
  };

  const handleDeleteRecipient = (groupId: string, recipientId: string, recipientName: string) => {
    const parentGroup = groups.find((g) => g.id === groupId);
    const count = parentGroup?.recipients.length || 1;
    const confirmMsg = count > 1
      ? `Hapus "${recipientName}" dari kelompok ${parentGroup?.name}?\nJumlah pegawai akan berkurang dari ${count} menjadi ${count - 1}. Nominal per orang akan otomatis bertambah secara proporsional.`
      : `Hapus "${recipientName}"?`;

    if (!window.confirm(confirmMsg)) return;

    setGroups((prevGroups) =>
      prevGroups.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            recipients: g.recipients.filter((r) => r.id !== recipientId),
          };
        }
        return g;
      })
    );
  };

  // Simulation calculation
  const targetGroup = groups.find((g) => g.id === simulatingGroupId) || groups[0];
  const simPlus = simulateEmployeeChange(targetGroup, totalAmount, 1);
  const simMinus = simulateEmployeeChange(targetGroup, totalAmount, -1);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Simulation Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2.5 py-0.5 rounded-full mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Perhitungan Otomatis Tambah & Kurang Pegawai Aktif</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-serif flex items-center space-x-2">
              <Users className="w-6 h-6 text-amber-400" />
              <span>Daftar Rincian Pegawai & Alokasi Jasa</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Data seluruh penerima jasa manajemen periode {periodLabel}. Ketika ada penambahan atau pengurangan pegawai, nominal per orang otomatis dihitung ulang seketika.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSimModal(!showSimModal)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-950/70 hover:bg-amber-900 border border-amber-800/60 shadow-md transition"
            >
              <Calculator className="w-4 h-4" />
              <span>Simulasi Tambah / Kurang</span>
            </button>
            <button
              onClick={() => {
                setEditingRecipient({
                  groupId: groups[0]?.id || 'kasubag_kasie',
                  name: '',
                  position: '',
                });
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-md transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Pegawai Baru</span>
            </button>
          </div>
        </div>

        {/* Live Simulation Card (Expandable) */}
        {showSimModal && (
          <div className="p-5 rounded-xl bg-slate-950 border border-amber-600/40 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-400 flex items-center space-x-2">
                <Calculator className="w-4 h-4" />
                <span>Simulasi Real-time: Dampak Penambahan / Pengurangan Pegawai</span>
              </h3>
              <button
                onClick={() => setShowSimModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Tutup
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Group Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Pilih Kelompok Simulasi
                </label>
                <select
                  value={simulatingGroupId}
                  onChange={(e) => setSimulatingGroupId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.recipients.length} orang • {formatPercentage(g.percentage)})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pagu Kelompok: <span className="font-semibold text-white">{formatRupiah(Math.round((totalAmount * targetGroup.percentage) / 100))}</span>
                </p>
              </div>

              {/* Simulation Result: If +1 person */}
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-400">
                  <span>Jika Pegawai Bertambah (+1)</span>
                  <span className="font-mono">{simPlus.newCount} orang</span>
                </div>
                <div className="text-base font-bold text-white font-mono">
                  {formatRupiah(simPlus.newPerPerson)} / org
                </div>
                <div className="text-[11px] text-rose-400">
                  Selisih: {formatRupiah(simPlus.diffPerPerson)} / org (-{Math.abs(Math.round((simPlus.diffPerPerson / (simPlus.currentPerPerson || 1)) * 100))}%)
                </div>
              </div>

              {/* Simulation Result: If -1 person */}
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span>Jika Pegawai Berkurang (-1)</span>
                  <span className="font-mono">{simMinus.newCount} orang</span>
                </div>
                <div className="text-base font-bold text-white font-mono">
                  {formatRupiah(simMinus.newPerPerson)} / org
                </div>
                <div className="text-[11px] text-emerald-400">
                  Selisih: +{formatRupiah(simMinus.diffPerPerson)} / org (+{Math.abs(Math.round((simMinus.diffPerPerson / (simMinus.currentPerPerson || 1)) * 100))}%)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="Cari nama pegawai, jabatan, atau kelompok"
              placeholder="Cari nama pegawai, jabatan, atau kelompok..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              aria-label="Filter Berdasarkan Kategori"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'Semua Kategori' : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center space-x-1.5">
                    <span>Nama Pegawai</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('position')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition hidden sm:table-cell"
                >
                  <div className="flex items-center space-x-1.5">
                    <span>Jabatan / Pos</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('group')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center space-x-1.5">
                    <span>Kelompok</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('amount')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center justify-end space-x-1.5">
                    <span>Nominal Diterima</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center w-28 no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredRecipients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Tidak ditemukan data pegawai yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredRecipients.map((rec, index) => {
                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      <td className="py-3.5 px-4 text-center text-xs text-slate-500 font-mono">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {rec.name}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-300 hidden sm:table-cell">
                        {rec.position}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
                          {rec.groupName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                        {formatRupiah(rec.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center no-print">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => {
                              const parentGroup = groups.find((g) =>
                                g.recipients.some((r) => r.id === rec.id)
                              );
                              if (parentGroup) {
                                setEditingRecipient({
                                  groupId: parentGroup.id,
                                  recipientId: rec.id,
                                  name: rec.name,
                                  position: rec.position,
                                });
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                            title="Edit Data Pegawai"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const parentGroup = groups.find((g) =>
                                g.recipients.some((r) => r.id === rec.id)
                              );
                              if (parentGroup) {
                                handleDeleteRecipient(parentGroup.id, rec.id, rec.name);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Hapus Pegawai (Otomatis Hitung Ulang)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Subtotal */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div>
            Menampilkan <span className="font-semibold text-white">{filteredRecipients.length}</span> dari{' '}
            <span className="font-semibold text-white">{calc.allRecipients.length}</span> total penerima
          </div>
          <div className="flex items-center space-x-4">
            <span>
              Total Alokasi Rincian:{' '}
              <span className="font-mono font-bold text-emerald-400">
                {formatRupiah(
                  filteredRecipients.reduce((acc, curr) => acc + curr.amount, 0)
                )}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Modal Add / Edit Recipient with Real-time impact preview */}
      {editingRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-serif">
                {editingRecipient.recipientId ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
              </h3>
              <button
                onClick={() => setEditingRecipient(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Kelompok Alokasi
                </label>
                <select
                  value={editingRecipient.groupId}
                  onChange={(e) =>
                    setEditingRecipient({ ...editingRecipient, groupId: e.target.value })
                  }
                  disabled={!!editingRecipient.recipientId}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.recipients.length} orang • {formatPercentage(g.percentage)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Nama Lengkap Pegawai
                </label>
                <input
                  type="text"
                  placeholder="e.g. AHMAD HIDAYAT, S.Kep"
                  value={editingRecipient.name}
                  onChange={(e) =>
                    setEditingRecipient({ ...editingRecipient, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Jabatan / Pos Kerja
                </label>
                <input
                  type="text"
                  placeholder="e.g. KASIE PELAYANAN atau STAF TEKNIS"
                  value={editingRecipient.position}
                  onChange={(e) =>
                    setEditingRecipient({ ...editingRecipient, position: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500 uppercase"
                />
              </div>

              {/* Automatic Recalculation Impact Notice */}
              {!editingRecipient.recipientId && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-xs text-emerald-300 flex items-start space-x-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <p>
                    Saat disimpan, sistem akan langsung membagi ulang total alokasi kelompok ini ke seluruh anggota baru secara otomatis dan presisi.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
              <button
                onClick={() => setEditingRecipient(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleSaveRecipient}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400"
              >
                Simpan & Hitung Ulang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
