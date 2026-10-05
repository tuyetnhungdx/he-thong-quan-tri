/**
 * Định nghĩa kiểu dữ liệu cho Web App
 * "TRỢ LÝ QUẢN TRỊ HỌC TẬP – CÔ TRẦN THỊ TUYẾT NHUNG"
 * Môn: Tin học - THPT Nguyễn Dục
 */

export interface ClassItem {
  id: string;
  name: string; // e.g., '10A1', '10A2', '11A1', '12A1'
  gradeLevel: number; // 10, 11, 12 (hoặc 6, 7, 8, 9)
  room?: string; // Phòng học / Phòng máy, e.g., 'Phòng máy 1'
  academicYear: string; // e.g., '2025-2026'
  note?: string; // Ghi chú đặc điểm lớp
}

export interface Student {
  id: string;
  studentCode: string; // Mã học sinh, e.g., 'HS0601'
  fullName: string; // Họ và tên
  classId: string; // ID lớp học
  gender: 'Nam' | 'Nữ';
  status: 'Đang học' | 'Nghỉ học' | 'Chuyển lớp';
  note?: string; // Ghi chú riêng của giáo viên
  needAttention?: boolean; // Đánh dấu cần chú ý
}

export type LessonStatus = 'Chưa dạy' | 'Đang dạy' | 'Đã hoàn thành';

export interface AttachedFile {
  id: string;
  name: string;
  size: number; // Kích thước theo byte
  type: string; // MIME type hoặc extension
  dataUrl?: string; // Dữ liệu base64 để tải xuống / xem trực tiếp
  uploadedAt: string; // Ngày giờ tải lên ISO
}

export interface Lesson {
  id: string;
  title: string; // Tên bài học
  classId: string; // Lớp áp dụng
  topic: string; // Chủ đề / Bài học lớn
  objectives: string; // Mục tiêu học tập
  summary: string; // Nội dung tóm tắt
  teachDate: string; // Ngày dạy dự kiến (YYYY-MM-DD)
  status: LessonStatus;
  attachments?: AttachedFile[]; // Danh sách tệp đính kèm (giáo án, slide, tài liệu)
}

export type TaskStatus = 'Chưa giao' | 'Đã giao' | 'Đang thực hiện' | 'Đã hoàn thành';
export type TaskPriority = 'Bình thường' | 'Quan trọng' | 'Khẩn cấp';

export interface LearningTask {
  id: string;
  title: string; // Tên nhiệm vụ
  classId: string; // Lớp được giao
  lessonId?: string; // Bài học liên quan
  description: string; // Mô tả nhiệm vụ
  dueDate: string; // Hạn nộp (YYYY-MM-DD)
  priority: TaskPriority;
  status: TaskStatus;
  completedStudentIds: string[]; // Danh sách mã học sinh đã nộp/hoàn thành
  attachments?: AttachedFile[]; // Danh sách tệp đính kèm (đề bài, phiếu học tập, mã nguồn mẫu)
}

export interface GradeEntry {
  id: string;
  studentId: string; // ID học sinh
  classId: string; // ID lớp
  activityTitle: string; // Tên bài kiểm tra / hoạt động (e.g., 'Viết đoạn văn ngắn', 'Kiểm tra đọc hiểu')
  lessonId?: string; // Bài học liên kết (nếu có)
  score: number; // Điểm số (0.0 đến 10.0)
  date: string; // Ngày chấm điểm (YYYY-MM-DD)
  note?: string; // Lời phê / nhận xét điểm
}

export interface StudentComment {
  id: string;
  studentId: string; // ID học sinh
  classId: string; // ID lớp
  date: string; // Ngày nhận xét
  content: string; // Nội dung nhận xét
  skillCategory:
    | 'Lập trình & Thuật toán'
    | 'Thực hành máy tính'
    | 'Lý thuyết Tin học'
    | 'Dự án & Bài tập'
    | 'Thái độ & Chuyên cần'
    | 'Đọc hiểu'
    | 'Viết bài'
    | 'Nói & Nghe'
    | 'Khác';
  note?: string; // Ghi chú thêm
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string
  type: 'student' | 'lesson' | 'task' | 'grade' | 'comment' | 'class';
  action: string; // Mô tả ngắn gọn: e.g. "Đã thêm học sinh Nguyễn Văn An"
}

export interface AppUser {
  id: string;
  username: string; // Tên đăng nhập (chỉ chữ và số, không cần email)
  fullName: string; // Họ và tên người dùng
  role?: string; // Vai trò, e.g. 'Giáo viên bộ môn Tin học'
  school?: string; // Đơn vị trường học
  createdAt: string;
}

export interface AppData {
  classes: ClassItem[];
  students: Student[];
  lessons: Lesson[];
  tasks: LearningTask[];
  grades: GradeEntry[];
  comments: StudentComment[];
  activityLogs: ActivityLog[];
  soundEnabled: boolean;
}

export type NavTab = 
  | 'overview' 
  | 'classes' 
  | 'students' 
  | 'lessons' 
  | 'tasks' 
  | 'grades' 
  | 'progress' 
  | 'comments' 
  | 'stats';
