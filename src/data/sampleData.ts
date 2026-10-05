/**
 * Dữ liệu mẫu minh họa cho môn Tin học THPT
 * Giáo viên: Cô Trần Thị Tuyết Nhung - Trường THPT Nguyễn Dục
 * Lưu ý: Toàn bộ dữ liệu dưới đây chỉ mang tính chất minh họa thao tác,
 * dễ dàng chỉnh sửa, thêm, xóa hoặc khôi phục bất cứ lúc nào.
 */

import { AppData, ClassItem, Student, Lesson, LearningTask, GradeEntry, StudentComment, ActivityLog } from '../types';

export const initialClasses: ClassItem[] = [
  {
    id: 'c-10a1',
    name: '10A1',
    gradeLevel: 10,
    room: 'Phòng Máy 1',
    academicYear: '2025-2026',
    note: 'Lớp ban KHTN, hứng thú với lập trình Python và tư duy giải thuật'
  },
  {
    id: 'c-10a2',
    name: '10A2',
    gradeLevel: 10,
    room: 'Phòng Máy 1',
    academicYear: '2025-2026',
    note: 'Lớp sôi nổi, thao tác máy tính nhanh, hoàn thành tốt bài thực hành'
  },
  {
    id: 'c-11a1',
    name: '11A1',
    gradeLevel: 11,
    room: 'Phòng Máy 2',
    academicYear: '2025-2026',
    note: 'Học tốt chuyên đề Cơ sở dữ liệu quan hệ và hệ quản trị CSDL'
  },
  {
    id: 'c-12a1',
    name: '12A1',
    gradeLevel: 12,
    room: 'Phòng Máy 2',
    academicYear: '2025-2026',
    note: 'Lớp cuối cấp, học tốt phần Mạng máy tính và An toàn thông tin'
  }
];

