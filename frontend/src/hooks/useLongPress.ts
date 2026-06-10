import { useState, useRef } from "react";

export default function useLongPress(callback: () => void, ms = 500) {
  const [startLongPress, setStartLongPress] = useState(false);
  const timerRef = useRef<any>(null);

  const start = () => setStartLongPress(true);
  const stop = () => setStartLongPress(false);

  const handleStart = () => {
    timerRef.current = setTimeout(() => {
      callback();
    }, ms);
  };

  const handleStop = () => {
    clearTimeout(timerRef.current);
  };

  return {
    onMouseDown: handleStart,
    onMouseUp: handleStop,
    onMouseLeave: handleStop,
    onTouchStart: handleStart,
    onTouchEnd: handleStop,
  };
}