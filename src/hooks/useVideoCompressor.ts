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

    interface CompressOptions {
        rotateToPortrait?: boolean; // Rotate 90° clockwise if video is landscape
    }

    const compressVideo = useCallback(async (file: File, options?: CompressOptions): Promise<Blob | null> => {
        // Only run on client
        if (typeof window === 'undefined') {
            console.warn('Compression attempted on server - skipping');
            return null;
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

            // Build video filter string
            // If rotateToPortrait is true, we add transpose=1 (90° clockwise)
            let videoFilter = 'scale=720:-2';  // 720p width, auto height
            if (options?.rotateToPortrait) {
                // transpose=1 = 90° clockwise rotation
                // After rotation, we scale based on new dimensions
                videoFilter = 'transpose=1,scale=-2:720';  // After rotation, height becomes 720
                console.log('[Compressor] Applying 90° rotation for portrait output');
            }

            // Faster compression: higher CRF, simpler scaling
            await ffmpeg.exec([
                '-i', inputName,
                '-t', '30',
                '-vf', videoFilter,
                '-c:v', 'libx264',
                '-crf', '23',           // Lower CRF = higher quality (18-28 is good range)
                '-preset', 'veryfast',
                '-tune', 'fastdecode',
                outputName
            ]);

            const data = await ffmpeg.readFile(outputName);
            setProgress(100);
            
            return new Blob([data as any], { type: 'video/mp4' });

        } catch (error) {
            console.error('Compression Failed', error);
            setStatus('ERROR');
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
