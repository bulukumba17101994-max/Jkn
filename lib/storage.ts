import { MonthlyRecord, DEFAULT_TOTAL_AMOUNT, INITIAL_GROUPS } from './jaspel';
import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';

const STORAGE_KEY = 'jaspel_manajemen_records_v1';

export const INITIAL_RECORDS: MonthlyRecord[] = [
  {
    id: 'rec-2026-10',
    period: '2026-10',
    periodLabel: 'Oktober 2026',
    totalAmount: DEFAULT_TOTAL_AMOUNT,
    status: 'Disetujui',
    createdAt: '2026-10-01T08:00:00.000Z',
    updatedAt: '2026-10-22T02:00:00.000Z',
    groups: JSON.parse(JSON.stringify(INITIAL_GROUPS)),
    notes: 'Pembagian jasa manajemen periode reguler Oktober 2026 sesuai SK Direktur.',
    approvedBy: 'dr. H. Rahmad Saleh, Sp.A, M.Kes (Direktur)',
    verifiedBy: 'A. Fatimah Inayah (Bendahara Pengeluaran)',
  },
  {
    id: 'rec-2026-09',
    period: '2026-09',
    periodLabel: 'September 2026',
    totalAmount: 52140000,
    status: 'Dicairkan',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-28T09:30:00.000Z',
    groups: JSON.parse(JSON.stringify(INITIAL_GROUPS)),
    notes: 'Realisasi pencairan jasa manajemen periode September 2026 via transfer bank.',
    approvedBy: 'dr. H. Rahmad Saleh, Sp.A, M.Kes (Direktur)',
    verifiedBy: 'A. Fatimah Inayah (Bendahara Pengeluaran)',
  },
];

export function getLocalRecords(): MonthlyRecord[] {
  if (typeof window === 'undefined') return INITIAL_RECORDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RECORDS));
      return INITIAL_RECORDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_RECORDS;
  } catch (e) {
    console.error('Failed to load local records:', e);
    return INITIAL_RECORDS;
  }
}

/**
 * Saves a record to both LocalStorage and Firebase Firestore with auto-sync
 */
export async function saveRecordToCloudAndLocal(
  record: MonthlyRecord,
  onSyncStatus?: (status: { success: boolean; cloud: boolean; message: string }) => void
): Promise<MonthlyRecord[]> {
  const current = getLocalRecords();
  const existingIndex = current.findIndex(r => r.id === record.id || r.period === record.period);
  const now = new Date().toISOString();
  
  const preparedRecord: MonthlyRecord = {
    ...record,
    id: record.id || `rec-${Date.now()}`,
    createdAt: record.createdAt || now,
    updatedAt: now,
  };

  let updatedList: MonthlyRecord[];
  if (existingIndex >= 0) {
    updatedList = [...current];
    updatedList[existingIndex] = preparedRecord;
  } else {
    updatedList = [preparedRecord, ...current];
  }

  // 1. Save to LocalStorage immediately
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  }

  // 2. Auto-sync to Firebase Firestore
  try {
    const docRef = doc(db, 'monthly_records', preparedRecord.id);
    await setDoc(docRef, {
      ...preparedRecord,
      _syncedAt: now,
    }, { merge: true });

    if (onSyncStatus) {
      onSyncStatus({
        success: true,
        cloud: true,
        message: 'Data berhasil disimpan ke cloud Firebase & lokal!',
      });
    }
  } catch (error: any) {
    console.warn('Firestore auto-sync warning:', error);
    if (onSyncStatus) {
      onSyncStatus({
        success: true,
        cloud: false,
        message: 'Tersimpan di perangkat lokal (menunggu koneksi cloud Firebase).',
      });
    }
  }

  return updatedList;
}

/**
 * Delete record from LocalStorage and Firebase Firestore
 */
export async function deleteRecordFromCloudAndLocal(id: string): Promise<MonthlyRecord[]> {
  const current = getLocalRecords();
  const filtered = current.filter(r => r.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  try {
    const docRef = doc(db, 'monthly_records', id);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Error deleting document from Firestore:', e);
  }

  return filtered;
}

/**
 * Subscribes to real-time updates from Firebase Firestore with fallback to local records
 */
export function subscribeToMonthlyRecords(
  onUpdate: (records: MonthlyRecord[]) => void
): () => void {
  // Emit initial local records right away
  onUpdate(getLocalRecords());

  try {
    const recordsCol = collection(db, 'monthly_records');
    const unsubscribe = onSnapshot(recordsCol, (snapshot) => {
      if (!snapshot.empty) {
        const cloudRecords: MonthlyRecord[] = [];
        snapshot.forEach((docSnap) => {
          cloudRecords.push(docSnap.data() as MonthlyRecord);
        });

        // Merge cloud records with local records
        if (cloudRecords.length > 0) {
          cloudRecords.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudRecords));
          }
          onUpdate(cloudRecords);
        }
      }
    }, (error) => {
      console.warn('Firestore subscription offline/fallback to local:', error);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('Could not initialize Firestore listener:', err);
    return () => {};
  }
}
