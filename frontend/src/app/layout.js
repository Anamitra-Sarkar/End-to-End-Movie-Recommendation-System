import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { UserProvider } from '@/context/UserContext'
import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context/NotificationContext'
import "./globals.css"

export const metadata = {
    title: 'CinePredict - AI Powered Recommendations',
    description: 'Your personal movie guide',
    icons: {
        icon: '/favicon.ico',
    },
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="flex h-screen w-full bg-background text-text-primary overflow-hidden">
                <AuthProvider>
                    <NotificationProvider>
                        <UserProvider>
                            <Sidebar />
                            <main className="flex-1 overflow-y-auto w-full relative custom-scrollbar">
                                <Header />
                                {children}
                            </main>
                        </UserProvider>
                    </NotificationProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
