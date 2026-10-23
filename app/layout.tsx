import type { Metadata, Viewport } from 'next';
import './globals.css';
import './responsive.css';
import './auth.css';
import './body-map.css';
import MobileNavigation from './mobile-navigation';
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover'};
export const metadata:Metadata={title:'فرم‌فیت | همراه هوشمند تمرین',description:'برنامه خودت، آموزش هر حرکت و بررسی فرم با دوربین سلفی',manifest:'/manifest.webmanifest',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="fa" dir="rtl"><body>{children}<MobileNavigation/></body></html>}