export const initialStudents: Student[] = [
  // Lớp 10A1
  { id: 's-1001', studentCode: 'HS1001', fullName: 'Nguyễn Hoàng Nam', classId: 'c-10a1', gender: 'Nam', status: 'Đang học', note: 'Tư duy thuật toán tốt, code Python ngắn gọn và mạch lạc' },
  { id: 's-1002', studentCode: 'HS1002', fullName: 'Trần Thị Mai Anh', classId: 'c-10a1', gender: 'Nữ', status: 'Đang học', note: 'Chăm chú thực hành, trình bày bài báo cáo dự án cẩn thận' },
  { id: 's-1003', studentCode: 'HS1003', fullName: 'Lê Minh Đức', classId: 'c-10a1', gender: 'Nam', status: 'Đang học', note: 'Cần chú ý lỗi thụt lề IndentationError trong Python', needAttention: true },
  { id: 's-1004', studentCode: 'HS1004', fullName: 'Phạm Thuỳ Linh', classId: 'c-10a1', gender: 'Nữ', status: 'Đang học', note: 'Tích cực hỗ trợ bạn bè trong giờ thực hành phòng máy' },
  { id: 's-1005', studentCode: 'HS1005', fullName: 'Đỗ Quang Huy', classId: 'c-10a1', gender: 'Nam', status: 'Đang học', note: 'Cần nộp bài tập thực hành đúng hạn hơn', needAttention: true },
  { id: 's-1006', studentCode: 'HS1006', fullName: 'Vũ Ngọc Bảo Trâm', classId: 'c-10a1', gender: 'Nữ', status: 'Đang học', note: 'Khả năng tự học cao, sáng tạo trong việc giải bài toán Tin học' },

  // Lớp 10A2
  { id: 's-1021', studentCode: 'HS1021', fullName: 'Hoàng Quốc Tuấn', classId: 'c-10a2', gender: 'Nam', status: 'Đang học', note: 'Thao tác phím tắt thành thạo, thực hành nhanh' },
  { id: 's-1022', studentCode: 'HS1022', fullName: 'Bùi Thanh Hằng', classId: 'c-10a2', gender: 'Nữ', status: 'Đang học', note: 'Cẩn thận, ghi chú lý thuyết Tin học rất chi tiết' },
  { id: 's-1023', studentCode: 'HS1023', fullName: 'Nguyễn Đình Phúc', classId: 'c-10a2', gender: 'Nam', status: 'Đang học', note: 'Cần củng cố kiến thức về kiểu dữ liệu số và chuỗi', needAttention: true },
  { id: 's-1024', studentCode: 'HS1024', fullName: 'Đặng Ngọc Ánh', classId: 'c-10a2', gender: 'Nữ', status: 'Đang học', note: 'Trình bày giải thuật lưu loát, tự tin trước lớp' },
  { id: 's-1025', studentCode: 'HS1025', fullName: 'Phan Trọng Khang', classId: 'c-10a2', gender: 'Nam', status: 'Đang học', note: 'Hoàn thành tốt các bài tập bảng tính và thuật toán vẽ đồ thị' },

  // Lớp 11A1
  { id: 's-1101', studentCode: 'HS1101', fullName: 'Trịnh Gia Bảo', classId: 'c-11a1', gender: 'Nam', status: 'Đang học', note: 'Thiết kế lược đồ CSDL chuẩn xác, hiểu rõ khóa chính khóa ngoại' },
  { id: 's-1102', studentCode: 'HS1102', fullName: 'Ngô Thảo My', classId: 'c-11a1', gender: 'Nữ', status: 'Đang học', note: 'Viết câu lệnh truy vấn SQL mạch lạc, logic tốt' },
  { id: 's-1103', studentCode: 'HS1103', fullName: 'Võ Minh Quân', classId: 'c-11a1', gender: 'Nam', status: 'Đang học', note: 'Cần rèn thêm kỹ năng chuẩn hóa dữ liệu dạng 2NF, 3NF' },
  { id: 's-1104', studentCode: 'HS1104', fullName: 'Lý Diệu Anh', classId: 'c-11a1', gender: 'Nữ', status: 'Đang học', note: 'Rất chăm chỉ, thường xuyên tìm hiểu thêm tài liệu lập trình' },
  { id: 's-1105', studentCode: 'HS1105', fullName: 'Hồ Tuấn Kiệt', classId: 'c-11a1', gender: 'Nam', status: 'Đang học', note: 'Tiến bộ rõ rệt trong các bài kiểm tra thực hành máy tính' },

  // Lớp 12A1
  { id: 's-1201', studentCode: 'HS1201', fullName: 'Dương Khánh Linh', classId: 'c-12a1', gender: 'Nữ', status: 'Đang học', note: 'Học lực xuất sắc môn Tin học, đạt giải HSG Tin học cấp trường' },
  { id: 's-1202', studentCode: 'HS1202', fullName: 'Vũ Đức Thịnh', classId: 'c-12a1', gender: 'Nam', status: 'Đang học', note: 'Cần chú ý bảo mật mật khẩu và phân quyền mạng', needAttention: true },
  { id: 's-1203', studentCode: 'HS1203', fullName: 'Trần Bích Phương', classId: 'c-12a1', gender: 'Nữ', status: 'Đang học', note: 'Thuyết trình tốt về chuyên đề trí tuệ nhân tạo và an toàn thông tin' },
  { id: 's-1204', studentCode: 'HS1204', fullName: 'Lê Hoàng Long', classId: 'c-12a1', gender: 'Nam', status: 'Đang học', note: 'Nắm vững kiến thức mô hình OSI và giao thức TCP/IP' },
  { id: 's-1205', studentCode: 'HS1205', fullName: 'Nguyễn Ngọc Yến', classId: 'c-12a1', gender: 'Nữ', status: 'Đang học', note: 'Ghi chép bài học cẩn thận, tinh thần học tập gương mẫu' }
];

