import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  AppData,
  ClassItem,
  Student,
  Lesson,
  LearningTask,
  GradeEntry,
  StudentComment,
  ActivityLog,
} from '../types';

export interface SupabaseStatus {
  isConfigured: boolean;
  isConnected: boolean;
  tablesExist: boolean;
  missingTables: string[];
  errorMessage?: string;
  lastChecked?: string;
}

export const REQUIRED_TABLES = [
  'classes',
  'students',
  'lessons',
  'tasks',
  'grades',
  'comments',
  'activity_logs',
];

export const SUPABASE_INIT_SQL = `-- ==============================================================================
-- KỊCH BẢN KHỞI TẠO CƠ SỞ DỮ LIỆU SUPABASE
-- Ứng dụng: Trợ lý Quản trị Học tập – Cô Trần Thị Tuyết Nhung (THPT Nguyễn Dục)
-- ==============================================================================

-- 1. BẢNG LỚP HỌC (classes)
create table if not exists public.classes (
  id text primary key,
  name text not null,
  grade_level integer not null,
  room text,
  academic_year text not null,
  note text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. BẢNG HỌC SINH (students)
create table if not exists public.students (
  id text primary key,
  student_code text not null,
  full_name text not null,
  class_id text not null,
  gender text not null,
  status text not null,
  note text,
  need_attention boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. BẢNG BÀI HỌC / GIÁO ÁN (lessons)
create table if not exists public.lessons (
  id text primary key,
  title text not null,
  class_id text not null,
  topic text not null,
  objectives text,
  summary text,
  teach_date text not null,
  status text not null,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. BẢNG NHIỆM VỤ HỌC TẬP (tasks)
create table if not exists public.tasks (
  id text primary key,
  title text not null,
  class_id text not null,
  lesson_id text,
  description text,
  due_date text not null,
  priority text not null,
  status text not null,
  completed_student_ids jsonb default '[]'::jsonb,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. BẢNG ĐIỂM SỐ (grades)
create table if not exists public.grades (
  id text primary key,
  student_id text not null,
  class_id text not null,
  activity_title text not null,
  lesson_id text,
  score numeric not null,
  date text not null,
  note text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 6. BẢNG NHẬN XÉT HỌC SINH (comments)
create table if not exists public.comments (
  id text primary key,
  student_id text not null,
  class_id text not null,
  date text not null,
  content text not null,
  skill_category text not null,
  note text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 7. BẢNG NHẬT KÝ HOẠT ĐỘNG (activity_logs)
create table if not exists public.activity_logs (
  id text primary key,
  timestamp text not null,
  type text not null,
  action text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 8. BẢNG TÀI KHOẢN NGƯỜI DÙNG (app_users - Đăng nhập bằng Tên đăng nhập)
create table if not exists public.app_users (
  id text primary key,
  username text unique not null,
  password text not null,
  full_name text not null,
  role text default 'Giáo viên bộ môn Tin học',
  school text default 'THPT Nguyễn Dục',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- BẢO MẬT & PHÂN QUYỀN TRUY CẬP (ROW LEVEL SECURITY - RLS)
-- Cho phép đọc/ghi công khai thông qua Supabase Publishable / Anon Key
-- ==============================================================================

alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.lessons enable row level security;
alter table public.tasks enable row level security;
alter table public.grades enable row level security;
alter table public.comments enable row level security;
alter table public.activity_logs enable row level security;
alter table public.app_users enable row level security;

-- Xóa chính sách cũ nếu đã tồn tại để tránh lỗi 42710 (already exists)
drop policy if exists "Allow all on classes" on public.classes;
drop policy if exists "Cho phép đọc ghi classes" on public.classes;
create policy "Allow all on classes" on public.classes for all using (true) with check (true);

drop policy if exists "Allow all on students" on public.students;
drop policy if exists "Cho phép đọc ghi students" on public.students;
create policy "Allow all on students" on public.students for all using (true) with check (true);

drop policy if exists "Allow all on lessons" on public.lessons;
drop policy if exists "Cho phép đọc ghi lessons" on public.lessons;
create policy "Allow all on lessons" on public.lessons for all using (true) with check (true);

drop policy if exists "Allow all on tasks" on public.tasks;
drop policy if exists "Cho phép đọc ghi tasks" on public.tasks;
create policy "Allow all on tasks" on public.tasks for all using (true) with check (true);

drop policy if exists "Allow all on grades" on public.grades;
drop policy if exists "Cho phép đọc ghi grades" on public.grades;
create policy "Allow all on grades" on public.grades for all using (true) with check (true);

drop policy if exists "Allow all on comments" on public.comments;
drop policy if exists "Cho phép đọc ghi comments" on public.comments;
create policy "Allow all on comments" on public.comments for all using (true) with check (true);

drop policy if exists "Allow all on activity_logs" on public.activity_logs;
drop policy if exists "Cho phép đọc ghi activity_logs" on public.activity_logs;
create policy "Allow all on activity_logs" on public.activity_logs for all using (true) with check (true);

drop policy if exists "Allow all on app_users" on public.app_users;
drop policy if exists "Cho phép đọc ghi app_users" on public.app_users;
create policy "Allow all on app_users" on public.app_users for all using (true) with check (true);

-- Kích hoạt Realtime an toàn (Bỏ qua nếu đã kích hoạt trước đó)
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  begin
    alter publication supabase_realtime add table public.classes;
  exception when others then null;
  end;

  begin
    alter publication supabase_realtime add table public.students;
  exception when others then null;
  end;

  begin
    alter publication supabase_realtime add table public.lessons;
  exception when others then null;
  end;

  begin
    alter publication supabase_realtime add table public.tasks;
  exception when others then null;
  end;

  begin
    alter publication supabase_realtime add table public.grades;
  exception when others then null;
  end;

  begin
    alter publication supabase_realtime add table public.comments;
  exception when others then null;
  end;

  begin
    alter publication supabase_realtime add table public.activity_logs;
  exception when others then null;
  end;

  begin
    alter publication supabase_realtime add table public.app_users;
  exception when others then null;
  end;
end $$;
`;

