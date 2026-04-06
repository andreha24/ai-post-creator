import { User } from "@/types/user/user";
import { createSelectors } from "@/utils/createSelectors";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
}

const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }, false, "user/setUser"),
    }),
    {
      name: "UserStore",
    }
  )
);

export default createSelectors(useUserStore);
