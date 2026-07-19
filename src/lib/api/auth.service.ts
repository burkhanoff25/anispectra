import { HttpClient } from "./core/HttpClient";

export class AuthService {
  private static get BASE() {
    return process.env.NEXT_PUBLIC_ANILIBERTY_BASE ?? "https://anilibria.top/api/v1";
  }

  static async requestOtp(deviceId: string) {
    return HttpClient.fetch(`${this.BASE}/accounts/otp/get`, {
      method: "POST",
      body: JSON.stringify({ device_id: deviceId }),
    });
  }

  static async acceptOtp(code: number) {
    return HttpClient.fetch(`${this.BASE}/accounts/otp/accept`, {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  static async loginOtp(code: number, deviceId: string) {
    return HttpClient.fetch(`${this.BASE}/accounts/otp/login`, {
      method: "POST",
      body: JSON.stringify({ code, device_id: deviceId }),
    });
  }

  static async login(login: string, password: string): Promise<{ token: string } | null> {
    return HttpClient.fetch<{ token: string }>(`${this.BASE}/accounts/users/auth/login`, {
      method: "POST",
      body: JSON.stringify({ login, password }),
    });
  }

  static async logout() {
    return HttpClient.fetch(`${this.BASE}/accounts/users/auth/logout`, {
      method: "POST",
    });
  }

  static async passwordForget(email: string) {
    return HttpClient.fetch(`${this.BASE}/accounts/users/auth/password/forget`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  static async passwordReset(token: string, password: string, password_confirmation: string) {
    return HttpClient.fetch(`${this.BASE}/accounts/users/auth/password/reset`, {
      method: "POST",
      body: JSON.stringify({ token, password, password_confirmation }),
    });
  }

  static async socialLogin(provider: string) {
    return HttpClient.fetch(`${this.BASE}/accounts/users/auth/social/${provider}/login`, {
      method: "GET",
    });
  }

  static async socialAuthenticate(state: string) {
    return HttpClient.fetch(`${this.BASE}/accounts/users/auth/social/authenticate?state=${state}`, {
      method: "GET",
    });
  }
}
