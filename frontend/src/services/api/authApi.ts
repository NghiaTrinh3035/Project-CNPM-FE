import axiosClient from "@/api/axiosClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
    username: string;
    fullName: string;
    email: string;
    phone: string;
    address: string
    gender?: string;
    password: string;
}


export interface verifyEmailPayload {
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

const base = "/auth";

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const body = { email: payload.email, password: payload.password };
    const { data } = await axiosClient.post<AuthResponse>(`${base}/login`, body);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const body = {
      username: payload.username,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
      gender: payload.gender,
      password: payload.password
    };
    const { data } = await axiosClient.post(`${base}/register`, body);
    return data;
  },

  verifyEmail: async (payload: verifyEmailPayload): Promise<AuthResponse> => {
    const body = { email: payload.email,
                    otp: payload.otp
    };
    const { data } = await axiosClient.post(`${base}/verify-email`, body);
    return data;
  },
};

export default authApi;
