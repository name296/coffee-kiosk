import { useState} from "react";

let db;
const dbName = 'TTSDatabase';
const storeName = 'TTSStore';
const volumeValue = {
    0: 0,
    1: 0.5,
    2: 0.75,
    3: 1
    };  
let isPlaying = false;
let replayText = '';
// let currentlyPlayingAudio;

export function useTextHandler(volume) {

    const initDB = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, 1);
    
            request.onerror = (event) => {
                console.error('Database error:', event.target.errorCode);
                reject(event.target.errorCode);
            };
    
            request.onsuccess = (event) => {
                db = event.target.result;
                resolve(db);
            };
    
            request.onupgradeneeded = (event) => {
                db = event.target.result;
                db.createObjectStore(storeName, { keyPath: 'key' });
            };
        });
    }

    const handleText = (txt, replayFlag = true, newVolume = -1) => {
        if (!txt) return;

        if (replayFlag) {
            replayText = txt;
        }

        const speed = 1;
        if(newVolume != -1){
            playText(txt, speed, volumeValue[newVolume]);
        }else{
            playText(txt, speed, volumeValue[volume]);
        }

    };

    const handleReplayText = () => {
        if (replayText) {
            handleText(replayText, false); // replayFlag는 false로 설정
        }
    };
    

//중복코드 제거
async function playText(text, speed, volume) {
    console.log(volume, text)
    const audioPlayer = document.getElementById('audioPlayer');
    const audioKey = `audio_${text}`;
    const storedAudio = await getFromDB(audioKey);
    if (storedAudio) {
        // IndexedDB에서 오디오를 가져와서 재생
        audioPlayer.src = storedAudio;
        audioPlayer.playbackRate = speed;
        audioPlayer.volume = volume;
        audioPlayer.play().catch((error) => {
            if (error.name === "AbortError") {
                // AbortError를 무시
                console.warn("Audio playback was interrupted, ignoring error:", error);
            } else {
                // 다른 오류는 콘솔에 출력
                console.error("Error during audio playback:", error);
            }
        });
        // currentlyPlayingAudio = audioPlayer;
        return; // 이미 재생을 시작했으므로 함수 종료
    }

    // 이미 재생 중인 경우 종료 (재생 중복 방지)
    if (isPlaying) return; 

    isPlaying = true; // 새로운 재생 시작

    // TTS API 호출하여 텍스트를 오디오로 변환
    try {
        const response = await fetch('http://gtts.tovair.com:5000/api/tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        });

        if (response.status === 201) {
            const data = await response.json();
            const filename = data.filename;
            const downloadUrl = `http://gtts.tovair.com:5000/api/download/${filename}`;

            // 오디오 파일 다운로드 및 재생
            const fileResponse = await fetch(downloadUrl);
            const fileBlob = await fileResponse.blob();
            const fileUrl = URL.createObjectURL(fileBlob);

            // 오디오 플레이어에 MP3 파일 설정 및 재생
            audioPlayer.src = fileUrl;
            audioPlayer.playbackRate = speed;
            audioPlayer.volume = volume;
            audioPlayer.play();
            // currentlyPlayingAudio = audioPlayer;

            // 오디오 파일을 IndexedDB에 저장
            const reader = new FileReader();
            reader.readAsDataURL(fileBlob);
            reader.onloadend = async function() {
                await saveToDB(audioKey, reader.result);
                isPlaying = false; // IndexedDB 저장 완료 후 상태 업데이트
            };
        } else {
            console.error('Failed to convert text to speech. Status:', response.status);
            // 폴백: 브라우저 내장 TTS 사용
            useBrowserTTS(text, speed, volume);
            isPlaying = false;
        }
    } catch (error) {
        console.error('Error during TTS processing (falling back to browser TTS):', error);
        // 폴백: 브라우저 내장 TTS 사용 (HTTPS에서도 작동)
        useBrowserTTS(text, speed, volume);
        isPlaying = false;
    }
}

async function getFromDB(key) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = (event) => {
            resolve(event.target.result ? event.target.result.data : null);
        };

        request.onerror = (event) => {
            console.error('Failed to retrieve data:', event.target.errorCode);
            reject(event.target.errorCode);
        };
    });
}

async function saveToDB(key, data) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put({ key, data });

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            console.error('Failed to save data:', event.target.errorCode);
            reject(event.target.errorCode);
        };
    });
}

async function getDB() {
    if (!db) {
        await initDB();
    }
    return db;
}

// 브라우저 내장 TTS (폴백용)
function useBrowserTTS(text, speed, volume) {
    if ('speechSynthesis' in window) {
        // 기존 음성 중지
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR'; // 한국어
        utterance.rate = speed;
        utterance.volume = volume;
        
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn('Browser does not support Speech Synthesis API');
    }
}

    return { initDB, handleText, handleReplayText};
}

// export async function handleText(txt, replayFlag = true) {
//    console.log(txt)
//     if(!txt) return;
//     // 다시 듣기를 위해 저장
//     if(replayFlag) replayText = txt;
//     const { volume } = useContext(AppContext);

//     let thisTTS = txt;
//     let speed = 1;
//     // let volume = 0.25;
   
//     playText(thisTTS, speed, volume);

// }

// 다시 듣기 함수
// export async function handleReplayText(){
//     console.log('replayText', replayText)
//     handleText(replayText);
// }
