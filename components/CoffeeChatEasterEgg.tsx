'use client'

import { useEffect, useState, useCallback } from 'react'

const TARGET_NAMES = ['이소울', '이재섭', '원가연']

export default function CoffeeChatEasterEgg() {
  const [isOpen, setIsOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const checkForMatch = useCallback((text: string) => {
    for (const name of TARGET_NAMES) {
      if (text.includes(name)) {
        setIsOpen(true)
        return true
      }
    }
    return false
  }, [])

  useEffect(() => {
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        const value = target.value
        if (checkForMatch(value)) {
          for (const name of TARGET_NAMES) {
            if (value.includes(name)) {
              target.value = value.replace(name, '')
              break
            }
          }
        }
      }
    }

    const handleCompositionEnd = (e: CompositionEvent) => {
      if (e.data) {
        checkForMatch(e.data)
      }
    }

    document.addEventListener('input', handleInput, true)
    document.addEventListener('compositionend', handleCompositionEnd, true)

    return () => {
      document.removeEventListener('input', handleInput, true)
      document.removeEventListener('compositionend', handleCompositionEnd, true)
    }
  }, [checkForMatch])

  const handleClose = () => {
    setIsOpen(false)
    setPhoneNumber('')
    setIsSubmitted(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phoneNumber.trim()) {
      console.log('커피챗 신청 전화번호:', phoneNumber)
      setIsSubmitted(true)
    }
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative mx-4 max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'bounceIn 0.5s ease-out' }}
      >
        {/* Confetti Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '10px',
                height: '10px',
                top: '-10px',
                left: `${(i / 30) * 100}%`,
                backgroundColor: ['#ff6114', '#ffd700', '#ff69b4', '#00bfff', '#7fff00'][i % 5],
                animation: `confettiFall 3s ease-in-out ${i * 0.1}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative p-8 text-center">
          <div className="text-6xl mb-4">&#9749;</div>

          {!isSubmitted ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                축하합니다! &#127881;
              </h2>

              <p className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-6">
                커피챗에 당첨되셨습니다~
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    연락받으실 전화번호를 입력해주세요
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="010-1234-5678"
                    maxLength={13}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff6114] focus:border-transparent"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={phoneNumber.replace(/[^\d]/g, '').length < 10}
                  className="w-full px-6 py-3 bg-[#ff6114] text-white font-semibold rounded-full hover:bg-[#ff6114]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  신청하기
                </button>
              </form>

              <button
                onClick={handleClose}
                className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                닫기
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                신청 완료! &#127881;
              </h2>

              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                곧 연락드리겠습니다 &#128521;
              </p>

              <button
                onClick={handleClose}
                className="px-6 py-3 bg-[#ff6114] text-white font-semibold rounded-full hover:bg-[#ff6114]/90 transition-colors"
              >
                확인
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(-100%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(500px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