export const initialLessons: Lesson[] = [
  {
    id: 'l-01',
    title: 'Lập trình Python: Biến, kiểu dữ liệu và các phép toán cơ bản',
    classId: 'c-10a1',
    topic: 'Chủ đề: Lập trình cơ bản với ngôn ngữ Python',
    objectives: 'Khai báo biến đúng cú pháp, phân biệt số nguyên, số thực, chuỗi ký tự và boolean.',
    summary: 'Cú pháp hàm input(), print(), ép kiểu dữ liệu và các phép toán số học cộng trừ nhân chia chia lấy dư trong Python.',
    teachDate: '2026-09-18',
    status: 'Đang dạy',
    attachments: [
      {
        id: 'att-l01-1',
        name: 'GiaoAn_Python_Bien_Va_KieuDuLieu.docx',
        size: 145000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadedAt: '2026-09-17T08:30:00.000Z',
      },
      {
        id: 'att-l01-2',
        name: 'Slide_BaiGiang_Python_CoBan.pptx',
        size: 2150000,
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        uploadedAt: '2026-09-17T09:15:00.000Z',
      },
      {
        id: 'att-l01-3',
        name: 'bai_tap_mau_tinh_toan.py',
        size: 3200,
        type: 'text/x-python',
        uploadedAt: '2026-09-18T07:45:00.000Z',
      }
    ]
  },
  {
    id: 'l-02',
    title: 'Cấu trúc rẽ nhánh if - elif - else trong Python',
    classId: 'c-10a1',
    topic: 'Chủ đề: Cấu trúc điều khiển và giải thuật',
    objectives: 'Hiểu nguyên lý hoạt động của cấu trúc rẽ nhánh; áp dụng giải quyết bài toán phân loại và kiểm tra điều kiện.',
    summary: 'Cú pháp câu lệnh if, if-else, elif, quy tắc thụt lề (indentation) và toán tử so sánh, logic (and, or, not).',
    teachDate: '2026-09-22',
    status: 'Chưa dạy'
  },
  {
    id: 'l-03',
    title: 'Xử lý dữ liệu bảng tính nâng cao và trực quan hóa',
    classId: 'c-10a2',
    topic: 'Chủ đề: Tin học ứng dụng văn phòng',
    objectives: 'Sử dụng thành thạo các hàm thống kê COUNTIF, SUMIF, VLOOKUP và vẽ biểu đồ trực quan.',
    summary: 'Thực hành xử lý dữ liệu khảo sát, định dạng có điều kiện và tạo biểu đồ so sánh số liệu.',
    teachDate: '2026-09-17',
    status: 'Đã hoàn thành'
  },
  {
    id: 'l-04',
    title: 'Khái niệm Cơ sở dữ liệu và Hệ quản trị CSDL quan hệ',
    classId: 'c-11a1',
    topic: 'Chủ đề: Hệ cơ sở dữ liệu quan hệ',
    objectives: 'Nắm vững vai trò của CSDL, phân biệt dữ liệu và thông tin, hiểu các thành phần của một bảng CSDL.',
    summary: 'Giới thiệu về trường (field), bản ghi (record), bảng (table), khái niệm khóa chính và khóa ngoại.',
    teachDate: '2026-09-19',
    status: 'Đang dạy',
    attachments: [
      {
        id: 'att-l04-1',
        name: 'TaiLieu_MoHinhCSDL_QuanHe.pdf',
        size: 890000,
        type: 'application/pdf',
        uploadedAt: '2026-09-18T14:20:00.000Z',
      }
    ]
  },
  {
    id: 'l-05',
    title: 'Thực hành tạo lập bảng CSDL và thiết lập khóa chính',
    classId: 'c-11a1',
    topic: 'Chủ đề: Thiết kế và quản trị CSDL',
    objectives: 'Tạo bảng với các kiểu dữ liệu thích hợp, chỉ định khóa chính và thiết lập mối quan hệ giữa các bảng.',
    summary: 'Thao tác trên phần mềm quản trị CSDL: tạo bảng Học sinh, bảng Lớp, xác lập liên kết 1-nhiều.',
    teachDate: '2026-09-18',
    status: 'Đang dạy'
  },
  {
    id: 'l-06',
    title: 'Mạng máy tính, Internet và các dịch vụ mạng phổ biến',
    classId: 'c-12a1',
    topic: 'Chủ đề: Mạng máy tính và truyền thông',
    objectives: 'Hiểu cấu trúc mạng LAN, WAN, vai trò của modem, router và địa chỉ IP trong kết nối Internet.',
    summary: 'Mô hình client-server, giao thức HTTP/HTTPS, DNS và cách thức hoạt động của mạng máy tính toàn cầu.',
    teachDate: '2026-09-16',
    status: 'Đã hoàn thành'
  },
  {
    id: 'l-07',
    title: 'An toàn thông tin, an ninh mạng và đạo đức trong không gian số',
    classId: 'c-12a1',
    topic: 'Chủ đề: Công nghệ thông tin và xã hội',
    objectives: 'Nhận biết các hình thức tấn công mạng, phần mềm độc hại; nâng cao ý thức tuân thủ Luật An ninh mạng.',
    summary: 'Biện pháp bảo vệ mật khẩu, phòng tránh lừa đảo trực tuyến (Phishing), bản quyền phần mềm và dữ liệu số.',
    teachDate: '2026-09-25',
    status: 'Chưa dạy'
  }
];

