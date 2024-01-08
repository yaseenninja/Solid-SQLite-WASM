import { createContext, useContext } from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";

export interface User {
    uid: number,
    name: string,
    gender: string,
    email: string,
    city: string
}

interface ContextProps {
    userData: User[],
    setUserData: SetStoreFunction<User[]>
}

const UserContext = createContext<ContextProps>();

export function UserProvider(props: any) {
  const [ userData, setUserData ] = createStore<User[]>([])

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {props.children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext)!