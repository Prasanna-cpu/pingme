import {create} from "zustand";
import {axiosInstance} from "../axios/axios.ts";

export const useAuthStore : any = create((set, get) => ({
    authUser : null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    socket: null,
    onlineUsers: [],


    checkAuth : async() => {
        try{
            const res = await axiosInstance.get("/api/users/check")
            set({
                authUser : res.data?.data?.user
            })
        }
        catch(e){
            console.log("Error ", e)
            set({
                authUser : null
            })
        }
        finally{
            set({isCheckingAuth : false})
        }
    }

}))