export const initialTasks: LearningTask[] = [
  {
    id: 't-01',
    title: 'Viết chương trình Python tính tiền điện sinh hoạt',
    classId: 'c-10a1',
    lessonId: 'l-01',
    description: 'Nhập số kWh điện tiêu thụ, sử dụng công thức tính tiền theo bậc thang giá điện hiện hành và in kết quả ra màn hình.',
    dueDate: '2026-09-19',
    priority: 'Bình thường',
    status: 'Đang thực hiện',
    completedStudentIds: ['s-1001', 's-1002', 's-1004', 's-1006'],
    attachments: [
      {
        id: 'att-t01-1',
        name: 'DeBai_TinhTienDien_HuongDan.pdf',
        size: 245000,
        type: 'application/pdf',
        uploadedAt: '2026-09-18T10:00:00.000Z',
      },
      {
        id: 'att-t01-2',
        name: 'khung_ma_nguon_tinh_dien.py',
        size: 1850,
        type: 'text/x-python',
        uploadedAt: '2026-09-18T10:05:00.000Z',
      }
    ]
  },
  {
    id: 't-02',
    title: 'Bài tập: Viết chương trình giải phương trình bậc hai ax² + bx + c = 0',
    classId: 'c-10a1',
    lessonId: 'l-02',
    description: 'Sử dụng cấu trúc rẽ nhánh if - elif - else xét các trường hợp của delta, chú ý kiểm tra hệ số a = 0.',
    dueDate: '2026-09-20',
    priority: 'Quan trọng',
    status: 'Đã giao',
    completedStudentIds: ['s-1002', 's-1004']
  },
  {
    id: 't-03',
    title: 'Thực hành tạo bảng tính quản lý điểm lớp và vẽ biểu đồ cột',
    classId: 'c-10a2',
    lessonId: 'l-03',
    description: 'Sử dụng các hàm AVERAGE, RANK, IF xếp loại học lực và vẽ biểu đồ phân loại kết quả học tập.',
    dueDate: '2026-09-19',
    priority: 'Quan trọng',
    status: 'Đang thực hiện',
    completedStudentIds: ['s-1021', 's-1022', 's-1024', 's-1025']
  },
  {
    id: 't-04',
    title: 'Thiết kế lược đồ quan hệ cho bài toán Quản lý Thư viện trường học',
    classId: 'c-11a1',
    lessonId: 'l-04',
    description: 'Xác định các thực thể: Sach, DocGia, MuonTra; chỉ ra các thuộc tính và khóa chính của từng bảng.',
    dueDate: '2026-09-21',
    priority: 'Khẩn cấp',
    status: 'Đã giao',
    completedStudentIds: ['s-1101', 's-1102', 's-1104'],
    attachments: [
      {
        id: 'att-t04-1',
        name: 'PhieuHocTap_SoDo_ERD_ThuVien.pdf',
        size: 380000,
        type: 'application/pdf',
        uploadedAt: '2026-09-19T11:00:00.000Z',
      }
    ]
  },
  {
    id: 't-05',
    title: 'Tạo CSDL Quản lý nhân viên và viết câu lệnh truy vấn SQL cơ bản',
    classId: 'c-11a1',
    lessonId: 'l-05',
    description: 'Thực hành viết các câu lệnh SELECT, WHERE, ORDER BY để tìm danh sách nhân viên theo phòng ban.',
    dueDate: '2026-09-18',
    priority: 'Quan trọng',
    status: 'Đã hoàn thành',
    completedStudentIds: ['s-1101', 's-1102', 's-1103', 's-1104', 's-1105']
  },
  {
    id: 't-06',
    title: 'Tìm hiểu và xây dựng poster về 5 nguyên tắc An toàn mật khẩu',
    classId: 'c-12a1',
    lessonId: 'l-07',
    description: 'Tạo infographic hoặc tài liệu tóm tắt các biện pháp bảo vệ tài khoản cá nhân, xác thực 2 yếu tố 2FA.',
    dueDate: '2026-09-24',
    priority: 'Bình thường',
    status: 'Chưa giao',
    completedStudentIds: []
  }
];

