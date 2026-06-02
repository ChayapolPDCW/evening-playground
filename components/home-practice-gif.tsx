"use client";

import { useEffect, useState } from "react";

const baseGifs = ["/gif/i_love.gif", "/gif/love_job.gif", "/gif/raniny.gif"];

function thailandHour() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: "Asia/Bangkok",
  });
  return Number(formatter.format(new Date()));
}

function pickGif() {
  const hour = thailandHour();
  const candidates = [...baseGifs];

  if (hour >= 0 && hour < 12) candidates.push("/gif/good_morning.gif");
  if (hour >= 15 && hour < 23) candidates.push("/gif/good_evening.gif");

  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function HomePracticeGif() {
  const [src, setSrc] = useState("/gif/i_love.gif");

  useEffect(() => {
    setSrc(pickGif());
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt="Evening Playground" className="h-96 w-full rounded-lg object-contain" src={src} />
  );
}
