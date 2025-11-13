import api from "./api";

// Payload types (acepta camelCase o snake_case para compatibilidad)
export type SignUpPayload = {
  fullname: string;
  email: string;
  current_password?: string;
  date_of_birth?: string; // YYYY-MM-DD
  role?: string;
  documentNumber?: string;
};
export type LoginPayload = { email: string; current_password: string };
export type VerifyEmailPayload = { email: string; verificationCode: string };
export type ResendVerificationPayload = { email: string };

// Response types
export type AuthUser = {
  id: string;
  email: string;
  fullname: string;
  status: string;
  // roles según backend (ES):
  // 'ADMINISTRADOR' | 'MEDICO' | 'PACIENTE' | 'ENFERMERA'
  role: string;
};

export type SignUpResponse = {
  id: AuthUser["id"];
  email: string;
  fullname: string;
  status: string;
  message: string;
};

export type LoginResponse = {
  message: string;
  user: AuthUser;
  token: string;
};

export type VerifyEmailResponse = {
  message: string;
  user: AuthUser;
};

export type ResendVerificationResponse = {
  message: string;
};

export const signUp = (payload: SignUpPayload) => {
  const body: Record<string, unknown> = { ...payload };
  if (!body.current_password && body.currentPassword) {
    body.current_password = body.currentPassword;
    delete body.currentPassword;
  }
  return api.post<SignUpResponse>("/auth/sign-up", body);
};

export const login = (payload: LoginPayload) =>
  api.post<LoginResponse>("/auth/log-in", payload);

export const verifyEmail = (payload: VerifyEmailPayload) =>
  api.post<VerifyEmailResponse>("/auth/verify-email", payload);

export const resendVerificationCode = (payload: ResendVerificationPayload) =>
  api.post<ResendVerificationResponse>(
    "/auth/resend-verification-code",
    payload
  );
