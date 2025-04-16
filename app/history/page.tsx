// app/history/page.tsx
import HistorySearch from './components/HistorySearch'

export default function HistoryPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-6 text-3xl font-bold'>Lịch Sử Video</h1>
      <HistorySearch />
    </div>
  )
}
