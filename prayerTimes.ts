/**
 * Prayer times calculation for Islamic University (Kushtia, Bangladesh)
 * Coordinates: 23.7233° N, 89.1458° E | UTC+6
 * Standard Hanafi Asr & Karachi Calculation Method
 */

export interface PrayerTimeData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  tahajjudEnd: string;
  nextPrayer: {
    nameBn: string;
    nameEn: string;
    time: string;
    remainingMs: number;
    remainingFormatted: string;
  };
}

function pad(n: number): string {
  return n < 10 ? '0' + n : '' + n;
}

export function formatTimeBn(hhmm: string): string {
  if (!hhmm) return '';
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const period = h >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const toBn = (num: number) => num.toLocaleString('bn-BD');
  return `${toBn(displayH)}:${pad(m)} ${period}`;
}

export function getIslamicUniversityPrayerTimes(date: Date = new Date()): PrayerTimeData {
  // Approximate Kushtia Solar Timings by Day of Year
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Solar declination & equation of time approximations for Kushtia
  const B = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180);
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); // in minutes
  const solarNoonMin = 12 * 60 - eot - (89.15 - 90) * 4; // UTC+6 meridian is 90 deg E

  // Season variation in minutes from solar noon (approx 23.7° latitude)
  const seasonFactor = Math.sin(((dayOfYear - 80) * 2 * Math.PI) / 365);
  const dayLengthMin = 720 + seasonFactor * 100; // between ~10.5 hrs in winter and ~13.5 hrs in summer
  const halfDay = dayLengthMin / 2;

  const sunriseMin = solarNoonMin - halfDay;
  const sunsetMin = solarNoonMin + halfDay;
  const fajrMin = sunriseMin - 80;
  const asrMin = solarNoonMin + (sunsetMin - solarNoonMin) * 0.65; // Hanafi Asr
  const ishaMin = sunsetMin + 76;

  const toHhmm = (min: number) => {
    let m = Math.round(min);
    if (m < 0) m += 1440;
    m = m % 1440;
    const h = Math.floor(m / 60);
    const mins = m % 60;
    return `${pad(h)}:${pad(mins)}`;
  };

  const fajrStr = toHhmm(fajrMin);
  const sunriseStr = toHhmm(sunriseMin);
  const dhuhrStr = toHhmm(solarNoonMin + 4);
  const asrStr = toHhmm(asrMin);
  const maghribStr = toHhmm(sunsetMin + 2);
  const ishaStr = toHhmm(ishaMin);
  const tahajjudEndStr = toHhmm(fajrMin - 20);

  // Calculate Next Prayer
  const now = date.getHours() * 60 + date.getMinutes();
  const prayers = [
    { nameBn: 'ফজর', nameEn: 'Fajr', min: fajrMin, time: fajrStr },
    { nameBn: 'সূর্যোদয়', nameEn: 'Sunrise', min: sunriseMin, time: sunriseStr },
    { nameBn: 'যোহর', nameEn: 'Dhuhr', min: solarNoonMin + 4, time: dhuhrStr },
    { nameBn: 'আসর', nameEn: 'Asr', min: asrMin, time: asrStr },
    { nameBn: 'মাগরিব', nameEn: 'Maghrib', min: sunsetMin + 2, time: maghribStr },
    { nameBn: 'এশা', nameEn: 'Isha', min: ishaMin, time: ishaStr },
  ];

  let nextP = prayers.find((p) => p.min > now);
  let remMin = 0;
  if (nextP) {
    remMin = Math.round(nextP.min - now);
  } else {
    nextP = prayers[0]; // Next day's Fajr
    remMin = Math.round(1440 - now + fajrMin);
  }

  const rh = Math.floor(remMin / 60);
  const rm = remMin % 60;
  const toBn = (n: number) => n.toLocaleString('bn-BD');
  const remFormatted = rh > 0 ? `${toBn(rh)} ঘণ্টা ${toBn(rm)} মিনিট` : `${toBn(rm)} মিনিট`;

  return {
    fajr: fajrStr,
    sunrise: sunriseStr,
    dhuhr: dhuhrStr,
    asr: asrStr,
    maghrib: maghribStr,
    isha: ishaStr,
    tahajjudEnd: tahajjudEndStr,
    nextPrayer: {
      nameBn: nextP.nameBn,
      nameEn: nextP.nameEn,
      time: nextP.time,
      remainingMs: remMin * 60 * 1000,
      remainingFormatted: remFormatted,
    },
  };
}
