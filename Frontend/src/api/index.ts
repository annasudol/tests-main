import axios, {AxiosRequestConfig} from 'axios';
import {isProduction} from '../utils';

const defaultAxiosSettings: AxiosRequestConfig = {
    withCredentials: true,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
};

const axiosInstance = axios.create({
    baseURL: isProduction
        ? import.meta.env.VITE_API_URL_PROD
        : import.meta.env.VITE_API_URL,
    ...defaultAxiosSettings,
});

// Add interceptor to include access token from localStorage on every request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("access-token");
    if (token && config.headers) {
        config.headers["access-token"] = token;
    }
    return config;
});

export default axiosInstance;

export const getUsers = async (params: { page?: number; limit?: number; search?: string; roleId?: number }) => {
    const { page = 1, limit = 10, search = "", roleId } = params || {};
    const resp = await axiosInstance.get(`/user/users`, { params: { page, limit, search, roleId } });
    return resp.data;
}

export const updateUser = async (id: number, payload: { name?: string; email?: string; roleId?: number }) => {
    const resp = await axiosInstance.put(`/user/user/${id}`, payload);
    return resp.data;
}

export const deleteUser = async (username: string) => {
    const resp = await axiosInstance.delete(`/user/user/${encodeURIComponent(username)}`);
    return resp.data;
}