// Helper chuyển đổi giữa Client Model (camelCase) và Database Row (snake_case)
function toDbClass(c: ClassItem) {
  return {
    id: c.id,
    name: c.name,
    grade_level: c.gradeLevel,
    room: c.room || '',
    academic_year: c.academicYear,
    note: c.note || '',
  };
}

function fromDbClass(row: any): ClassItem {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    gradeLevel: Number(row.grade_level) || 10,
    room: row.room || undefined,
    academicYear: String(row.academic_year || '2025-2026'),
    note: row.note || undefined,
  };
}

function toDbStudent(s: Student) {
  return {
    id: s.id,
    student_code: s.studentCode,
    full_name: s.fullName,
    class_id: s.classId,
    gender: s.gender,
    status: s.status,
    note: s.note || '',
    need_attention: Boolean(s.needAttention),
  };
}

function fromDbStudent(row: any): Student {
  return {
    id: String(row.id),
    studentCode: String(row.student_code || ''),
    fullName: String(row.full_name || ''),
    classId: String(row.class_id || ''),
    gender: row.gender === 'Nữ' ? 'Nữ' : 'Nam',
    status: (row.status as Student['status']) || 'Đang học',
    note: row.note || undefined,
    needAttention: Boolean(row.need_attention),
  };
}

function toDbLesson(l: Lesson) {
  return {
    id: l.id,
    title: l.title,
    class_id: l.classId,
    topic: l.topic,
    objectives: l.objectives || '',
    summary: l.summary || '',
    teach_date: l.teachDate,
    status: l.status,
    attachments: l.attachments || [],
  };
}

function fromDbLesson(row: any): Lesson {
  return {
    id: String(row.id),
    title: String(row.title || ''),
    classId: String(row.class_id || ''),
    topic: String(row.topic || ''),
    objectives: String(row.objectives || ''),
    summary: String(row.summary || ''),
    teachDate: String(row.teach_date || ''),
    status: (row.status as Lesson['status']) || 'Chưa dạy',
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
  };
}

function toDbTask(t: LearningTask) {
  return {
    id: t.id,
    title: t.title,
    class_id: t.classId,
    lesson_id: t.lessonId || null,
    description: t.description || '',
    due_date: t.dueDate,
    priority: t.priority,
    status: t.status,
    completed_student_ids: t.completedStudentIds || [],
    attachments: t.attachments || [],
  };
}

