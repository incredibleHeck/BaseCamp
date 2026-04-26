import React from 'react';

type PremiumWelcomeBannerProps = {
  title: string;
  welcome: string;
  userName: string;
};

export function PremiumWelcomeBanner({ title, welcome, userName }: PremiumWelcomeBannerProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-xl font-bold tracking-tight text-zinc-50 sm:text-2xl">{title}</h2>
      <p className="mt-0.5 text-sm text-zinc-400 sm:mt-1 sm:text-base">
        Welcome back, {userName}. {welcome}
      </p>
    </div>
  );
}
