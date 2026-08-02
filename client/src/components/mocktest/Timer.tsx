import { useEffect, useState } from "react";

interface TimerProps {
  minutes: number;
  onComplete: () => void;
}

const Timer = ({
  minutes,
  onComplete,
}: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);

  useEffect(() => {

    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);

  }, [timeLeft, onComplete]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 rounded-lg px-5 py-3 inline-block">

      <h3 className="font-semibold text-red-700 dark:text-red-300 text-sm">
        Time Left
      </h3>

      <p className="text-3xl font-bold text-red-600 dark:text-red-400 tabular-nums">
        {String(mins).padStart(2, "0")}:
        {String(secs).padStart(2, "0")}
      </p>

    </div>
  );
};

export default Timer;