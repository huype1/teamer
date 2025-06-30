import axios from "axios";
import addReqToken from "@/utils/addReqToken";
import type { UserResponse, UsersResponse } from "@/types/user";

const baseUrl = "http://localhost:8080/api/users";

export const getMyInfo = async (): Promise<UserResponse> => {
    const res = await axios.get(
        `${baseUrl}/me`,
        addReqToken(localStorage.getItem("token")),
    );
    return res.data;
};

export const getUsers = async (): Promise<UsersResponse> => {
    const res = await axios.get(
        `${baseUrl}`,
        addReqToken(localStorage.getItem("token")),
    );
    return res.data;
};

export const deleteUser = async (userId: string) => {
    const res = await axios.delete(
        `${baseUrl}/delete/${userId}`,
        addReqToken(localStorage.getItem("token")),
    );
    return res.data;
};

export default { getMyInfo, getUsers, deleteUser };
