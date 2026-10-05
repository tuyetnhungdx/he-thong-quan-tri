import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  School,
  Loader2,
} from 'lucide-react';
import { AppData, GradeEntry, StudentComment } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'grades' | 'comments';
  data: AppData;
  initialClassId?: string;
  teacherName?: string;
  onNotify?: (type: 'success' | 'warning' | 'error' | 'info', title: string, desc?: string) => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  type,
  data,
  initialClassId = 'ALL',
  teacherName = 'Cô Trần Thị Tuyết Nhung',
  onNotify,
}) => {
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [reportTitle, setReportTitle] = useState(
    type === 'grades'
      ? 'BẢNG TỔNG HỢP KẾT QUẢ ĐIỂM SỐ HỌC TẬP MÔN TIN HỌC'
      : 'PHIẾU THEO DÕI & TỔNG HỢP NHẬN XÉT ĐÁNH GIÁ HỌC SINH'
  );
  const [reportDate, setReportDate] = useState(() => {
    const d = new Date();
    return `Ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
  });
  const [includeStats, setIncludeStats] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const reportPrintRef = useRef<HTMLDivElement>(null);

  // Lọc dữ liệu theo lớp được chọn
  const filteredGrades = useMemo(() => {
    if (type !== 'grades') return [];
    return data.grades.filter((g) => {
      if (selectedClassId !== 'ALL' && g.classId !== selectedClassId) return false;
      return true;
    });
  }, [data.grades, selectedClassId, type]);

  const filteredComments = useMemo(() => {
    if (type !== 'comments') return [];
    return data.comments.filter((c) => {
      if (selectedClassId !== 'ALL' && c.classId !== selectedClassId) return false;
      return true;
    });
  }, [data.comments, selectedClassId, type]);

  // Thông tin lớp học
  const currentClassName = useMemo(() => {
    if (selectedClassId === 'ALL') return 'Tất cả các lớp phụ trách';
    const cl = data.classes.find((c) => c.id === selectedClassId);
    return cl ? `Lớp ${cl.name}` : 'Toàn trường';
  }, [data.classes, selectedClassId]);

  // Thống kê điểm số
  const gradeStats = useMemo(() => {
    if (filteredGrades.length === 0) return null;
    const scores = filteredGrades.map((g) => g.score);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = (sum / scores.length).toFixed(1);
    const high = scores.filter((s) => s >= 8.0).length;
    const mid = scores.filter((s) => s >= 6.5 && s < 8.0).length;
    const pass = scores.filter((s) => s >= 5.0 && s < 6.5).length;
    const low = scores.filter((s) => s < 5.0).length;

    return {
      count: scores.length,
      avg,
      high,
      highPct: ((high / scores.length) * 100).toFixed(0),
      mid,
      midPct: ((mid / scores.length) * 100).toFixed(0),
      pass,
      passPct: ((pass / scores.length) * 100).toFixed(0),
      low,
      lowPct: ((low / scores.length) * 100).toFixed(0),
    };
  }, [filteredGrades]);

  // Thống kê nhận xét
  const commentStats = useMemo(() => {
    if (filteredComments.length === 0) return null;
    const counts: Record<string, number> = {};
    filteredComments.forEach((c) => {
      counts[c.skillCategory] = (counts[c.skillCategory] || 0) + 1;
    });
    return {
      total: filteredComments.length,
      bySkill: counts,
    };
  }, [filteredComments]);

  if (!isOpen) return null;

  // 1. In trực tiếp / Lưu PDF qua hộp thoại in của trình duyệt (Vector siêu nét)
  const handlePrint = () => {
    window.print();
  };

  // 2. Xuất trực tiếp file .pdf tải về máy tính
  const handleDownloadPdf = async () => {
    if (!reportPrintRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = reportPrintRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Độ phân giải cao cho bản in rõ nét
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

      const fileName =
        type === 'grades'
          ? `Bao_Cao_Diem_So_${selectedClassId !== 'ALL' ? selectedClassId : 'TongHop'}.pdf`
          : `Bao_Cao_Nhan_Xet_${selectedClassId !== 'ALL' ? selectedClassId : 'TongHop'}.pdf`;

      pdf.save(fileName);

      if (onNotify) {
        onNotify('success', 'Đã xuất file PDF thành công!', `Tệp "${fileName}" đã được tải về máy của cô.`);
      }
    } catch (err: any) {
      console.error('Lỗi xuất PDF:', err);
      if (onNotify) {
        onNotify('error', 'Lỗi khi xuất PDF', err.message || 'Vui lòng dùng nút In / Lưu PDF thay thế.');
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div
      id="report-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="report-modal-card"
        className="relative w-full max-w-5xl bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-white no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                Xuất Báo Cáo Học Tập (PDF)
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {type === 'grades' ? 'Bảng Điểm Số' : 'Nhận Xét Kỹ Năng'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Định dạng chuẩn văn bản hành chính sư phạm THPT – Sẵn sàng in hoặc lưu PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs active:scale-95"
              title="Mở hộp thoại In / Lưu dạng PDF của trình duyệt"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">In / Lưu PDF (Ctrl + P)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tạo PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Tải File PDF (.pdf)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options Toolbar */}
        <div className="px-6 py-2.5 bg-slate-200/80 border-b border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Chọn lớp:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="ALL">-- Tất cả các lớp --</option>
                {data.classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Lớp {c.name} ({c.academicYear})
                  </option>
                ))}
              </select>
            </div>

            <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={includeStats}
                onChange={(e) => setIncludeStats(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Kèm bảng thống kê</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={includeSignature}
                onChange={(e) => setIncludeSignature(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Kèm phần ký duyệt</span>
            </label>
          </div>

          <div className="text-slate-500 text-[11px] italic">
            Tổng cộng: {type === 'grades' ? filteredGrades.length : filteredComments.length} mục dữ liệu
          </div>
        </div>

        {/* Modal Scrollable Canvas (Preview & Print Target) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-200/60">
          {/* Printable Document Sheet (A4 Paper Aspect) */}
          <div
            ref={reportPrintRef}
            id="printable-report-document"
            className="w-full max-w-[820px] mx-auto bg-white p-8 sm:p-10 shadow-lg text-slate-900 border border-slate-200 font-sans"
            style={{ minHeight: '1050px' }}
          >
            {/* Header: Quốc hiệu & Đơn vị trường học */}
            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-300 text-center">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wider text-slate-700">
                  SỞ GD&ĐT TỈNH QUẢNG NAM
                </p>
                <p className="text-[13px] font-black uppercase text-blue-900">
                  TRƯỜNG THPT NGUYỄN DỤC
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Tổ: Toán – Tin học</p>
                <div className="w-16 h-0.5 bg-slate-400 mx-auto mt-1" />
              </div>

              <div>
                <p className="text-[12px] font-black uppercase tracking-wider text-slate-900">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </p>
                <p className="text-[12px] font-bold text-slate-800">Độc lập – Tự do – Hạnh phúc</p>
                <div className="w-24 h-0.5 bg-slate-400 mx-auto mt-1" />
                <p className="text-[11px] italic text-slate-500 mt-1">{reportDate}</p>
              </div>
            </div>

            {/* Title Section */}
            <div className="text-center my-6">
              <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900">
                {reportTitle}
              </h1>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs font-semibold text-slate-700">
                <span>Đối tượng: <b className="text-blue-900">{currentClassName}</b></span>
                <span>•</span>
                <span>Môn học: <b className="text-blue-900">Tin học THPT</b></span>
                <span>•</span>
                <span>Năm học: <b>2025 - 2026</b></span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Giáo viên phụ trách: <b className="text-slate-900">{teacherName}</b>
              </p>
            </div>

            {/* DATA TABLE SECTION: GRADES */}
            {type === 'grades' && (
              <div className="space-y-4">
                {filteredGrades.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl">
                    Chưa có dữ liệu điểm số nào cho lớp này.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                        <th className="p-2 border border-slate-300 text-center w-10">STT</th>
                        <th className="p-2 border border-slate-300 w-20 text-center">Mã HS</th>
                        <th className="p-2 border border-slate-300">Họ và tên học sinh</th>
                        <th className="p-2 border border-slate-300 text-center w-16">Lớp</th>
                        <th className="p-2 border border-slate-300">Hoạt động / Bài kiểm tra</th>
                        <th className="p-2 border border-slate-300 text-center w-16">Điểm</th>
                        <th className="p-2 border border-slate-300 text-center w-20">Xếp loại</th>
                        <th className="p-2 border border-slate-300">Lời phê / Nhận xét</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGrades.map((g, idx) => {
                        const student = data.students.find((s) => s.id === g.studentId);
                        const cl = data.classes.find((c) => c.id === g.classId);
                        const scoreNum = Number(g.score);
                        const level =
                          scoreNum >= 8.0
                            ? 'Giỏi'
                            : scoreNum >= 6.5
                            ? 'Khá'
                            : scoreNum >= 5.0
                            ? 'Đạt'
                            : 'Chưa đạt';

                        return (
                          <tr key={g.id} className="border-b border-slate-300 hover:bg-slate-50/50">
                            <td className="p-2 border border-slate-300 text-center text-slate-500 font-medium">
                              {idx + 1}
                            </td>
                            <td className="p-2 border border-slate-300 font-mono text-center text-slate-700">
                              {student?.studentCode || 'HS'}
                            </td>
                            <td className="p-2 border border-slate-300 font-bold text-slate-900">
                              {student?.fullName || 'Học sinh'}
                            </td>
                            <td className="p-2 border border-slate-300 text-center text-slate-700">
                              {cl?.name || '10'}
                            </td>
                            <td className="p-2 border border-slate-300 text-slate-800">
                              {g.activityTitle}
                            </td>
                            <td className="p-2 border border-slate-300 text-center font-black text-blue-900 text-sm">
                              {g.score.toFixed ? g.score.toFixed(1) : g.score}
                            </td>
                            <td className="p-2 border border-slate-300 text-center">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                                  scoreNum >= 8.0
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : scoreNum >= 6.5
                                    ? 'bg-blue-100 text-blue-800'
                                    : scoreNum >= 5.0
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {level}
                              </span>
                            </td>
                            <td className="p-2 border border-slate-300 text-slate-600 italic">
                              {g.note || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {/* Grade Statistics Summary Box */}
                {includeStats && gradeStats && (
                  <div className="mt-6 p-4 rounded-xl border border-slate-300 bg-slate-50 text-xs">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Tổng hợp đánh giá chất lượng học tập
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-500 block text-[11px]">Tổng số bài chấm</span>
                        <b className="text-base text-slate-900">{gradeStats.count}</b>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-500 block text-[11px]">Điểm trung bình</span>
                        <b className="text-base text-blue-700">{gradeStats.avg}/10</b>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-emerald-700 block text-[11px]">Mức Giỏi (≥ 8.0)</span>
                        <b className="text-base text-emerald-800">
                          {gradeStats.high} ({gradeStats.highPct}%)
                        </b>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-blue-700 block text-[11px]">Mức Khá (6.5 - 7.9)</span>
                        <b className="text-base text-blue-800">
                          {gradeStats.mid} ({gradeStats.midPct}%)
                        </b>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-rose-700 block text-[11px]">Dưới TB (&lt; 5.0)</span>
                        <b className="text-base text-rose-800">
                          {gradeStats.low} ({gradeStats.lowPct}%)
                        </b>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DATA TABLE SECTION: COMMENTS */}
            {type === 'comments' && (
              <div className="space-y-4">
                {filteredComments.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl">
                    Chưa có dữ liệu nhận xét nào cho lớp này.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                        <th className="p-2 border border-slate-300 text-center w-10">STT</th>
                        <th className="p-2 border border-slate-300 w-20 text-center">Mã HS</th>
                        <th className="p-2 border border-slate-300 w-36">Họ và tên học sinh</th>
                        <th className="p-2 border border-slate-300 text-center w-16">Lớp</th>
                        <th className="p-2 border border-slate-300 text-center w-24">Ngày ghi</th>
                        <th className="p-2 border border-slate-300 w-36">Kỹ năng / Lĩnh vực</th>
                        <th className="p-2 border border-slate-300">Nội dung nhận xét đánh giá</th>
                        <th className="p-2 border border-slate-300 w-28">Ghi chú thêm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComments.map((cm, idx) => {
                        const student = data.students.find((s) => s.id === cm.studentId);
                        const cl = data.classes.find((c) => c.id === cm.classId);

                        return (
                          <tr key={cm.id} className="border-b border-slate-300 hover:bg-slate-50/50">
                            <td className="p-2 border border-slate-300 text-center text-slate-500 font-medium">
                              {idx + 1}
                            </td>
                            <td className="p-2 border border-slate-300 font-mono text-center text-slate-700">
                              {student?.studentCode || 'HS'}
                            </td>
                            <td className="p-2 border border-slate-300 font-bold text-slate-900">
                              {student?.fullName || 'Học sinh'}
                            </td>
                            <td className="p-2 border border-slate-300 text-center text-slate-700">
                              {cl?.name || '10'}
                            </td>
                            <td className="p-2 border border-slate-300 text-center text-slate-600 font-mono text-[11px]">
                              {cm.date}
                            </td>
                            <td className="p-2 border border-slate-300 font-semibold text-blue-900">
                              {cm.skillCategory}
                            </td>
                            <td className="p-2 border border-slate-300 text-slate-800 leading-relaxed">
                              {cm.content}
                            </td>
                            <td className="p-2 border border-slate-300 text-slate-500 italic text-[11px]">
                              {cm.note || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {/* Comment Stats Summary Box */}
                {includeStats && commentStats && (
                  <div className="mt-6 p-4 rounded-xl border border-slate-300 bg-slate-50 text-xs">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Phân bổ kỹ năng được nhận xét & đánh giá
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-800">
                      {Object.entries(commentStats.bySkill).map(([skill, num]) => (
                        <div key={skill} className="p-2 bg-white rounded border border-slate-200">
                          <span className="text-[11px] text-slate-500 block truncate">{skill}</span>
                          <b className="text-sm text-blue-900">{num} lượt</b>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Signature Block */}
            {includeSignature && (
              <div className="mt-12 pt-4 grid grid-cols-2 text-center text-xs">
                <div>
                  <p className="font-bold uppercase text-slate-800">HIỆU TRƯỞNG / TỔ TRƯỞNG DUYỆT</p>
                  <p className="text-[11px] italic text-slate-500 mt-1">(Ký và ghi rõ họ tên)</p>
                  <div className="h-20" />
                  <p className="font-semibold text-slate-600">....................................................</p>
                </div>

                <div>
                  <p className="font-bold uppercase text-slate-800">GIÁO VIÊN BỘ MÔN</p>
                  <p className="text-[11px] italic text-slate-500 mt-1">(Ký và ghi rõ họ tên)</p>
                  <div className="h-20" />
                  <p className="font-black text-slate-900 text-sm">{teacherName}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500 no-print">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>File PDF được tạo với độ phân giải cao, phù hợp đóng tập hồ sơ và nộp báo cáo.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
