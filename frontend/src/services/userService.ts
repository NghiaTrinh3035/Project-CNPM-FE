import axiosClient from "@/api/axiosClient";
import { mapBackendUser } from "@/services/api/backendMappers";
import type { User } from "@/shared/types/domain";

type BackendUserGender = "MALE" | "FEMALE" | "OTHER";

const normalizeGender = (gender: User["gender"]): BackendUserGender =>
  gender === "MALE" || gender === "FEMALE" || gender === "OTHER" ? gender : "OTHER";

export interface UpdateProfileInput {
  id: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  gender?: User["gender"];
  role?: User["role"];
}

export const userService = {
  async updateProfile(input: UpdateProfileInput): Promise<User> {
    const payload = {
      username: input.username,
      email: input.email,
      phone: input.phone,
      address: input.address,
      gender: normalizeGender(input.gender),
      role: input.role,
    };
    const { data } = await axiosClient.put(`/users/${input.id}`, payload);
    return mapBackendUser(data);
  },
};

