import { create } from "zustand";

interface UserStateInterface {
  userName: string;
  setUserName: (name: string) => void;
}

const useUserState = create<UserStateInterface>((set) => ({
  userName: "",
  setUserName: (name) => set({ userName: name }),
}));

export default useUserState;
