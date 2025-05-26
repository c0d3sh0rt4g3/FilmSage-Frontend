export function validateName(name) {
  return name && name.trim().length >= 3;
}

export function validateMail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email && emailRegex.test(email);
}

export function validatePassword(password) {
  return password && password.length >= 6;
}

export function validateRepeatPassword(password, repeatPassword) {
  return password === repeatPassword;
}
