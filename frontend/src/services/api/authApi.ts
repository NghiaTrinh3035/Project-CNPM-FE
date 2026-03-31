import axiosClient from "@/api/axiosClient";

export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  phone: string;
  address: string;
  gender?: string;
  password: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface AuthResponse {
  message: string;
  userId: string;
  username: string;
  email: string;
  role: string;
  tokenType: string;
  accessToken: string;
  expiresInSeconds: number;
}

export interface OtpResponse {
  message: string;
  email: string;
  expiresInSeconds: number;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

const base = "/auth";

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const body = { usernameOrEmail: payload.usernameOrEmail, password: payload.password };
    const { data } = await axiosClient.post<AuthResponse>(`${base}/login`, body);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<OtpResponse> => {
    const body = {
      username: payload.username,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
      gender: payload.gender,
      password: payload.password,
    };
    const { data } = await axiosClient.post<OtpResponse>(`${base}/register`, body);
    return data;
  },

  verifyEmail: async (payload: VerifyEmailPayload): Promise<AuthResponse> => {
    const body = {
      email: payload.email,
      otp: payload.otp,
    };
    const { data } = await axiosClient.post<AuthResponse>(`${base}/verify-email`, body);
    return data;
  },

  forgotPassword: async (email: string): Promise<OtpResponse> => {
    const { data } = await axiosClient.post<OtpResponse>(`${base}/forgot-password`, { email });
    return data;
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<{ message: string }> => {
    const { data } = await axiosClient.post<{ message: string }>(`${base}/reset-password`, payload);
    return data;
  },
};

export default authApi;
