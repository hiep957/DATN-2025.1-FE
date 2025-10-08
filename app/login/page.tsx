'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { loginUser } from '@/lib/api/auth'
import { toast } from 'sonner'
// import { useAuthStore } from '@/store/useAuthStore'

const LoginPage = () => {
    const router = useRouter()
    const setAccessToken = useAuthStore((state) => state.setAccessToken)
    const setUser = useAuthStore((state) => state.setUser)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setLoading(true)
        setError(null)
        console.log('Đang xử lý đăng nhập với email:', email, 'và mật khẩu:', password)
        try {
            const data = await loginUser(email, password)
            console.log('Dữ liệu phản hồi từ server:', data)
            setAccessToken(data.accessToken)
            setUser({
                id: data.user.id,
                email: data.user.email,
                username: data.user.username,
                roles: data.roles  // Lưu roles vào trạng thái người dùng
            })
            toast.success('Đăng nhập thành công!')

            // Redirect theo role
            if (data.roles.includes('ADMIN')) {
                router.push('/admin')
            } else {
                router.push('/')
            }
        }
        catch (err: any) {
            toast.error(`Lỗi: ${err.message}`)
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-sm p-6 bg-white rounded shadow">
                <h2 className="text-xl font-bold mb-4">Đăng nhập</h2>
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-2 mb-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    className="w-full border p-2 mb-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <button
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
            </div>
        </div>
    )
}


export default LoginPage;