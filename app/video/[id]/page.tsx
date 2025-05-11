// app/video/[id]/page.tsx
import { getGalleryEntryById } from '@/app/service/gallery.service'
import { getGenHistoryForGallery } from '@/app/service/genHistory.service'
import { getUserById } from '@/app/service/user.service'
import VideoDetailView from './components/VideoDetailView'
import { redirect } from 'next/navigation'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/app/dashboard/components/sidebar'

export default async function VideoDetailPage({
  params
}: {
  params: { id: string }
}) {
  try {
    const galleryEntry = await getGalleryEntryById(params.id)

    if (!galleryEntry) {
      redirect('/gallery') // Redirect to gallery if video not found
    }

    // Find the gen history entry associated with this gallery entry
    const genHistoryEntries = await getGenHistoryForGallery(params.id)
    const genHistory =
      genHistoryEntries.length > 0 ? genHistoryEntries[0] : null

    // Get user information
    let creator = null
    if (galleryEntry.added_by) {
      creator = await getUserById(galleryEntry.added_by)
    }

    return (
      <SidebarProvider defaultOpen={true}>
        <div className='flex h-screen w-full overflow-hidden bg-background'>
          <DashboardSidebar />
          <div className='flex flex-1 flex-col overflow-hidden'>
            <div className='flex-1 overflow-auto p-4 md:p-20'>
              <h1 className='mb-6 text-3xl font-bold'>Detail information</h1>
              <VideoDetailView
                galleryEntry={galleryEntry}
                genHistory={genHistory}
                creator={creator}
              />
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  } catch (error) {
    console.error('Error loading video details:', error)
    return (
      <div className='container mx-auto px-4 py-8'>
        <h1 className='mb-6 text-3xl font-bold'>Lỗi</h1>
        <p className='text-red-500'>
          Không thể tải thông tin video. Vui lòng thử lại sau.
        </p>
      </div>
    )
  }
}
