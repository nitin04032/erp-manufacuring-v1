'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../store/user';

// Yeh ek Higher-Order Component (HOC) hai
export default function ProtectedRoute<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const Wrapper = (props: P) => {
    const router = useRouter();
    const { isAuth, checkAuth } = useUserStore();

    useEffect(() => {
      checkAuth(); // Check authentication status on component mount
    }, [checkAuth]);
    
    useEffect(() => {
        // isAuth check hone ke baad hi redirect ka faisla lein
        if (!isAuth) {
            router.replace('/'); // Agar authenticated nahi hai to login page par bhejein
        }
    }, [isAuth, router]);

    // Agar authenticated hai, to page ko render karein
    if (isAuth) {
      return <WrappedComponent {...props} />;
    }

    // Jab tak check ho raha hai, ya redirect ho raha hai, loader dikhayein
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
  };
  return Wrapper;
}