function fromDbTask(row: any): LearningTask {
  return {
    id: String(row.id),
    title: String(row.title || ''),
    classId: String(row.class_id || ''),
    lessonId: row.lesson_id || undefined,
    description: String(row.description || ''),
    dueDate: String(row.due_date || ''),
    priority: (row.priority as LearningTask['priority']) || 'Bình thường',
    status: (row.status as LearningTask['status']) || 'Đã giao',
    completedStudentIds: Array.isArray(row.completed_student_ids) ? row.completed_student_ids : [],
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
  };
}

function toDbGrade(g: GradeEntry) {
  return {
    id: g.id,
    student_id: g.studentId,
    class_id: g.classId,
    activity_title: g.activityTitle,
    lesson_id: g.lessonId || null,
    score: g.score,
    date: g.date,
    note: g.note || '',
  };
}

function fromDbGrade(row: any): GradeEntry {
  return {
    id: String(row.id),
    studentId: String(row.student_id || ''),
    classId: String(row.class_id || ''),
    activityTitle: String(row.activity_title || ''),
    lessonId: row.lesson_id || undefined,
    score: Number(row.score) || 0,
    date: String(row.date || ''),
    note: row.note || undefined,
  };
}

function toDbComment(c: StudentComment) {
  return {
    id: c.id,
    student_id: c.studentId,
    class_id: c.classId,
    date: c.date,
    content: c.content,
    skill_category: c.skillCategory,
    note: c.note || '',
  };
}

function fromDbComment(row: any): StudentComment {
  return {
    id: String(row.id),
    studentId: String(row.student_id || ''),
    classId: String(row.class_id || ''),
    date: String(row.date || ''),
    content: String(row.content || ''),
    skillCategory: (row.skill_category as StudentComment['skillCategory']) || 'Khác',
    note: row.note || undefined,
  };
}

function toDbLog(l: ActivityLog) {
  return {
    id: l.id,
    timestamp: l.timestamp,
    type: l.type,
    action: l.action,
  };
}

function fromDbLog(row: any): ActivityLog {
  return {
    id: String(row.id),
    timestamp: String(row.timestamp || ''),
    type: (row.type as ActivityLog['type']) || 'student',
    action: String(row.action || ''),
  };
}

/**
 * Kiểm tra kết nối tới Supabase và tình trạng các bảng
 */
export async function checkSupabaseHealth(): Promise<SupabaseStatus> {
  if (!isSupabaseConfigured) {
    return {
      isConfigured: false,
      isConnected: false,
      tablesExist: false,
      missingTables: REQUIRED_TABLES,
      errorMessage: 'Chưa cấu hình VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY',
      lastChecked: new Date().toLocaleTimeString('vi-VN'),
    };
  }

  try {
    const missing: string[] = [];
    let connected = false;

    for (const table of REQUIRED_TABLES) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error) {
        // Mã PGRST205 / PGRST200 / 42P01: Table not found in schema cache
        if (
          error.code === 'PGRST205' ||
          error.code === '42P01' ||
          error.message?.toLowerCase().includes('could not find the table') ||
          error.message?.toLowerCase().includes('relation')
        ) {
          missing.push(table);
          connected = true; // Kết nối tới Supabase thành công nhưng chưa tạo bảng
        } else {
          // Lỗi xác thực hoặc mạng
          return {
            isConfigured: true,
            isConnected: false,
            tablesExist: false,
            missingTables: REQUIRED_TABLES,
            errorMessage: `${error.message} (mã: ${error.code})`,
            lastChecked: new Date().toLocaleTimeString('vi-VN'),
          };
        }
      } else {
        connected = true;
      }
    }

    return {
      isConfigured: true,
      isConnected: connected,
      tablesExist: missing.length === 0,
      missingTables: missing,
      lastChecked: new Date().toLocaleTimeString('vi-VN'),
    };
  } catch (err) {
    return {
      isConfigured: true,
      isConnected: false,
      tablesExist: false,
      missingTables: REQUIRED_TABLES,
      errorMessage: err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ Supabase',
      lastChecked: new Date().toLocaleTimeString('vi-VN'),
    };
  }
}

/**
 * Tải toàn bộ dữ liệu từ Supabase về
 */
