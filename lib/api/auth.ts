import axios from "axios"
import { toast } from "sonner"
import api from "../axios"
import { User } from "@/store/useAuthStore"


export interface LoginResponse {
  accessToken: string
  user: {
    username: string
    id: number
    name: string
    email: string
    address: string
    phoneNumber: string
    birthday: string
    gender: string
    occupation: string
    avatar: string
  },
  roles: string[]
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch('http://localhost:3000/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // để nhận cookie từ backend
    body: JSON.stringify({ email, password }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Login failed')
  }

  return data.data // { accessToken, user }
}

export async function registerUser(username: string, email: string,  password: string): Promise<any> {
  const res = await fetch('http://localhost:3000/user/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
   
    body: JSON.stringify({ username,  email, password }),
  })
  return res.json()
}



export const logoutUser = async (): Promise<any> => {
  const res = await api.post('/user/logout', {}, { withCredentials: true });
  return res.data;
}



export const updateUserProfile = async(userData: User ) => {
  const res = await api.patch('/user/update-profile', userData, { withCredentials: true });
  return res.data;
}



export async function createProduct(productData: any): Promise<any> {
  const res = await api.post('/products/create', productData, { withCredentials: true });
  // if (res.status == 201) {
  //   toast.success("Tạo sản phẩm thành công")
  //   return res.data;
  // }
  // console.log("Lỗi tạo sản phẩm:", res.data);
  // toast.error(res.data.message || "Tạo sản phẩm thất bại");
  // throw new Error(res.data.message || "Tạo sản phẩm thất bại");
  return res.data;
}

export const fetchProductById = async (id: string): Promise<any> => {
  return api.get(`/products/${id}`, { withCredentials: true }).then(res => res);
}

export const updateProduct = async (id: string, productData: any): Promise<any> => {
  return api.patch(`/products/update/${id}`, productData, { withCredentials: true }).then(res => res);
}

export const changeUserPassword = async (oldPassword: string, newPassword: string): Promise<any> => {
  const res = await api.post('/user/change-password', { oldPassword, newPassword }, { withCredentials: true });
  return res.data;
}