export const initialGrades: GradeEntry[] = [
  // Lớp 10A1
  { id: 'g-01', studentId: 's-1001', classId: 'c-10a1', activityTitle: 'Kiểm tra thực hành Python (Cơ bản)', score: 9.5, date: '2026-09-15', note: 'Giải thuật tối ưu, code sạch sẽ chuẩn PEP8' },
  { id: 'g-02', studentId: 's-1002', classId: 'c-10a1', activityTitle: 'Kiểm tra thực hành Python (Cơ bản)', score: 9.0, date: '2026-09-15', note: 'Làm đúng toàn bộ testcase, thao tác nhanh nhẹn' },
  { id: 'g-03', studentId: 's-1003', classId: 'c-10a1', activityTitle: 'Kiểm tra thực hành Python (Cơ bản)', score: 6.0, date: '2026-09-15', note: 'Còn mắc lỗi cú pháp ép kiểu dữ liệu' },
  { id: 'g-04', studentId: 's-1004', classId: 'c-10a1', activityTitle: 'Kiểm tra thực hành Python (Cơ bản)', score: 8.5, date: '2026-09-15', note: 'Nắm chắc kiến thức, xử lý dữ liệu chuẩn' },
  { id: 'g-05', studentId: 's-1005', classId: 'c-10a1', activityTitle: 'Kiểm tra thực hành Python (Cơ bản)', score: 5.5, date: '2026-09-15', note: 'Chưa hoàn thành bài toán số 3' },
  { id: 'g-06', studentId: 's-1006', classId: 'c-10a1', activityTitle: 'Kiểm tra thực hành Python (Cơ bản)', score: 8.5, date: '2026-09-15', note: 'Code sáng sủa, có chú thích giải thích rõ ràng' },

  // Lớp 10A2
  { id: 'g-07', studentId: 's-1021', classId: 'c-10a2', activityTitle: 'Bài thực hành Bảng tính & Xử lý số liệu', score: 8.5, date: '2026-09-14', note: 'Sử dụng hàm chính xác, định dạng bảng đẹp' },
  { id: 'g-08', studentId: 's-1022', classId: 'c-10a2', activityTitle: 'Bài thực hành Bảng tính & Xử lý số liệu', score: 9.0, date: '2026-09-14', note: 'Hoàn thành xuất sắc, biểu đồ trực quan sinh động' },
  { id: 'g-09', studentId: 's-1023', classId: 'c-10a2', activityTitle: 'Bài thực hành Bảng tính & Xử lý số liệu', score: 6.0, date: '2026-09-14', note: 'Cần củng cố cách cố định địa chỉ ô ($A$1)' },
  { id: 'g-10', studentId: 's-1024', classId: 'c-10a2', activityTitle: 'Bài thực hành Bảng tính & Xử lý số liệu', score: 9.0, date: '2026-09-14', note: 'Thao tác máy tính rất nhanh và chính xác' },
  { id: 'g-11', studentId: 's-1025', classId: 'c-10a2', activityTitle: 'Bài thực hành Bảng tính & Xử lý số liệu', score: 7.5, date: '2026-09-14', note: 'Đạt yêu cầu bài thực hành' },

  // Lớp 11A1
  { id: 'g-12', studentId: 's-1101', classId: 'c-11a1', activityTitle: 'Kiểm tra 15 phút: Thiết kế CSDL quan hệ', score: 9.0, date: '2026-09-16', note: 'Thiết kế khóa chính và liên kết bảng hoàn hảo' },
  { id: 'g-13', studentId: 's-1102', classId: 'c-11a1', activityTitle: 'Kiểm tra 15 phút: Thiết kế CSDL quan hệ', score: 8.5, date: '2026-09-16', note: 'Xác định đúng các thuộc tính của bảng' },
  { id: 'g-14', studentId: 's-1103', classId: 'c-11a1', activityTitle: 'Kiểm tra 15 phút: Thiết kế CSDL quan hệ', score: 7.0, date: '2026-09-16', note: 'Còn nhầm lẫn giữa khóa chính và trường định danh' },
  { id: 'g-15', studentId: 's-1104', classId: 'c-11a1', activityTitle: 'Kiểm tra 15 phút: Thiết kế CSDL quan hệ', score: 9.0, date: '2026-09-16', note: 'Nắm rất vững các phép toán đại số quan hệ' },
  { id: 'g-16', studentId: 's-1105', classId: 'c-11a1', activityTitle: 'Kiểm tra 15 phút: Thiết kế CSDL quan hệ', score: 8.0, date: '2026-09-16', note: 'Tiến bộ nhiều so với bài kiểm tra trước' },

  // Lớp 12A1
  { id: 'g-17', studentId: 's-1201', classId: 'c-12a1', activityTitle: 'Kiểm tra giữa kỳ: Mạng máy tính & An ninh mạng', score: 9.8, date: '2026-09-17', note: 'Bài làm xuất sắc, am hiểu sâu rộng về công nghệ' },
  { id: 'g-18', studentId: 's-1202', classId: 'c-12a1', activityTitle: 'Kiểm tra giữa kỳ: Mạng máy tính & An ninh mạng', score: 6.5, date: '2026-09-17', note: 'Cần đọc kỹ lý thuyết các tầng trong mô hình mạng' },
  { id: 'g-19', studentId: 's-1203', classId: 'c-12a1', activityTitle: 'Kiểm tra giữa kỳ: Mạng máy tính & An ninh mạng', score: 9.0, date: '2026-09-17', note: 'Phân tích tình huống an ninh mạng sắc sảo' },
  { id: 'g-20', studentId: 's-1204', classId: 'c-12a1', activityTitle: 'Kiểm tra giữa kỳ: Mạng máy tính & An ninh mạng', score: 8.5, date: '2026-09-17', note: 'Giải thích đúng nguyên lý định tuyến gói tin IP' },
  { id: 'g-21', studentId: 's-1205', classId: 'c-12a1', activityTitle: 'Kiểm tra giữa kỳ: Mạng máy tính & An ninh mạng', score: 8.5, date: '2026-09-17', note: 'Bài làm trình bày khoa học, sạch đẹp' }
];

