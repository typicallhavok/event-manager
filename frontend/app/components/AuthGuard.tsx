import { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading) {
            const publicPaths = ['/', '/login', '/register','/feed'];
            const isPublicPath = publicPaths.includes(location.pathname);

            if (user && isPublicPath) {
                navigate('/dashboard');
            } else if (!user && !isPublicPath) {
                navigate('/login');
            }
        }
    }, [user, loading, location, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[rgb(18,11,26)]">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return <>{children}</>;
}