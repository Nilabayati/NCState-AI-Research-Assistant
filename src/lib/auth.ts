/** Integration boundary only. No credentials, endpoints, tokens, or sign-in requests. */
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
  async signIn() { throw new Error("Sign in with ChatGPT is not implemented in this demo."); },
  async signOut() {},
};
