import api from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

class AuthService {
  async login(data: LoginRequest) {
    const response = await api.post<AuthResponse>(
      "/auth/login",
      data
    );

    localStorage.setItem(
      "token",
      response.data.access_token
    );

    return response.data;
  }

  async signup(data: SignupRequest) {
    const response = await api.post<AuthResponse>(
      "/auth/register",
      data
    );

    localStorage.setItem(
      "token",
      response.data.access_token
    );

    return response.data;
  }

  async logout() {
    localStorage.removeItem("token");
  }

  async getProfile() {
    const response = await api.get("/auth/profile");

    return response.data;
  }
}

export default new AuthService();