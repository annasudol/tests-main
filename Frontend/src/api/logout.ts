import axiosInstance from "./";

const logout = async () => {
    const url = "/auth/logout";
    const token = localStorage.getItem("access-token") || sessionStorage.getItem("access-token") || "";
    return axiosInstance.post<void>(url, {
        headers: {
            "access-token": token,
        },
    }).then(res => res.data);
};

export default logout;