import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  expiryDate: Date;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiryDate, className = "" }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = expiryDate.getTime();
      const difference = expiry - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiryDate]);

  if (isExpired) {
    return (
      <div className={`text-red-500 font-semibold ${className}`}>
        Prenotazione scaduta
      </div>
    );
  }

  return (
    <div className={`flex justify-around items-center w-full bg-[#EC6F7B]/15 ${className} divide-x divide-[#EC6F7B] rounded-sm py-4`}>
      <div className="flex flex-col items-center min-w-[60px]">
        <div className="text-2xl font-bold text-[#EC6F7B]">{timeLeft.days}</div>
        <div className="text-xs text-[#EC6F7B] uppercase">giorni</div>
      </div>
      <div className="flex flex-col items-center min-w-[60px]">
        <div className="text-2xl font-bold text-[#EC6F7B]">{timeLeft.hours}</div>
        <div className="text-xs text-[#EC6F7B] uppercase">ore</div>
      </div>
      <div className="flex flex-col items-center min-w-[60px]">
        <div className="text-2xl font-bold text-[#EC6F7B]">{timeLeft.minutes}</div>
        <div className="text-xs text-[#EC6F7B] uppercase">minuti</div>
      </div>
      <div className="flex flex-col items-center min-w-[60px]">
        <div className="text-2xl font-bold text-[#EC6F7B]">{timeLeft.seconds}</div>
        <div className="text-xs text-[#EC6F7B] uppercase">secondi</div>
      </div>
    </div>
  );
};

export default CountdownTimer;