import Countdown from '@/components/Countdown';

export default function Home() {
  return (
    <main className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <Countdown />
      </div>
    </main>
  );
}
