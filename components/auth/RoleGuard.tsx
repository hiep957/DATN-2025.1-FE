// components/auth/RoleGuard.tsx

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[]; // Bây giờ là mảng string
}

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  console.log("user, isAuthenticated trong Zustand RoleGuard:", user, isAuthenticated);
  useEffect(() => {
    // if (!isAuthenticated) {
    //   router.push('/login');
    //   return;
    // }

    if (user && user.roles) {
      // === LOGIC CỐT LÕI THAY ĐỔI Ở ĐÂY ===
      // Trước đây: const hasPermission = allowedRoles.includes(user.role);
      // Bây giờ: Kiểm tra xem mảng roles của user có chứa ít nhất một role trong allowedRoles
      const hasPermission = user.roles.some((role: string) => allowedRoles.includes(role));

      if (hasPermission) {
        console.log("Bạn có quyền truy cập trang này");
        setIsAuthorized(true);
      } else {
        toast.error('Bạn không có quyền truy cập trang này');
        console.log("Bạn không có quyền truy cập trang này");
        // Nếu không có quyền -> đá về trang không có quyền
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, user, router, allowedRoles]);

  // Chỉ render children khi đã được xác nhận có quyền
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Hiển thị loading trong khi chờ check
  return <div>Loading...</div>; 
};

export default RoleGuard;