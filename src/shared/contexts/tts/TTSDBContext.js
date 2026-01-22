import React, { createContext, useState, useCallback, useMemo, useContext } from "react";

// TTS Database Context - IndexedDB 관리 (TTS 오디오 파일 캐싱)
export const TTSDBContext = createContext();

export const TTSDBProvider = ({ children }) => {
    const [db, setDb] = useState(null);
    const dbName = 'TTSDatabase';
    const storeName = 'TTSStore';

    const initDB = useCallback(() => {
        return new Promise((res, rej) => {
            if (db) {
                res(db);
                return;
            }
            const r = indexedDB.open(dbName, 1);
            r.onerror = (e) => rej(e.target.errorCode);
            r.onsuccess = (e) => {
                const database = e.target.result;
                setDb(database);
                res(database);
            };
            r.onupgradeneeded = (e) => {
                const database = e.target.result;
                database.createObjectStore(storeName, { keyPath: 'key' });
                setDb(database);
            };
        });
    }, [db]);

    const getFromDB = useCallback(async (k) => {
        const database = db || await initDB();
        return new Promise((r) => {
            const t = database.transaction([storeName], 'readonly');
            const req = t.objectStore(storeName).get(k);
            req.onsuccess = (e) => r(e.target.result?.data || null);
            req.onerror = () => r(null);
        });
    }, [db, initDB]);

    const saveToDB = useCallback(async (k, d) => {
        const database = db || await initDB();
        return new Promise((r) => {
            const t = database.transaction([storeName], 'readwrite');
            t.objectStore(storeName).put({ key: k, data: d });
            t.oncomplete = r;
        });
    }, [db, initDB]);

    const value = useMemo(() => ({
        db,
        initDB,
        getFromDB,
        saveToDB
    }), [db, initDB, getFromDB, saveToDB]);

    return (
        <TTSDBContext.Provider value={value}>
            {children}
        </TTSDBContext.Provider>
    );
};

export const useTTSDB = () => {
    const context = useContext(TTSDBContext);
    return {
        db: context?.db ?? null,
        initDB: context?.initDB ?? (async () => null),
        getFromDB: context?.getFromDB ?? (async () => null),
        saveToDB: context?.saveToDB ?? (async () => { })
    };
};
