

export interface UserRoles {
    id: number;
    role: Role;
}

export interface Role {
    id: number;
    code: string;
}

export interface User {
  id: number
  username: string
  email: string
  address?: string
  phoneNumber?: string
  birthday?: string
  gender?: string
  occupation?: string
  avatar?: string
  userRoles?: UserRoles[];// Thêm roles nếu cần thiết
  createdAt?: string
  updatedAt?: string
}

export const Roles = [
    {
        code: 'ADMIN',
        label: 'Quản trị viên',
    },
    {
        code: 'STAFF',
        label: 'Nhân viên',
    },
    {
        code: 'USER',
        label: 'Người dùng',
    },
]


export const sortOptions = [
    { value: "createAt", label: "Thời gian tạo" },
    { value: "updatedAt", label: "Thời gian chỉnh sửa" },
]