import { Noto_Sans_KR, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { LanguageProvider } from '@/components/LanguageProvider'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ConsoleEasterEgg from '@/components/ConsoleEasterEgg'
import './globals.css'

const notoSansKR = Noto_Sans_KR({
  variable: '--font-noto-sans-kr',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tech.hectofinancial.com'

export const metadata = {
  title: {
    default: '헥토파이낸셜 기술 블로그',
    template: '%s | 헥토파이낸셜 기술 블로그',
  },
  description: '헥토파이낸셜 개발팀의 기술 블로그입니다. 핀테크, 백엔드, 프론트엔드, DevOps 등 다양한 기술 이야기를 공유합니다.',
  keywords: ['헥토파이낸셜', '기술 블로그', '핀테크', '개발', 'React', 'TypeScript', 'Java', 'Spring'],
  authors: [{ name: '헥토파이낸셜 개발팀' }],
  creator: '헥토파이낸셜',
  publisher: '헥토파이낸셜',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: '헥토파이낸셜 기술 블로그',
    title: '헥토파이낸셜 기술 블로그',
    description: '헥토파이낸셜 개발팀의 기술 블로그입니다. 핀테크, 백엔드, 프론트엔드, DevOps 등 다양한 기술 이야기를 공유합니다.',
  },
  twitter: {
    card: 'summary_large_image',
    title: '헥토파이낸셜 기술 블로그',
    description: '헥토파이낸셜 개발팀의 기술 블로그입니다.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      'application/rss+xml': `${SITE_URL}/rss.xml`,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${notoSansKR.variable} ${jetbrainsMono.variable}`}>
        <ConsoleEasterEgg />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
