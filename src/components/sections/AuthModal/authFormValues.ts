/**
 * Field values for the auth forms, owned by AuthModal.
 *
 * The forms are swapped (unmounted) when the user switches between Login and
 * Sign Up, so their typed values live in the modal instead. They survive tab
 * switches and are cleared when the modal closes or after a successful
 * login / sign-up. Nothing is written to storage.
 */

export interface LoginValues {
  email:    string
  password: string
}

export interface SignUpValues {
  firstName:       string
  lastName:        string
  userName:        string
  email:           string
  password:        string
  confirmPassword: string
}

export const EMPTY_LOGIN_VALUES: LoginValues = { email: '', password: '' }

export const EMPTY_SIGNUP_VALUES: SignUpValues = {
  firstName:       '',
  lastName:        '',
  userName:        '',
  email:           '',
  password:        '',
  confirmPassword: '',
}
