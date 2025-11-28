// ============================================================================
// TTS (Text-to-Speech) 훅
// ============================================================================

let db;
const dbName = 'TTSDatabase';
const storeName = 'TTSStore';
const volumeValue = { 0: 0, 1: 0.5, 2: 0.75, 3: 1 };
let isPlaying = false;
let replayText = '';

export function useTextHandler(volume) {
  const initDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
      request.onerror = (e) => reject(e.target.errorCode);
      request.onsuccess = (e) => { db = e.target.result; resolve(db); };
      request.onupgradeneeded = (e) => {
        db = e.target.result;
        db.createObjectStore(storeName, { keyPath: 'key' });
      };
    });
  };

  const handleText = (txt, replayFlag = true, newVolume = -1) => {
    if (!txt) return;
    if (replayFlag) replayText = txt;
    const speed = 1;
    const vol = newVolume !== -1 ? volumeValue[newVolume] : volumeValue[volume];
    playText(txt, speed, vol);
  };

  const handleReplayText = () => {
    if (replayText) handleText(replayText, false);
  };

  return { initDB, handleText, handleReplayText };
}

async function playText(text, speed, volume) {
  const audioPlayer = document.getElementById('audioPlayer');
  if (!audioPlayer) return;
  
  const audioKey = `audio_${text}`;
  const storedAudio = await getFromDB(audioKey);
  
  if (storedAudio) {
    audioPlayer.src = storedAudio;
    audioPlayer.playbackRate = speed;
    audioPlayer.volume = volume;
    audioPlayer.play().catch(() => {});
    return;
  }

  if (isPlaying) return;
  isPlaying = true;

  try {
    const response = await fetch('http://gtts.tovair.com:5000/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (response.status === 201) {
      const data = await response.json();
      const fileResponse = await fetch(`http://gtts.tovair.com:5000/api/download/${data.filename}`);
      const fileBlob = await fileResponse.blob();
      const fileUrl = URL.createObjectURL(fileBlob);

      audioPlayer.src = fileUrl;
      audioPlayer.playbackRate = speed;
      audioPlayer.volume = volume;
      audioPlayer.play();

      const reader = new FileReader();
      reader.readAsDataURL(fileBlob);
      reader.onloadend = async () => {
        await saveToDB(audioKey, reader.result);
        isPlaying = false;
      };
    } else {
      useBrowserTTS(text, speed, volume);
      isPlaying = false;
    }
  } catch {
    useBrowserTTS(text, speed, volume);
    isPlaying = false;
  }
}

function useBrowserTTS(text, speed, volume) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    u.rate = speed;
    u.volume = volume;
    window.speechSynthesis.speak(u);
  }
}

async function getFromDB(key) {
  const database = await getDB();
  return new Promise((resolve) => {
    const tx = database.transaction([storeName], 'readonly');
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = (e) => resolve(e.target.result?.data || null);
    req.onerror = () => resolve(null);
  });
}

async function saveToDB(key, data) {
  const database = await getDB();
  return new Promise((resolve) => {
    const tx = database.transaction([storeName], 'readwrite');
    tx.objectStore(storeName).put({ key, data });
    tx.oncomplete = resolve;
  });
}

async function getDB() {
  if (!db) {
    await new Promise((resolve) => {
      const req = indexedDB.open(dbName, 1);
      req.onsuccess = () => { db = req.result; resolve(); };
      req.onupgradeneeded = (e) => {
        db = e.target.result;
        db.createObjectStore(storeName, { keyPath: 'key' });
      };
    });
  }
  return db;
}

