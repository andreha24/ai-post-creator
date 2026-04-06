import { AuthUser, User } from "@/types/user/user";
import { endpoints } from "../endpoints";
import axiosInstance from "@/utils/axios";

export const loginUser = async (user: User) => {
  try {
    const res = await axiosInstance.post<AuthUser>(endpoints.login, user);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

export const registerUser = async (user: User) => {
  try {
    const res = await axiosInstance.post<AuthUser>(endpoints.register, user);
    return res.data;
  } catch (error: any) {
    console.log("error", error);

    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const res = await axiosInstance.post(endpoints.logout);
    return res.data;
  } catch (error) {
    throw error;
  }
};
