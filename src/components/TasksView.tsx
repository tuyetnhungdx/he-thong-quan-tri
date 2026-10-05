import React, { useState, useMemo, useRef } from 'react';
import {
  CheckSquare,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  X,
  Upload,
  Download,
  Paperclip,
  FileText,
  FileCode,
  FileSpreadsheet,
  Presentation,
  File,
  FileArchive
} from 'lucide-react';
import { LearningTask, TaskStatus, TaskPriority, AppData, Student, AttachedFile } from '../types';
import { formatFileSize, readFileAsDataUrl, downloadAttachedFile } from '../utils/fileHelpers';

interface TasksViewProps {
  data: AppData;
  initialClassFilter?: string;
  initialSearchQuery?: string;
  onAddTask: (task: Omit<LearningTask, 'id'>) => void;
  onUpdateTask: (task: LearningTask) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleStudentTask: (taskId: string, studentId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  data,
  initialClassFilter = 'ALL',
  initialSearchQuery = '',
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleStudentTask,
}) => {
  const [search, setSearch] = useState(initialSearchQuery);
  const [selectedClassId, setSelectedClassId] = useState(initialClassFilter);
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<LearningTask | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Bình thường');
  const [status, setStatus] = useState<TaskStatus>('Đã giao');
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [formError, setFormError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Submissions Tracker Drawer
  const [trackingTask, setTrackingTask] = useState<LearningTask | null>(null);

  // Hidden direct file input ref for quick uploading to a specific task card
  const directFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetTask, setUploadTargetTask] = useState<LearningTask | null>(null);

  // Filtering
  const filteredTasks = useMemo(() => {
    return data.tasks.filter((t) => {
      if (selectedClassId !== 'ALL' && t.classId !== selectedClassId) return false;
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesFile = (t.attachments || []).some((att) => att.name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesFile) return false;
      }
      return true;
    });
  }, [data.tasks, selectedClassId, statusFilter, search]);

  const handleOpenAdd = () => {
    setEditingTask(null);
    setTitle('');
    const defaultClassId = data.classes[0]?.id || '';
    setClassId(defaultClassId);
    setLessonId('');
    setDescription('');
    // Default due date: in 3 days
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setDueDate(d.toISOString().split('T')[0]);
    setPriority('Quan trọng');
    setStatus('Đã giao');
    setAttachments([]);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: LearningTask) => {
    setEditingTask(t);
    setTitle(t.title);
    setClassId(t.classId);
    setLessonId(t.lessonId || '');
    setDescription(t.description);
    setDueDate(t.dueDate);
    setPriority(t.priority);
    setStatus(t.status);
    setAttachments(t.attachments || []);
    setFormError('');
    setIsModalOpen(true);
  };

  // Helper to render matching icon based on file extension
  const renderFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['py', 'js', 'ts', 'html', 'css', 'sql', 'cpp', 'java', 'c'].includes(ext)) {
      return <FileCode className="w-4 h-4 text-emerald-600 shrink-0" />;
    }
    if (['ppt', 'pptx'].includes(ext)) {
      return <Presentation className="w-4 h-4 text-amber-600 shrink-0" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return <FileSpreadsheet className="w-4 h-4 text-green-600 shrink-0" />;
    }
    if (['pdf'].includes(ext)) {
      return <FileText className="w-4 h-4 text-rose-600 shrink-0" />;
    }
    if (['doc', 'docx'].includes(ext)) {
      return <FileText className="w-4 h-4 text-blue-600 shrink-0" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <FileArchive className="w-4 h-4 text-purple-600 shrink-0" />;
    }
    return <File className="w-4 h-4 text-slate-500 shrink-0" />;
  };

  // Upload handler inside modal
  const handleModalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const newFiles: AttachedFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let dataUrl: string | undefined = undefined;
        if (file.size <= 8 * 1024 * 1024) {
          dataUrl = await readFileAsDataUrl(file);
        }
        newFiles.push({
          id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          name: file.name,
          size: file.size,
          type: file.type || file.name.split('.').pop() || 'unknown',
          dataUrl,
          uploadedAt: new Date().toISOString(),
        });
      }
      setAttachments((prev) => [...prev, ...newFiles]);
    } catch (err) {
      console.error('Lỗi khi tải tệp lên nhiệm vụ:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveModalAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  // Quick Direct Upload to Task Card
  const handleTriggerDirectUpload = (task: LearningTask) => {
    setUploadTargetTask(task);
    if (directFileInputRef.current) {
      directFileInputRef.current.value = '';
      directFileInputRef.current.click();
    }
  };

  const handleDirectFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !uploadTargetTask) return;

    try {
      const newFiles: AttachedFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let dataUrl: string | undefined = undefined;
        if (file.size <= 8 * 1024 * 1024) {
          dataUrl = await readFileAsDataUrl(file);
        }
        newFiles.push({
          id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          name: file.name,
          size: file.size,
          type: file.type || file.name.split('.').pop() || 'unknown',
          dataUrl,
          uploadedAt: new Date().toISOString(),
        });
      }

      const updatedAttachments = [...(uploadTargetTask.attachments || []), ...newFiles];
      onUpdateTask({
        ...uploadTargetTask,
        attachments: updatedAttachments,
      });
    } catch (err) {
      console.error('Lỗi tải tệp trực tiếp vào nhiệm vụ:', err);
    } finally {
      setUploadTargetTask(null);
      e.target.value = '';
    }
  };

  const handleRemoveCardAttachment = (task: LearningTask, attId: string) => {
    const updated = (task.attachments || []).filter((a) => a.id !== attId);
    onUpdateTask({ ...task, attachments: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Vui lòng nhập tên nhiệm vụ học tập');
      return;
    }
    if (!classId) {
      setFormError('Vui lòng chọn lớp');
      return;
    }
    if (!dueDate) {
      setFormError('Vui lòng chọn hạn hoàn thành');
      return;
    }

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        title: title.trim(),
        classId,
        lessonId: lessonId || undefined,
        description: description.trim() || 'Nhiệm vụ rèn luyện kỹ năng Tin học',
        dueDate,
        priority,
        status,
        attachments,
      });
    } else {
      onAddTask({
        title: title.trim(),
        classId,
        lessonId: lessonId || undefined,
        description: description.trim() || 'Nhiệm vụ rèn luyện kỹ năng Tin học',
        dueDate,
        priority,
        status,
        completedStudentIds: [],
        attachments,
      });
    }

    setIsModalOpen(false);
  };

  const handleQuickStatusChange = (task: LearningTask, newStatus: TaskStatus) => {
    onUpdateTask({ ...task, status: newStatus });
  };

  return (
    <div id="tasks-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Hidden file input for card direct upload */}
      <input
        ref={directFileInputRef}
        type="file"
        multiple
        onChange={handleDirectFileChange}
        className="hidden"
        accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.csv,.py,.txt,.zip,.rar,.png,.jpg,.jpeg"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý Nhiệm vụ Học tập</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Giao bài tập lập trình, thực hành máy tính, đề bài và theo dõi tiến độ nộp bài của học sinh
          </p>
        </div>
        <button
          id="add-task-btn"
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all min-h-[44px] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Giao nhiệm vụ mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên nhiệm vụ, nội dung, tệp đính kèm..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 bg-slate-50/50"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium focus:outline-hidden focus:border-blue-600"
          >
            <option value="ALL">Tất cả các lớp</option>
            {data.classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | TaskStatus)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium focus:outline-hidden focus:border-blue-600"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Chưa giao">Chưa giao</option>
            <option value="Đã giao">Đã giao</option>
            <option value="Đang thực hiện">Đang thực hiện</option>
            <option value="Đã hoàn thành">Đã hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Task List Table or Cards */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Không có nhiệm vụ nào</h3>
          <p className="text-xs text-slate-400 mt-1">
            Cô có thể giao nhiệm vụ mới hoặc thay đổi bộ lọc tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const className = data.classes.find((c) => c.id === task.classId)?.name || 'Chung';
            const relatedLesson = data.lessons.find((l) => l.id === task.lessonId);
            const classStudents = data.students.filter((s) => s.classId === task.classId);
            const completedCount = task.completedStudentIds.length;
            const percent =
              classStudents.length > 0 ? Math.round((completedCount / classStudents.length) * 100) : 0;
            const taskFiles = task.attachments || [];

            return (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col md:flex-row md:items-start justify-between gap-5"
              >
                {/* Left: Task info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      Lớp {className}
                    </span>

                    {/* Priority Badge */}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                        task.priority === 'Khẩn cấp'
                          ? 'bg-rose-100 text-rose-800'
                          : task.priority === 'Quan trọng'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.priority === 'Khẩn cấp' && '🔥 '}
                      {task.priority}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        task.status === 'Đã hoàn thành'
                          ? 'bg-emerald-100 text-emerald-800'
                          : task.status === 'Đang thực hiện'
                          ? 'bg-blue-100 text-blue-800'
                          : task.status === 'Đã giao'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Hạn hoàn thành: <strong className="text-slate-800">{task.dueDate}</strong>
                    </span>

                    {relatedLesson && (
                      <span className="text-indigo-700 font-medium truncate max-w-xs">
                        Bài học: {relatedLesson.title}
                      </span>
                    )}
                  </div>

                  {/* Attached Files List & Quick Upload */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700 text-xs">
                        <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                        <span>Tài liệu đính kèm ({taskFiles.length})</span>
                      </span>

                      {/* Direct Upload Button on Task */}
                      <button
                        type="button"
                        onClick={() => handleTriggerDirectUpload(task)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors active:scale-95"
                        title="Tải đề bài, file code mẫu, bài tập lên"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Tải tệp lên</span>
                      </button>
                    </div>

                    {taskFiles.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {taskFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 transition-colors group/file text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {renderFileIcon(file.name)}
                              <span className="truncate text-slate-800 font-medium" title={file.name}>
                                {file.name}
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                ({formatFileSize(file.size)})
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => downloadAttachedFile(file)}
                                className="p-1 text-slate-400 hover:text-blue-700 hover:bg-white rounded transition-colors"
                                title="Tải tệp xuống máy"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveCardAttachment(task, file.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors"
                                title="Xóa tệp đính kèm này"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        Chưa có tệp đính kèm. Bấm nút "Tải tệp lên" để thêm đề bài hoặc tài liệu.
                      </p>
                    )}
                  </div>
                </div>

                {/* Center: Completion Progress Bar */}
                <div className="w-full md:w-56 p-3 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-600">Đã nộp bài:</span>
                    <span className="text-blue-700 font-bold">
                      {completedCount}/{classStudents.length} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setTrackingTask(task)}
                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 hover:bg-blue-100/50 py-1.5 rounded-lg transition-colors border border-blue-200/60 bg-white"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Chi tiết học sinh nộp bài</span>
                  </button>
                </div>

                {/* Right: Actions */}
                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <select
                    value={task.status}
                    onChange={(e) => handleQuickStatusChange(task, e.target.value as TaskStatus)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="Chưa giao">Chưa giao</option>
                    <option value="Đã giao">Đã giao</option>
                    <option value="Đang thực hiện">Đang thực hiện</option>
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                  </select>

                  <div className="flex items-center gap-1 ml-auto md:ml-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(task)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Sửa nhiệm vụ"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Xóa nhiệm vụ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div
          id="task-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <h3 className="font-bold text-slate-900 text-base">
                {editingTask ? 'Chỉnh sửa nhiệm vụ' : '+ Giao nhiệm vụ học tập mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              {formError && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200 font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên nhiệm vụ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Viết chương trình Python tính tiền điện, Bài tập CSDL..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lớp <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                  >
                    {data.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bài học liên quan (tùy chọn)
                  </label>
                  <select
                    value={lessonId}
                    onChange={(e) => setLessonId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs"
                  >
                    <option value="">-- Không gắn bài học --</option>
                    {data.lessons
                      .filter((l) => !classId || l.classId === classId)
                      .map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hạn hoàn thành <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ưu tiên</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="Bình thường">Bình thường</option>
                    <option value="Quan trọng">Quan trọng</option>
                    <option value="Khẩn cấp">Khẩn cấp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="Chưa giao">Chưa giao</option>
                    <option value="Đã giao">Đã giao</option>
                    <option value="Đang thực hiện">Đang thực hiện</option>
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô tả & Yêu cầu bài làm
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Yêu cầu cụ thể: Học sinh viết mã nguồn Python, chạy thử nghiệm testcase, nộp tệp file bài làm..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              {/* File Upload Section in Modal */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Tệp đính kèm nhiệm vụ
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Tải lên đề bài (.pdf, .docx), tệp mã nguồn mẫu (.py, .sql), phiếu học tập...
                    </p>
                  </div>

                  <label
                    htmlFor="modal-task-file-upload"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg shadow-2xs cursor-pointer transition-colors active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Đang tải...' : '+ Tải tệp lên'}</span>
                  </label>
                  <input
                    id="modal-task-file-upload"
                    type="file"
                    multiple
                    onChange={handleModalFileUpload}
                    className="hidden"
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.csv,.py,.txt,.zip,.rar,.png,.jpg,.jpeg"
                  />
                </div>

                {attachments.length > 0 ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                    {attachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {renderFileIcon(file.name)}
                          <span className="truncate text-slate-800 font-medium">{file.name}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveModalAttachment(file.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Xóa tệp khỏi nhiệm vụ"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                    Chưa chọn tệp đính kèm nào. Bấm "+ Tải tệp lên" ở trên để thêm tệp đề bài.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  {editingTask ? 'Lưu thay đổi' : 'Giao nhiệm vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Tracker Drawer */}
      {trackingTask && (
        <div
          id="task-submissions-drawer"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setTrackingTask(null)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">
                  Tiến độ nộp bài: {trackingTask.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lớp: <strong className="text-slate-800">{data.classes.find((c) => c.id === trackingTask.classId)?.name}</strong> • Hạn: {trackingTask.dueDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTrackingTask(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of students in that class */}
            <div className="p-6 overflow-y-auto flex-1 space-y-2">
              {(() => {
                const classStudents = data.students.filter((s) => s.classId === trackingTask.classId);
                if (classStudents.length === 0) {
                  return (
                    <p className="text-center py-8 text-xs text-slate-400">
                      Lớp này chưa có danh sách học sinh.
                    </p>
                  );
                }

                return classStudents.map((st) => {
                  const isDone = trackingTask.completedStudentIds.includes(st.id);

                  return (
                    <div
                      key={st.id}
                      onClick={() => onToggleStudentTask(trackingTask.id, st.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        isDone
                          ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/60'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isDone ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-transparent'
                          }`}
                        >
                          ✓
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isDone ? 'text-emerald-950 font-bold' : 'text-slate-800'}`}>
                            {st.fullName}
                          </p>
                          <span className="text-xs text-slate-400 font-mono">Mã: {st.studentCode}</span>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isDone ? 'Đã nộp bài' : 'Chưa nộp'}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Bấm vào dòng học sinh để chuyển đổi trạng thái nộp bài tức thời.
              </span>
              <button
                type="button"
                onClick={() => setTrackingTask(null)}
                className="px-4 py-1.5 bg-white border border-slate-200 text-xs font-bold rounded-lg text-slate-700 hover:bg-slate-50 shadow-2xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
