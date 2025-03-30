import React, { useState, useEffect } from 'react';
import { FaClock } from 'react-icons/fa';
import './CountdownNotification.css';

const CountdownNotification = ({ countdown }) => {
  const [timeLeft, setTimeLeft] = useState(countdown);

  useEffect(() => {
    if (!countdown || countdown === "Overdue") return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (!prev || prev.total_seconds <= 0) return prev;

        const newSeconds = prev.total_seconds - 1;
        const days = Math.floor(newSeconds / (24 * 3600));
        const hours = Math.floor((newSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((newSeconds % 3600) / 60);

        return {
          days,
          hours,
          minutes,
          total_seconds: newSeconds
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  if (!timeLeft) return null;
  if (timeLeft === "Overdue") return (
    <div className="countdown-notification overdue">
      <FaClock />
      <span>Overdue!</span>
    </div>
  );

  if (timeLeft.total_seconds <= 86400) { // Less than 24 hours
    return (
      <div className="countdown-notification urgent">
        <FaClock />
        <span>
          Time remaining: {timeLeft.hours}h {timeLeft.minutes}m
        </span>
      </div>
    );
  }

  return (
    <div className="countdown-notification">
      <FaClock />
      <span>
        Time remaining: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
      </span>
    </div>
  );
};

export default CountdownNotification;