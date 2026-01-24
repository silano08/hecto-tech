'use client'

import { useLanguage } from './LanguageProvider'

export default function HeroBanner() {
  const { language } = useLanguage()

  return (
    <section className="tech-blog-banner -mx-4 sm:-mx-6 lg:-mx-8 mb-8 lg:mb-12">
      {/* Background layer with tech feel */}
      <div className="banner-bg" />

      {/* Content */}
      <div className="banner-content">
        <p className="banner-eyebrow">HECTO TECH BLOG</p>

        <h1 className="banner-title">
          {language === 'ko' ? (
            <>
              우리는
              <br />
              진취적 행동가
            </>
          ) : (
            <>
              We Are
              <br />
              Go-Getters
            </>
          )}
        </h1>

        <p className="banner-subtitle">
          {language === 'ko'
            ? '기술로 문제를 해결하고, 실행으로 가치를 증명합니다'
            : 'Solving problems with technology, proving value through execution'}
        </p>
      </div>
    </section>
  )
}
