'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface SensitiveContentDialogProps {
  open: boolean
  onClose: () => void
}

export function SensitiveContentDialog({ open, onClose }: SensitiveContentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nội dung nhạy cảm</DialogTitle>
          <DialogDescription>
            Nội dung bạn nhập có thể chứa yếu tố nhạy cảm hoặc không phù hợp.
            Vui lòng chỉnh sửa lại prompt trước khi tiếp tục.
          </DialogDescription>
        </DialogHeader>
        <div className='flex justify-end pt-2'>
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
