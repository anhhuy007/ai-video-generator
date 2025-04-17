// app/history/components/HistorySearch.tsx
'use client'
import { useState } from 'react'
import VideoList from './VideoList'

export default function HistorySearch() {
  const [userId, setUserId] = useState<string>('')
  const [submitted, setSubmitted] = useState<boolean>(false)
//   const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      setError('Vui lòng nhập User ID')
      return
    }
    setError('')
    setSubmitted(true)
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className='mb-6 rounded bg-white px-8 pb-8 pt-6 shadow-md'
      >
        {error && (
          <div className='mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
            {error}
          </div>
        )}

        <div className='mb-4'>
          <label
            className='mb-2 block text-sm font-bold text-gray-700'
            htmlFor='userId'
          >
            User ID
          </label>
          <input
            id='userId'
            type='text'
            placeholder='Nhập User ID để xem lịch sử'
            value={userId}
            onChange={e => setUserId(e.target.value)}
            className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
            required
          />
        </div>

        <div>
          <button
            type='submit'
            className='focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none'
          >
            Tìm kiếm
          </button>
        </div>
      </form>

      {submitted && <VideoList userId={userId} />}
    </div>
  )
}
