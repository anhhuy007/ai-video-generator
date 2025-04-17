import UploadAudioForm from './components/UploadAudioForm'
// app/uploadAudio/page.tsx
export default function UploadAudioPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-6 text-center text-3xl font-bold'>Upload Audio</h1>
      <UploadAudioForm />
    </div>
  )
}