export const initialComments: StudentComment[] = [
  {
    id: 'cm-01',
    studentId: 's-1001',
    classId: 'c-10a1',
    date: '2026-09-16',
    content: 'Tư duy thuật toán rất sắc sảo, tự tìm hiểu thêm các cấu trúc dữ liệu nâng cao như List và Dictionary trong Python.',
    skillCategory: 'Lập trình & Thuật toán',
    note: 'Đề xuất tham gia đội tuyển bồi dưỡng học sinh giỏi Tin học khối 10'
  },
  {
    id: 'cm-02',
    studentId: 's-1003',
    classId: 'c-10a1',
    date: '2026-09-17',
    content: 'Em nắm được ý tưởng giải bài toán nhưng còn lúng túng khi debug lỗi cú pháp, tốc độ gõ code còn chậm.',
    skillCategory: 'Thực hành máy tính',
    note: 'Cô đã hướng dẫn mẫu cách đọc thông báo Traceback để sửa lỗi trong giờ thực hành'
  },
  {
    id: 'cm-03',
    studentId: 's-1024',
    classId: 'c-10a2',
    date: '2026-09-15',
    content: 'Thuyết trình tự tin về đề tài Ứng dụng của Trí tuệ nhân tạo trong đời sống, bài làm minh họa rất trực quan.',
    skillCategory: 'Dự án & Bài tập',
    note: 'Khen ngợi trước lớp để khích lệ tinh thần sáng tạo'
  },
  {
    id: 'cm-04',
    studentId: 's-1101',
    classId: 'c-11a1',
    date: '2026-09-16',
    content: 'Có khả năng phân tích mô hình quan hệ CSDL rất tốt, đặt ra các câu hỏi mở thú vị trong giờ học lý thuyết.',
    skillCategory: 'Lý thuyết Tin học',
    note: 'Khuyến khích đọc thêm giáo trình Hệ quản trị Cơ sở dữ liệu'
  },
  {
    id: 'cm-05',
    studentId: 's-1202',
    classId: 'c-12a1',
    date: '2026-09-17',
    content: 'Cần chú ý cẩn thận khi cấu hình tham số mạng trên máy thực hành, chú ý tuân thủ nội quy phòng máy.',
    skillCategory: 'Thái độ & Chuyên cần',
    note: 'Cô đã nhắc nhở ngồi đúng máy được phân công và lưu bài định kỳ'
  }
];

