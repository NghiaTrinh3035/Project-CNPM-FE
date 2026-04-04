import axiosClient from "@/api/axiosClient";
import { mapBackendUser } from "@/services/api/backendMappers";
import type { User } from "@/shared/types/domain";

type BackendUserGender = "MALE" | "FEMALE" | "OTHER";

const normalizeGender = (gender: User["gender"]): BackendUserGender | undefined =>
  gender === "MALE" || gender === "FEMALE" || gender === "OTHER" ? gender : undefined;

export interface UpdateProfileInput {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  gender?: User["gender"];
  role?: User["role"];
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const userService = {
  async getById(id: string): Promise<User> {
    const { data } = await axiosClient.get(`/users/${id}`);
    return mapBackendUser(data);
  },

  async updateProfile(input: UpdateProfileInput): Promise<User> {
    const payload = {
      username: input.username,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      address: input.address,
      gender: normalizeGender(input.gender),
      role: input.role,
    };
    const { data } = await axiosClient.put(`/users/${input.id}`, payload);
    return mapBackendUser(data);
  },

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    await axiosClient.patch(`/users/${userId}/change-password`, input);
  },
};

