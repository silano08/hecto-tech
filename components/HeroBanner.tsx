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
        <span className="banner-eyebrow">TECH BLOG</span>

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
          {language === 'ko' ? (
            <>
              기술로 빠르게 검증하고
              <br />
              실행으로 결과를 만든다
            </>
          ) : (
            <>
              Validate fast with technology
              <br />
              Deliver results through execution
            </>
          )}
        </p>
      </div>
    </section>
  )
}
