import { AbstractControl, ValidationErrors } from '@angular/forms';

export function PasswordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const password: string = control.value;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);

  if (!hasUpperCase || !hasLowerCase) {
    return { passwordStrength: true };
  }

  return null;
}
