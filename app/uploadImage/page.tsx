import UploadImageForm from './components/UploadImageForm'
// app/uploadImage/page.tsx
export default function UploadImagePage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-6 text-center text-3xl font-bold'>Upload Hình Ảnh</h1>
      <UploadImageForm />
    </div>
  )
}