export async function fetchAppDataFromSupabase(): Promise<{ data?: Partial<AppData>; error?: string }> {
  try {
    const [
      resClasses,
      resStudents,
      resLessons,
      resTasks,
      resGrades,
      resComments,
      resLogs,
    ] = await Promise.all([
      supabase.from('classes').select('*'),
      supabase.from('students').select('*'),
      supabase.from('lessons').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('grades').select('*'),
      supabase.from('comments').select('*'),
      supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(100),
    ]);

    if (resClasses.error) throw resClasses.error;
    if (resStudents.error) throw resStudents.error;
    if (resLessons.error) throw resLessons.error;
    if (resTasks.error) throw resTasks.error;
    if (resGrades.error) throw resGrades.error;
    if (resComments.error) throw resComments.error;
    if (resLogs.error) throw resLogs.error;

    const result: Partial<AppData> = {
      classes: (resClasses.data || []).map(fromDbClass),
      students: (resStudents.data || []).map(fromDbStudent),
      lessons: (resLessons.data || []).map(fromDbLesson),
      tasks: (resTasks.data || []).map(fromDbTask),
      grades: (resGrades.data || []).map(fromDbGrade),
      comments: (resComments.data || []).map(fromDbComment),
      activityLogs: (resLogs.data || []).map(fromDbLog),
    };

    return { data: result };
  } catch (err: any) {
    console.error('Lỗi khi tải dữ liệu từ Supabase:', err);
    return { error: err.message || 'Lỗi khi tải dữ liệu từ Supabase' };
  }
}

/**
 * Đẩy toàn bộ dữ liệu hiện tại (hoặc dữ liệu mẫu) lên Supabase
 */
export async function pushAppDataToSupabase(data: AppData): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Classes
    if (data.classes.length > 0) {
      const rows = data.classes.map(toDbClass);
      const { error } = await supabase.from('classes').upsert(rows, { onConflict: 'id' });
      if (error) throw new Error(`Lỗi đẩy dữ liệu Lớp học: ${error.message}`);
    }

    // 2. Students
    if (data.students.length > 0) {
      const rows = data.students.map(toDbStudent);
      const { error } = await supabase.from('students').upsert(rows, { onConflict: 'id' });
      if (error) throw new Error(`Lỗi đẩy dữ liệu Học sinh: ${error.message}`);
    }

    // 3. Lessons
    if (data.lessons.length > 0) {
      const rows = data.lessons.map(toDbLesson);
      const { error } = await supabase.from('lessons').upsert(rows, { onConflict: 'id' });
      if (error) throw new Error(`Lỗi đẩy dữ liệu Bài học: ${error.message}`);
    }

    // 4. Tasks
    if (data.tasks.length > 0) {
      const rows = data.tasks.map(toDbTask);
      const { error } = await supabase.from('tasks').upsert(rows, { onConflict: 'id' });
      if (error) throw new Error(`Lỗi đẩy dữ liệu Nhiệm vụ: ${error.message}`);
    }

    // 5. Grades
    if (data.grades.length > 0) {
      const rows = data.grades.map(toDbGrade);
      const { error } = await supabase.from('grades').upsert(rows, { onConflict: 'id' });
      if (error) throw new Error(`Lỗi đẩy dữ liệu Điểm số: ${error.message}`);
    }

    // 6. Comments
    if (data.comments.length > 0) {
      const rows = data.comments.map(toDbComment);
      const { error } = await supabase.from('comments').upsert(rows, { onConflict: 'id' });
      if (error) throw new Error(`Lỗi đẩy dữ liệu Nhận xét: ${error.message}`);
    }

    // 7. Activity Logs
    if (data.activityLogs.length > 0) {
      const rows = data.activityLogs.slice(0, 50).map(toDbLog);
      const { error } = await supabase.from('activity_logs').upsert(rows, { onConflict: 'id' });
      if (error) throw new Error(`Lỗi đẩy dữ liệu Nhật ký: ${error.message}`);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi đẩy dữ liệu lên Supabase:', err);
    return { success: false, error: err.message || 'Lỗi không xác định khi đẩy dữ liệu' };
  }
}

/**
 * Xóa một bản ghi cụ thể trên Supabase
 */
export async function deleteRecordFromSupabase(table: string, id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      console.warn(`Lỗi khi xóa trên Supabase table ${table}:`, error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Đăng ký Realtime Subscriptions để nhận cập nhật khi có thiết bị khác chỉnh sửa
 */
export function subscribeToSupabaseChanges(onRemoteChange: () => void) {
  const channel = supabase
    .channel('public:school_management')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, () => onRemoteChange())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => onRemoteChange())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons' }, () => onRemoteChange())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => onRemoteChange())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'grades' }, () => onRemoteChange())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => onRemoteChange())
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
