import axiosInstance from "src/api";
import {AploadExcelFileBody, AddFacultyBody} from "./request.dto";
import {AddFieldResponse, UploadFileResponse} from "./response.dto";



export const addFaculty = async (body: AddFacultyBody) => {
    const url = "/user/user";
    return axiosInstance.post<AddFieldResponse>(url, body).then(res => res.data);
};

export const uploadExcelFile = async (file: File) => {
    const url = "/admin/upload";
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post<UploadFileResponse>(url, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }).then(res => res.data);
  };
  
  
  