/**
 * Form validation utility functions
 * Provides client-side validation for user input
 */

/**
 * Validate user name
 * @param {string} name - Name to validate
 * @returns {boolean} True if name is valid (at least 3 characters)
 */
export function validateName(name) {
  return name && name.trim().length >= 3;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email format is valid
 */
export function validateMail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email && emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} True if password is valid (at least 6 characters)
 */
export function validatePassword(password) {
  return password && password.length >= 6;
}

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} repeatPassword - Password confirmation
 * @returns {boolean} True if passwords match
 */
export function validateRepeatPassword(password, repeatPassword) {
  return password === repeatPassword;
}
