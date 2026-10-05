import { AttachedFile } from '../types';

/**
 * Định dạng dung lượng tệp tin (Bytes, KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Đọc file người dùng tải lên thành base64 data URL để lưu trữ và tải lại ngoại tuyến
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Tải file đính kèm xuống máy của giáo viên
 */
export function downloadAttachedFile(file: AttachedFile): void {
  try {
    if (file.dataUrl) {
      const link = document.createElement('a');
      link.href = file.dataUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Nếu file mẫu chưa có base64 nội dung thực tế, tạo một file demo chứa thông tin
      const blob = new Blob([`Tài liệu: ${file.name}\nNgày tải: ${new Date(file.uploadedAt).toLocaleString('vi-VN')}\n(Dung lượng: ${formatFileSize(file.size)})`], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.endsWith('.txt') || file.name.endsWith('.py') ? file.name : `${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Lỗi khi tải tệp:', error);
  }
}
