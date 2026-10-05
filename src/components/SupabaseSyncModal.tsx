import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Copy,
  Check,
  ExternalLink,
  Code2,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { AppData } from '../types';
import {
  SupabaseStatus,
  SUPABASE_INIT_SQL,
  checkSupabaseHealth,
  pushAppDataToSupabase,
  fetchAppDataFromSupabase,
} from '../services/supabaseService';
import { SUPABASE_URL } from '../services/supabaseClient';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: SupabaseStatus;
  data: AppData;
  onRefreshStatus: () => Promise<any>;
  onUpdateData: (newData: AppData) => void;
  onNotify: (type: 'success' | 'warning' | 'error' | 'info', title: string, desc?: string) => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  status,
  data,
  onRefreshStatus,
  onUpdateData,
  onNotify,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlCode, setShowSqlCode] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_INIT_SQL);
      setCopiedSql(true);
      onNotify('success', 'Đã sao chép mã SQL', 'Dán mã này vào SQL Editor trên trang quản trị Supabase để tạo bảng.');
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      onNotify('error', 'Không thể sao chép tự động', 'Vui lòng chọn đoạn mã và sao chép thủ công.');
    }
  };

  const handlePushData = async () => {
    setIsSyncing(true);
    try {
      const res = await pushAppDataToSupabase(data);
      if (res.success) {
        onNotify(
          'success',
          'Đồng bộ lên Supabase thành công!',
          `Đã tải lên ${data.classes.length} lớp, ${data.students.length} học sinh, ${data.lessons.length} bài học lên cơ sở dữ liệu Supabase.`
        );
        await onRefreshStatus();
      } else {
        onNotify('error', 'Chưa thể đẩy dữ liệu', res.error || 'Vui lòng kiểm tra xem đã tạo bảng trên Supabase chưa.');
      }
    } catch (err: any) {
      onNotify('error', 'Lỗi đồng bộ', err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullData = async () => {
    setIsSyncing(true);
    try {
      const res = await fetchAppDataFromSupabase();
      if (res.error) {
        onNotify('error', 'Chưa thể tải dữ liệu từ Supabase', res.error);
      } else if (res.data) {
        const merged: AppData = {
          classes: res.data.classes && res.data.classes.length > 0 ? res.data.classes : data.classes,
          students: res.data.students && res.data.students.length > 0 ? res.data.students : data.students,
          lessons: res.data.lessons && res.data.lessons.length > 0 ? res.data.lessons : data.lessons,
          tasks: res.data.tasks && res.data.tasks.length > 0 ? res.data.tasks : data.tasks,
          grades: res.data.grades && res.data.grades.length > 0 ? res.data.grades : data.grades,
          comments: res.data.comments && res.data.comments.length > 0 ? res.data.comments : data.comments,
          activityLogs: res.data.activityLogs && res.data.activityLogs.length > 0 ? res.data.activityLogs : data.activityLogs,
          soundEnabled: data.soundEnabled,
        };
        onUpdateData(merged);
        onNotify(
          'success',
          'Đã tải dữ liệu từ Supabase về ứng dụng!',
          `Đã cập nhật ${merged.students.length} học sinh, ${merged.classes.length} lớp học.`
        );
        await onRefreshStatus();
      }
    } catch (err: any) {
      onNotify('error', 'Lỗi tải dữ liệu', err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      id="supabase-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="supabase-modal-card"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                Kết nối & Đồng bộ Supabase
                {status.isConnected && status.tablesExist ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
                  </span>
                ) : status.isConnected ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3.5 h-3.5" /> Đã nối - Cần tạo bảng
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-full">
                    Chưa kết nối
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-md">
                Dự án: <span className="font-mono text-emerald-800 font-medium">{SUPABASE_URL}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Connection Status Card */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              status.isConnected && status.tablesExist
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : status.isConnected
                ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                : 'bg-rose-50/70 border-rose-200 text-rose-950'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                {status.isConnected && status.tablesExist ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cơ sở dữ liệu Supabase đã sẵn sàng đồng bộ 100%!</span>
                  </>
                ) : status.isConnected ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Đã kết nối với Supabase, nhưng chưa tìm thấy các bảng dữ liệu!</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Lỗi kết nối tới Supabase: {status.errorMessage || 'Không thể liên lạc'}</span>
                  </>
                )}
              </div>
              <p className="text-xs opacity-90 leading-relaxed">
                {status.isConnected && status.tablesExist
                  ? 'Mọi thay đổi có thể lưu trực tiếp lên máy chủ đám mây Supabase để dùng trên nhiều máy tính/điện thoại.'
                  : status.isConnected
                  ? 'Supabase của cô Nhung là một dự án mới tinh. Hãy làm theo 3 bước bên dưới để tạo 7 bảng dữ liệu nhé.'
                  : 'Kiểm tra lại kết nối mạng hoặc khoá API anon của dự án.'}
              </p>
              {status.lastChecked && (
                <p className="text-[11px] opacity-75 font-mono">Kiểm tra lần cuối: {status.lastChecked}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onRefreshStatus()}
              disabled={isSyncing}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white shadow-2xs border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all shrink-0 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Kiểm tra lại</span>
            </button>
          </div>

          {/* If tables are missing, show Step-by-Step guide to run SQL */}
          {(!status.tablesExist || showSqlCode) && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Hướng dẫn tạo bảng trên Supabase (Chỉ cần 1 phút)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Đã sao chép!' : 'Sao chép mã SQL'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200/90 rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center mb-1 text-[11px]">
                    1
                  </div>
                  <p className="font-semibold text-slate-800">Mở SQL Editor</p>
                  <p className="text-slate-500 mt-1">
                    Vào trang quản trị Supabase $\rightarrow$ chọn mục <b>SQL Editor</b> ở thanh bên trái.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200/90 rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center mb-1 text-[11px]">
                    2
                  </div>
                  <p className="font-semibold text-slate-800">Dán mã SQL & Chạy</p>
                  <p className="text-slate-500 mt-1">
                    Bấm <b>Sao chép mã SQL</b> ở trên, dán vào ô soạn thảo rồi bấm nút <b>Run</b> (màu xanh lá).
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200/90 rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center mb-1 text-[11px]">
                    3
                  </div>
                  <p className="font-semibold text-slate-800">Hoàn tất</p>
                  <p className="text-slate-500 mt-1">
                    Quay lại ứng dụng bấm nút <b>"Kiểm tra lại"</b> để bắt đầu đồng bộ tự động!
                  </p>
                </div>
              </div>

              {/* View/Hide SQL code toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowSqlCode(!showSqlCode)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{showSqlCode ? 'Ẩn đoạn mã SQL chi tiết' : 'Xem trước đoạn mã SQL khởi tạo'}</span>
                </button>

                {showSqlCode && (
                  <div className="mt-2.5 relative">
                    <pre className="p-3 bg-slate-900 text-emerald-400 text-[11px] font-mono rounded-lg overflow-x-auto max-h-48 leading-relaxed">
                      {SUPABASE_INIT_SQL}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sync Actions Card */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Thao tác Đồng bộ Dữ liệu
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Push Action */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex flex-col justify-between gap-3 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <UploadCloud className="w-4 h-4 text-blue-600" />
                    <span>Đẩy dữ liệu lên Supabase</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Tải toàn bộ {data.classes.length} lớp, {data.students.length} học sinh, {data.lessons.length} bài
                    học hiện có trong máy cô lên Supabase.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePushData}
                  disabled={isSyncing}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isSyncing ? 'Đang đồng bộ...' : 'Đẩy dữ liệu lên Cloud'}</span>
                </button>
              </div>

              {/* Pull Action */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex flex-col justify-between gap-3 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <DownloadCloud className="w-4 h-4 text-emerald-600" />
                    <span>Tải dữ liệu từ Supabase về</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Kéo dữ liệu mới nhất được lưu trên đám mây Supabase về ứng dụng trên trình duyệt hiện tại.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePullData}
                  disabled={isSyncing}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>{isSyncing ? 'Đang tải...' : 'Tải dữ liệu về'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Dữ liệu vẫn luôn được sao lưu an toàn tại máy của cô.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
