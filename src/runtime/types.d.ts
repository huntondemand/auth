export interface User {
  id: number
  email: string
  role: string
}

export interface Session {
  id: number;
  active: boolean;
  userId: number;
  ua: string | null;
  updatedAt: Date;
  createdAt: Date;
}

export type ResetPasswordPayload = {
  userId: number;
};

export type EmailVerifyPayload = {
  userId: number;
};

export type AccessTokenPayload = {
  userId: number;
  userRole: string;
};

export type RefreshTokenPayload = {
  id: number;
  uid: string;
  userId: number;
};

export type PrivateConfig = {}

export type PublicConfig = {
  baseUrl: string;
  enableGlobalAuthMiddleware?: boolean;
  cookieOptions?: {
    name: string
  };
  redirect: {
    login: string;
    logout: string;
    home: string;
    callback?: string;
    passwordReset?: string;
    emailVerify?: string;
  };
};

