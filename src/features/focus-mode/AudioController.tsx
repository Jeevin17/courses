import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AudioController = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const toggleAudio = () => {
        if (!isPlaying) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;
            const bufferSize = 4096;
            const whiteNoise = ctx.createScriptProcessor(bufferSize, 1, 1);

            let lastOut = 0;
            whiteNoise.onaudioprocess = (e) => {
                const output = e.outputBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    output[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = output[i];
                    output[i] *= 3.5;
                }
            };

            const gainNode = ctx.createGain();
            gainNode.gain.value = volume;
            gainNodeRef.current = gainNode;

            whiteNoise.connect(gainNode);
            gainNode.connect(ctx.destination);
            setIsPlaying(true);
        } else {
            audioContextRef.current?.close();
            setIsPlaying(false);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVol = parseFloat(e.target.value);
        setVolume(newVol);
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = newVol;
        }
    };

    return (
        <div className="flex items-center gap-4 bg-glass-surface p-3 rounded-xl border border-glass-border backdrop-blur-md">
            <button
                onClick={toggleAudio}
                className="text-text-primary hover:text-accent-glow transition-colors relative"
                aria-label={isPlaying ? "Mute Brown Noise" : "Play Brown Noise"}
            >
                {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
                {isPlaying && (
                    <motion.div
                        className="absolute -inset-2 bg-accent-glow rounded-full -z-10"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
            </button>
            <AnimatePresence>
                {isPlaying && (
                    <motion.input
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 96, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="h-1 bg-glass-border rounded-lg appearance-none cursor-pointer accent-accent-glow"
                    />
                )}
            </AnimatePresence>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">NOISE</span>
        </div>
    );
};
