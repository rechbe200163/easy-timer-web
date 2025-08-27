'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState, useEffect, useRef } from 'react';

export default function Countdown() {
  // Eingaben für Gesamtzeit
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);

  // Eingabe für Intervalldauer (in Minuten)
  const [intervalMinutes, setIntervalMinutes] = useState(3);

  // Timer State
  const [totalTime, setTotalTime] = useState(1800); // 30min default
  const [time, setTime] = useState(1800);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // AudioRefs
  const beepRef = useRef<HTMLAudioElement>(null); // Intervall
  const completeRef = useRef<HTMLAudioElement>(null); // Ende

  // Kreis-Daten
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = (time / totalTime) * circumference;

  // Timer Effekt
  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          const next = prev - 1;
          if (next >= 0) {
            const elapsed = totalTime - next;
            const intervalSeconds = intervalMinutes * 60;

            // Intervall-Ton
            if (time !== 0 && elapsed > 0 && elapsed % intervalSeconds === 0) {
              beepRef.current?.play().catch(() => {});
            }
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, intervalMinutes, totalTime]);

  // Ende → kompletter Ton
  useEffect(() => {
    if (time === 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
      completeRef.current?.play().catch(() => {});
    }
  }, [time]);

  // Zeit aus Input übernehmen
  const applyTime = () => {
    const newTotal = hours * 3600 + minutes * 60 + seconds;
    setTotalTime(newTotal > 0 ? newTotal : 1);
    setTime(newTotal > 0 ? newTotal : 1);
  };

  const handleStart = () => {
    if (time > 0) {
      // Browser-Audio entsperren
      if (beepRef.current) {
        beepRef.current
          .play()
          .then(() => {
            beepRef.current?.pause();
            if (beepRef.current) {
              beepRef.current.currentTime = 0;
            }
          })
          .catch(() => {});
      }
      if (completeRef.current) {
        completeRef.current
          .play()
          .then(() => {
            completeRef.current?.pause();
            if (completeRef.current) {
              completeRef.current.currentTime = 0;
            }
          })
          .catch(() => {});
      }

      setIsRunning(true);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    applyTime();
  };

  // Format hh:mm:ss
  const formatTime = (t: number) => {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className='flex flex-col items-center gap-6 p-8'>
      {/* Audio */}
      <audio ref={beepRef} src='/beep.mp3' preload='auto' />
      <audio ref={completeRef} src='/beep-complete.mp3' preload='auto' />

      {/* Kreis */}
      <svg width={200} height={200}>
        <circle
          stroke='#e5e7eb'
          fill='transparent'
          strokeWidth='10'
          r={radius}
          cx={100}
          cy={100}
        />
        <circle
          stroke='#3b82f6'
          fill='transparent'
          strokeWidth='10'
          r={radius}
          cx={100}
          cy={100}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap='round'
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
        <text
          x='50%'
          y='50%'
          textAnchor='middle'
          dy='.3em'
          fontSize='22'
          fill='#111827'
        >
          {formatTime(time)}
        </text>
      </svg>

      {/* Eingaben */}
      <div className='flex flex-col gap-2 items-center'>
        <div className='flex gap-2 items-center'>
          <div className='flex flex-col'>
            <Label>Stunden</Label>
            <Input
              type='number'
              min='0'
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className='w-16 border rounded p-1 text-center'
            />
          </div>
          <span>:</span>
          <div className='flex flex-col'>
            <Label>Minuten</Label>
            <Input
              type='number'
              min='0'
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className='w-16 border rounded p-1 text-center'
            />
          </div>
          <span>:</span>
          <div className='flex flex-col'>
            <Label>Sekunden</Label>
            <Input
              type='number'
              min='0'
              value={seconds}
              onChange={(e) => setSeconds(Number(e.target.value))}
              className='w-16 border rounded p-1 text-center'
            />
          </div>
          <Button
            onClick={applyTime}
            className='ml-2 px-3 py-1 bg-blue-500 text-white rounded'
          >
            Set
          </Button>
        </div>
        <div className='flex gap-2 items-center'>
          <span>Intervall (Minuten):</span>
          <Input
            type='number'
            min='1'
            value={intervalMinutes}
            onChange={(e) => setIntervalMinutes(Number(e.target.value))}
            className='w-16 border rounded p-1 text-center'
          />
        </div>
      </div>

      {/* Steuerung */}
      <div className='flex gap-4'>
        <Button
          onClick={handleStart}
          className='px-4 py-2 bg-green-500 text-white rounded-lg'
        >
          Start
        </Button>
        <Button
          onClick={handleStop}
          className='px-4 py-2 bg-yellow-500 text-white rounded-lg'
        >
          Stop
        </Button>
        <Button
          onClick={handleReset}
          className='px-4 py-2 bg-red-500 text-white rounded-lg'
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
