export function isAtLeast18(birthdayIso: string): boolean {
  const birthday = new Date(`${birthdayIso}T00:00:00`);
  if (Number.isNaN(birthday.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birthday.getMonth() || (today.getMonth() === birthday.getMonth() && today.getDate() >= birthday.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;

  return age >= 18;
}
