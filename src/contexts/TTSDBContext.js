import React, { createContext, useState, useCallback, useMemo } from "react";

// TTS Database Context - IndexedDB 관리 (TTS 오디오 파일 캐싱)
export const TTSDBContext = createContext(null);

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
            const request = indexedDB.open(dbName, 1);
            request.onerror = (e) => rej(e.target.errorCode);
            request.onsuccess = (e) => {
                const database = e.target.result;
                setDb(database);
                res(database);
            };
            request.onupgradeneeded = (e) => {
                const database = e.target.result;
                database.createObjectStore(storeName, { keyPath: 'key' });
                setDb(database);
            };
        });
    }, [db]);

    const getFromDB = useCallback(async (k) => {
        const database = db || await initDB();
        return new Promise((resolve) => {
            const tx = database.transaction([storeName], 'readonly');
            const req = tx.objectStore(storeName).get(k);
            req.onsuccess = (e) => resolve(e.target.result?.data || null);
            req.onerror = () => resolve(null);
        });
    }, [db, initDB]);

    const saveToDB = useCallback(async (k, d) => {
        const database = db || await initDB();
        return new Promise((resolve) => {
            const tx = database.transaction([storeName], 'readwrite');
            tx.objectStore(storeName).put({ key: k, data: d });
            tx.oncomplete = () => resolve();
        });
    }, [db, initDB]);

    const value = useMemo(() => ({
        initDB,
        getFromDB,
        saveToDB
    }), [initDB, getFromDB, saveToDB]);

    return (
        <TTSDBContext.Provider value={value}>
            {children}
        </TTSDBContext.Provider>
    );
};
