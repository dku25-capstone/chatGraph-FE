import { api } from "@/lib/api";
import { LoginData, SignupData } from "@/types/user";


export const login = async (data: LoginData) => {
  const response = await api.post("/api/login", data);
  return response;
};

export const signup = async (data: SignupData) => {
  const response = await api.post("/api/signup", data);
  return response;
};
