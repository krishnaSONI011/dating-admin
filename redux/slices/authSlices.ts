import { createSlice , PayloadAction } from "@reduxjs/toolkit";


interface User { 
    id:string
    name: string ; 
    role : string ;
    
    email:string;
    token:string;
}

interface AuthState {
    user: User | null;
  }
  
const getInitialUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getInitialUser(),
};

const authSlice = createSlice({
    name : "auth",
    initialState,
    reducers:{
        login(state , action : PayloadAction<User>){
            state.user  = action.payload;
            localStorage.setItem("user", JSON.stringify(action.payload));
        },
        logout(state){
            state.user = null 
            localStorage.removeItem("user")
        }
    }

})
export const { login , logout } = authSlice.actions;
export default authSlice.reducer;