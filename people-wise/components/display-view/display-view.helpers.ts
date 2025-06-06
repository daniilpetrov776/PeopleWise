import dayjs from "dayjs";

export const declineDays = (n: number) => {
  if (n % 10 === 1 && n % 100 !== 11) return 'день';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'дня';
  return 'дней';
};

export const declineYears = (n: number) => {
  if (n % 10 === 1 && n % 100 !== 11) return 'год';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'года';
  return 'лет';
};

export const computeNextBirthday = (birthdayIso: string) => {
  const birthDate = dayjs(birthdayIso);
  if (!birthDate.isValid()) return { days: null as number | null, next: null as dayjs.Dayjs | null };

  const now = dayjs().startOf('day');

   // Делаем «момент дня рождения» в текущем году и сразу обнуляем время
  let next = birthDate.year(now.year()).startOf('day');

  // Если в этом году уже было
  if (next.isBefore(now, 'day')) {
    next = next.add(1, 'year').startOf('day');
  }

  const diffDays = next.diff(now, 'day');
  return { days: diffDays, next, birthDate };
};
