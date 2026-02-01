'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useState, useRef, useCallback } from 'react';

// Debounce helper
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
    let timeoutId: ReturnType<typeof setTimeout>;
    return ((...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), ms);
    }) as T;
}

export type CompressionStatus = 'IDLE' | 'LOADING_CORE' | 'COMPRESSING' | 'UPLOADING' | 'DONE' | 'ERROR';

export function useVideoCompressor() {
    const [status, setStatus] = useState<CompressionStatus>('IDLE');
    const [progress, setProgress] = useState(0);
    const ffmpegRef = useRef<FFmpeg | null>(null);

    // Debounced progress setter to reduce UI flickering
    const debouncedSetProgress = useCallback(
        debounce((value: number) => setProgress(value), 100),
        []
    );

    const compressVideo = useCallback(async (file: File): Promise<Blob | null> => {
        // Only run on client
        if (typeof window === 'undefined') {
            console.warn('Compression attempted on server - skipping');
            return null;
        }

        // Bypass compression if file is small enough (e.g. < 15MB)
        // This avoids downloading heavy FFmpeg WASM for quick videos
        if (file.size < 15 * 1024 * 1024) {
            console.log('File is small enough (<15MB), skipping compression');
            return null; // Returning null keeps the original file
        }

        try {
            setStatus('LOADING_CORE');
            setProgress(0);

            // Lazy initialize FFmpeg
            if (!ffmpegRef.current) {
                ffmpegRef.current = new FFmpeg();
            }
            const ffmpeg = ffmpegRef.current;

            if (!ffmpeg.loaded) {
                const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
                await ffmpeg.load({
                    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
                });
            }

            setStatus('COMPRESSING');
            const inputName = 'input.mov';
            const outputName = 'output.mp4';

            await ffmpeg.writeFile(inputName, await fetchFile(file));

            ffmpeg.on('progress', ({ progress }) => {
                debouncedSetProgress(Math.round(progress * 100));
            });

            // Fast mobile compression settings
            await ffmpeg.exec([
                '-i', inputName,
                '-t', '30',
                '-vf', 'scale=480:-2',  // 480p is sufficient for reaction bubbles
                '-c:v', 'libx264',
                '-crf', '28',           // Higher CRF = smaller file (28 is good for mobile)
                '-preset', 'ultrafast', // Fastest encoding speed
                '-tune', 'zerolatency', // Optimize for streaming/fast start
                outputName
            ]);

            const data = await ffmpeg.readFile(outputName);
            setProgress(100);
            
            return new Blob([data as any], { type: 'video/mp4' });

        } catch (error) {
            console.error('Compression Failed', error);
            // On error, return null to fall back to original file upload
            return null;
        }
    }, [debouncedSetProgress]);

    const setUploading = useCallback(() => {
        setStatus('UPLOADING');
    }, []);

    const setDone = useCallback(() => {
        setStatus('DONE');
    }, []);

    const reset = useCallback(() => {
        setStatus('IDLE');
        setProgress(0);
    }, []);

    return { 
        compressVideo, 
        status, 
        progress, 
        setUploading, 
        setDone, 
        reset 
    };
}
