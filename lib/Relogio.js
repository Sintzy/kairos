"use client";
import { useState, useEffect } from 'react';

const Relogio = () => {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const updateTime = () => setTime(new Date());
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  return (
      <span>
      {time ? `São ${formatTime(time)} horas` : "⏳"}
    </span>
  );
};

export default Relogio;
