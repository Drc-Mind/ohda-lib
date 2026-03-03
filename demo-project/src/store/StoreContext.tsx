import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { JournalEntry } from '@drcmind/ohada-lib';
import type { AppRecord, AppStore, RecordType, RecordMeta } from '../types/app';

const STORAGE_KEY = 'ohada_erp_v1';

function loadStore(): AppStore {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { openingEntry: null, records: [] };
  } catch {
    return { openingEntry: null, records: [] };
  }
}

function saveStore(data: AppStore): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

interface StoreContextValue {
  store: AppStore;
  setOpeningEntry: (entry: JournalEntry) => void;
  addRecord: (params: {
    label: string;
    amount: number;
    type: RecordType;
    meta: RecordMeta;
    journalEntries: JournalEntry[];
  }) => void;
  resetStore: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<AppStore>(loadStore);

  const update = (next: AppStore) => {
    saveStore(next);
    setStore(next);
  };

  const setOpeningEntry = (entry: JournalEntry) => {
    update({ ...store, openingEntry: entry });
  };

  const addRecord = ({
    label,
    amount,
    type,
    meta,
    journalEntries,
  }: {
    label: string;
    amount: number;
    type: RecordType;
    meta: RecordMeta;
    journalEntries: JournalEntry[];
  }) => {
    const record: AppRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      label,
      amount,
      type,
      meta,
      journalEntries,
    };
    update({ ...store, records: [...store.records, record] });
  };

  const resetStore = () => {
    const empty: AppStore = { openingEntry: null, records: [] };
    saveStore(empty);
    setStore(empty);
  };

  return (
    <StoreContext.Provider value={{ store, setOpeningEntry, addRecord, resetStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
