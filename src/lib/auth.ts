/** Future website-auth boundary; the live flow leaves sign-in inside ChatGPT. */
export type AuthSession = {
  user: { id: string; displayName: string };
  provider: "chatgpt";
};

export interface AuthProvider {
  readonly id: "chatgpt";
  readonly enabled: boolean;
  getSession(): Promise<AuthSession | null>;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}

export const chatGptAuth: AuthProvider = {
  id: "chatgpt",
  enabled: false,
  async getSession() { return null; },
  async signIn() { throw new Error("Sign in with ChatGPT on this website is not implemented; use your account in ChatGPT."); },
  async signOut() {},
};