export const initialActivityLogs: ActivityLog[] = [
  { id: 'act-01', timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), type: 'grade', action: 'Đã cập nhật điểm bài "Kiểm tra giữa kỳ: Mạng máy tính" lớp 12A1' },
  { id: 'act-02', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), type: 'task', action: 'Đã giao nhiệm vụ mới: "Lược đồ quan hệ CSDL Thư viện" cho lớp 11A1' },
  { id: 'act-03', timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), type: 'lesson', action: 'Đã cập nhật trạng thái bài học Lập trình Python lớp 10A1 sang "Đang dạy"' },
  { id: 'act-04', timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(), type: 'comment', action: 'Đã thêm nhận xét rèn luyện kỹ năng thực hành cho học sinh Lê Minh Đức' },
  { id: 'act-05', timestamp: new Date(Date.now() - 1000 * 60 * 500).toISOString(), type: 'student', action: 'Đã kiểm tra và đồng bộ danh sách học sinh khối THPT Nguyễn Dục' }
];

export const initialAppData: AppData = {
  classes: initialClasses,
  students: initialStudents,
  lessons: initialLessons,
  tasks: initialTasks,
  grades: initialGrades,
  comments: initialComments,
  activityLogs: initialActivityLogs,
  soundEnabled: false // Âm thanh tắt mặc định
};
