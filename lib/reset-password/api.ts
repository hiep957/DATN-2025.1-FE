import api from "../axios"


export const requestPasswordReset = async (email: string) => {
    const res = await api.post('/user/request-password-reset', { email })
    return res.data
}

export const verifyOTP = async (email: string, otp: string) => {
    const res = await api.post('/user/verify-otp-password', { email, otp })
    return res.data
}

export const resetPassword = async (email: string, newPassword: string) => {
    const res = await api.post('/user/reset-password', { email, newPassword })
    return res.data
}
