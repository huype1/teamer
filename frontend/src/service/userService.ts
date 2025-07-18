import axios from "axios";
import addReqToken from "@/utils/addReqToken";
import type { UserResponse, UserUpdateRequest } from "@/types/user";

const baseUrl = "http://localhost:8080/api/users";

export const getMyInfo = async (): Promise<UserResponse> => {
    const res = await axios.get(
        `${baseUrl}/me`,
        addReqToken(localStorage.getItem("token")),
    );
    return res.data;
};

export const updateMyInfo = async (userData: UserUpdateRequest): Promise<UserResponse> => {
    const res = await axios.put(
        `${baseUrl}/me`,
        userData,
        addReqToken(localStorage.getItem("token")),
    );
    return res.data;
};

export const deleteMyAccount = async (): Promise<void> => {
    const res = await axios.delete(
        `${baseUrl}/me`,
        addReqToken(localStorage.getItem("token")),
    );
    return res.data;
};

export const getUserById = async (userId: string): Promise<UserResponse> => {
    const res = await axios.get(
        `${baseUrl}/${userId}`,
        addReqToken(localStorage.getItem("token")),
    );
    return res.data;
};

export default { getMyInfo, updateMyInfo, deleteMyAccount, getUserById };
