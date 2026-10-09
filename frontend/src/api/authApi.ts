import api from "./axios";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterPayload,
  User,
} from "../types/auth";

export const login = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  const body = new URLSearchParams();
  body.append("username", credentials.username.trim());
  body.append("password", credentials.password);

  const response = await api.post<AuthResponse>(
    "/api/v1/auth/login",
    body,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return response.data;
};

export const register = async (
  payload: RegisterPayload,
): Promise<User> => {
  const response = await api.post<User>("/api/v1/auth/register", {
    username: payload.username.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  });

  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>("/api/v1/auth/me");
  return response.data;
};