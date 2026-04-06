import axiosInstance from "@/utils/axios";
import { endpoints } from "../endpoints";
import { AuthUser } from "@/types/user/user";

export const getUser = async (): Promise<AuthUser> => {
  try {
    const response = await axiosInstance.get(endpoints.getUser);
    return response.data;
  } catch (error) {
    throw error;
  }
};
