import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Db } from '../types';
import { createSeed } from '../data/seed';


const STORAGE_KEY = 'firetech-db-v2';

const load = (): Db => {
    const seed = createSeed();
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return { ...seed, ...(JSON.parse(raw) as Partial<Db>) };
    } catch {
        /* dữ liệu hỏng → dùng dữ liệu mẫu */
    }
    return seed;
};

interface StoreValue {
    db: Db;
    update: <K extends keyof Db>(key: K, fn: (prev: Db[K]) => Db[K]) => void;
    reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
    const [db, setDb] = useState<Db>(load);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
        } catch {
            /* hết dung lượng → bỏ qua */
        }
    }, [db]);

    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) setDb(JSON.parse(e.newValue) as Db);
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const update = useCallback(<K extends keyof Db>(key: K, fn: (prev: Db[K]) => Db[K]) => {
        setDb((prev) => ({ ...prev, [key]: fn(prev[key]) }));
    }, []);

    const reset = useCallback(() => setDb(createSeed()), []);

    const value = useMemo(() => ({ db, update, reset }), [db, update, reset]);
    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error('useStore phải nằm trong <StoreProvider>');
    return ctx;
};

/** Tra cứu nhanh theo id: product(id), user(id), project(id). */
export const useLookup = () => {
    const { db } = useStore();
    return useMemo(() => {
        const products = new Map(db.products.map((p) => [p.id, p]));
        const users = new Map(db.users.map((u) => [u.id, u]));
        const projects = new Map(db.projects.map((p) => [p.id, p]));
        return {
            product: (id?: string) => (id ? products.get(id) : undefined),
            user: (id?: string) => (id ? users.get(id) : undefined),
            project: (id?: string) => (id ? projects.get(id) : undefined),
            userName: (id?: string) => (id ? users.get(id)?.name ?? '—' : '—'),
        };
    }, [db.products, db.users, db.projects]);
};
