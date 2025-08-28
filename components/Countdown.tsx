'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

export default function Countdown() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);
  const [intervalMinutes, setIntervalMinutes] = useState(3);
  const theme = useTheme();

  // Timer State
  const [totalTime, setTotalTime] = useState(1800); // 30min default
  const [time, setTime] = useState(1800);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // AudioRefs
  const beepRef = useRef<HTMLAudioElement>(null);
  const completeRef = useRef<HTMLAudioElement>(null);

  // Circle data
  const radius = 90;
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
  }, [isRunning, intervalMinutes, totalTime, time]);

  useEffect(() => {
    if (time === 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
      completeRef.current?.play().catch(() => {});
    }
  }, [time]);

  const [error, setError] = useState<string | null>(null);

  const applyTime = () => {
    const newTotal = hours * 3600 + minutes * 60 + seconds;
    const intervalSeconds = intervalMinutes * 60;

    // Edge Cases prüfen
    if (newTotal <= 0) {
      setError('❌ Dauer muss größer als 0 sein.');
      return;
    }
    if (intervalSeconds <= 0) {
      setError('❌ Intervall muss größer als 0 sein.');
      return;
    }
    if (intervalSeconds > newTotal) {
      setError('❌ Intervall darf nicht länger als die Gesamtdauer sein.');
      return;
    }
    if (newTotal % intervalSeconds !== 0) {
      setError(
        '⚠️ Dauer ist kein Vielfaches des Intervalls – letzter Abschnitt ist kürzer.'
      );
      // wir lassen das trotzdem zu, aber zeigen Hinweis
    } else {
      setError(null);
    }

    // Werte übernehmen
    setTotalTime(newTotal);
    setTime(newTotal);
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

  const formatTime = (t: number) => {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className='bg-background/80 backdrop-blur-sm shadow-xl border-0'>
      <CardContent className='p-8'>
        {/* Audio */}
        <audio ref={beepRef} src='/beep.mp3' preload='auto' />
        <audio ref={completeRef} src='/beep-complete.mp3' preload='auto' />

        <div className='flex justify-center mb-8'>
          <div className='relative'>
            <svg width={220} height={220} className='transform -rotate-90'>
              <circle
                stroke='rgb(51 65 85)' // dark gray
                strokeWidth='8'
                r={radius}
                cx={110}
                cy={110}
                className='drop-shadow-sm'
              />
              {/* Progress circle */}
              <circle
                stroke='url(#gradient)'
                fill='transparent'
                strokeWidth='8'
                r={radius}
                cx={110}
                cy={110}
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap='round'
                className='transition-all duration-1000 ease-linear drop-shadow-sm'
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient
                  id='gradient'
                  x1='0%'
                  y1='0%'
                  x2='100%'
                  y2='100%'
                >
                  <stop offset='0%' stopColor='rgb(34 197 94)' />
                  {/* green-500 */}
                  <stop offset='100%' stopColor='rgb(16 185 129)' />
                  {/* emerald-500 */}
                </linearGradient>
              </defs>
            </svg>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='text-center'>
                <div className='text-3xl font-mono font-bold text-foreground  tracking-wider'>
                  {formatTime(time)}
                </div>
                <div className='text-xs text-foreground/80 mt-1 font-medium'>
                  {isRunning ? 'Running' : 'Paused'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col'>
          <div className='bg-background rounded-xl px-6 '>
            <div className='flex items-center gap-2 mb-4'>
              <Clock className='w-4 h-4 text-slate-600' />
              <Label className='text-sm font-semibold text-slate-700'>
                Dauer festlegen
              </Label>
            </div>

            <div className='flex items-center justify-center gap-3 mb-4'>
              <div className='text-center'>
                <Label className='text-xs text-slate-600 mb-1 block'>
                  Stunden
                </Label>
                <Input
                  type='number'
                  min='0'
                  max='23'
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className='w-16 text-center font-mono font-semibold   focus:border-blue-500 focus:ring-blue-500'
                />
              </div>
              <div className='text-slate-400 font-bold text-lg mt-5'>:</div>
              <div className='text-center'>
                <Label className='text-xs text-slate-600 mb-1 block'>
                  Minuten
                </Label>
                <Input
                  type='number'
                  min='0'
                  max='59'
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className='w-16 text-center font-mono font-semibold   focus:border-blue-500 focus:ring-blue-500'
                />
              </div>
              <div className='text-slate-400 font-bold text-lg mt-5'>:</div>
              <div className='text-center'>
                <Label className='text-xs text-slate-600 mb-1 block'>
                  Sekunden
                </Label>
                <Input
                  type='number'
                  min='0'
                  max='59'
                  value={seconds}
                  onChange={(e) => setSeconds(Number(e.target.value))}
                  className='w-16 text-center font-mono font-semibold   focus:border-blue-500 focus:ring-blue-500'
                />
              </div>
            </div>

            <div className='bg-background rounded-xl p-6 border'>
              <Label className='text-sm font-semibold text-slate-700 mb-3 block'>
                Benachrichtigungsintervall
              </Label>
              <div className='flex items-center gap-3'>
                <Input
                  type='number'
                  min='1'
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                  className='w-20 text-center font-mono font-semibold   focus:border-blue-500 focus:ring-blue-500'
                />
                <span className='text-sm text-slate-600'>
                  {intervalMinutes > 1 ? 'Minuten' : 'Minute'}
                </span>
              </div>
            </div>
            <div className='mt-4'>
              <Button
                onClick={applyTime}
                variant='outline'
                className='w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent'
              >
                Zeit übernehmen
              </Button>
            </div>
          </div>
        </div>
        {error && (
          <div className='mt-3 text-sm font-medium text-red-600'>{error}</div>
        )}

        <div className='flex gap-3 mt-8'>
          <Button
            onClick={handleStart}
            disabled={isRunning || time === 0}
            className='flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Play className='w-4 h-4 mr-2' />
            Start
          </Button>
          <Button
            onClick={handleStop}
            disabled={!isRunning}
            variant='outline'
            className='flex-1 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent'
          >
            <Pause className='w-4 h-4 mr-2' />
            Pause
          </Button>
          <Button
            onClick={handleReset}
            variant='outline'
            className='flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 font-semibold py-3 rounded-xl transition-all duration-200 bg-transparent'
          >
            <RotateCcw className='w-4 h-4 mr-2' />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
