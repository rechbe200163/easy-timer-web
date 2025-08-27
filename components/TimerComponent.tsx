import React from 'react';
import CircleProgress from './ui/progress';

function TimerComponent({
  duration,
  lapped,
}: {
  duration: number;
  lapped: number;
}) {
  return (
    <div>
      <CircleProgress />
    </div>
  );
}

export default TimerComponent;
