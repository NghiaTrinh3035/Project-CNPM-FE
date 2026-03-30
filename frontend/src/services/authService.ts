import { authCredentials } from "@/mocks/data/users";
import { delay } from "@/services/mock/delay";
import type { AuthSession, Customer, User, GenderTarget } from "@/shared/types/domain";
import { toSlug } from "@/shared/utils/slug";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  phone: string;
  password: string;
  username: string;
  address?: string;
  gender?: GenderTarget;
  fullName?: string;
}

const credentialStore = [...authCredentials];

const buildSession = (user: User): AuthSession => ({
  token: `mock-token-${user.id}`,
  refreshToken: `mock-refresh-${user.id}`,
  user,
});

export const authService = {
  async login(input: LoginInput): Promise<AuthSession> {
    await delay(400);
    const account = credentialStore.find(
      (item) => item.user.email.toLowerCase() === input.email.toLowerCase()
    );

    if (!account || account.password !== input.password) {
      throw new Error("Tên người dùng hoặc mật khẩu không chính xác.");
    }
    if (!account.verified) {
      throw new Error("Tài khoản chưa xác thực email. Vui lòng xác thực trước khi đăng nhập.");
    }

    return buildSession(account.user);
  },

  async register(input: RegisterInput) {
    await delay(450);
    const exists = credentialStore.some(
      (item) => item.user.email.toLowerCase() === input.email.toLowerCase()
    );
    if (exists) {
      throw new Error("Email hoặc tên người dùng đã tồn tại. Vui lòng dùng thông tin khác.");
    }
    const id = `u-cus-${toSlug(input.email).replace(/-/g, "").slice(0, 6)}-${Date.now().toString().slice(-4)}`;
    const newCustomer: Customer = {
      id,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      username: input.username,
      role: "CUSTOMER",
      loyaltyTier: "SILVER",
      address: input.address || "",
      gender: (input.gender ?? "MALE") as GenderTarget,
      addresses: [],
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    credentialStore.push({
      user: newCustomer,
      password: input.password,
      verified: false,
    });

    return {
      message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
      email: newCustomer.email,
    };
  },

  async verifyEmail(email: string) {
    await delay(300);
    const account = credentialStore.find((item) => item.user.email.toLowerCase() === email.toLowerCase());
    if (!account) {
      throw new Error("Không tìm thấy tài khoản cần xác thực.");
    }
    account.verified = true;
    return { message: "Xác thực email thành công." };
  },

  async forgotPassword(email: string) {
    await delay(350);
    const account = credentialStore.find((item) => item.user.email.toLowerCase() === email.toLowerCase());
    if (!account) {
      throw new Error("Email chưa được đăng ký.");
    }
    return { message: "Đã gửi hướng dẫn đặt lại mật khẩu (mock)." };
  },

  async resetPassword(email: string, newPassword: string) {
    await delay(350);
    const account = credentialStore.find((item) => item.user.email.toLowerCase() === email.toLowerCase());
    if (!account) {
      throw new Error("Email chưa được đăng ký.");
    }
    account.password = newPassword;
    return { message: "Đổi mật khẩu thành công." };
  },
};
