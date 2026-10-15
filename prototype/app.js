/* CareFlow — Patient Journey & Clinic Care App
   Calm Clinical iOS Mobile Prototype (v2)
   Source of Truth: AI Agent Mobile Build Specification (MVP: 14 Screens) + v2 Patches
*/

(function CareFlowApp() {
  "use strict";

  const M = window.CareFlowModel;
  const VI = window.CareFlowCopy;
  if (!VI || !VI.screens) throw new Error("Thiếu strings.vi.js");
  const tx = (screen, key) => VI.screens[screen]?.[key] ?? key;
  const sc = (status) => VI.statuses[status] || [status, ""];
  if (!M) throw new Error("Thiếu model.js");

  // System Configuration (v2 Section 1.9 & 1.10)
  const config = {
    APP_NAME: "CareFlow",
    EMERGENCY_NUMBER: "115", // [MEDICAL REVIEW REQUIRED]
    CLINIC_HOTLINE: "1900 6868",
    DEMO_CONTROLS: true
  };

  // State Transition Matrix (v2 Section 2.1)
  const ALLOWED_TRANSITIONS = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["reminder", "online-waiting", "cancelled"],
    reminder: ["arrived", "no-show", "cancelled"],
    arrived: ["waiting"],
    waiting: ["delayed", "results-pending", "reviewed"],
    delayed: ["waiting", "cancelled"],
    "online-waiting": ["waiting", "connection-failed"],
    "connection-failed": ["online-waiting", "cancelled"],
    "results-pending": ["results-ready"],
    "results-ready": ["reviewed"],
    "no-show": [],
    cancelled: [],
    reviewed: []
  };

  function canTransition(from, to) {
    return (ALLOWED_TRANSITIONS[from] || []).includes(to);
  }

  // Unified DateTime Formatter (v2 Section 1.8: "09:30 · Thứ bảy, 20/06")
  function formatAppointmentDateTime(startsAt) {
    const dateText = startsAt || state.selectedDate;
    const d = new Date(dateText && dateText.includes("T") ? dateText : dateText + "T12:00:00+07:00");
    if (Number.isNaN(d.getTime())) return "[Giờ khám] · [Ngày khám]";
    const formatted = new Intl.DateTimeFormat("vi-VN",{weekday:"long",day:"2-digit",month:"2-digit",timeZone:"Asia/Ho_Chi_Minh"}).format(d);
    const time = startsAt && startsAt.includes("T") ? new Intl.DateTimeFormat("vi-VN",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"Asia/Ho_Chi_Minh"}).format(d) : (state.selectedSlot || m.slot || "09:30");
    return time + " · " + formatted.charAt(0).toUpperCase()+formatted.slice(1);
  }

  // Core State Machine
  let m = M.initial();

  // App UI & Mock Data State
  let state = {
    currentScreen: "A1",
    scenario: "self",
    notice: "",
    noticeType: "info",
    isOffline: false,
    largeText: false,
    isSubmitting: false,

    // Auth & Profile
    phone: "0900000000",
    otp: "123456",
    otpCountdown: 45,
    termsAccepted: true,
    fullName: "Nguyễn Minh Anh",
    dob: "1994-08-15",
    gender: "female",

    // Active Patient Context
    activePatientId: "patient-self",
    patients: [
      { id: "patient-self", fullName: "Nguyễn Minh Anh — Tôi (hồ sơ mẫu)", relation: "Tôi (hồ sơ mẫu)", role: "Chủ tài khoản", avatar: "MA", canBook: true, canViewResults: true },
      { id: "patient-relative", fullName: "Trần Thị Mai — Mẹ (hồ sơ mẫu)", relation: "Mẹ (hồ sơ mẫu)", role: "Hồ sơ người thân", avatar: "TM", canBook: true, canViewResults: false },
      { id: "patient-father", fullName: "Nguyễn Văn Minh — Bố (hồ sơ mẫu)", relation: "Bố (hồ sơ mẫu)", role: "Hồ sơ người thân", avatar: "VM", canBook: true, canViewResults: false }
    ],

    // Booking Draft
    reasonCategory: "Khám tổng quát",
    reasonNote: "",
    voiceRecording: false,
    screeningChoice: "",
    selectedMode: "in-person", // in-person | online
    selectedProvider: "auto",
    selectedDate: "2026-10-20",
    selectedSlot: "09:00",
    bookingConsent: true,
    bookingOutcome: "success", // success | slot_unavailable | network_unknown
    lastBookingCode: "CF-240620-0930",
    safetyAckChecked: false,

    // Current Appointment Object (v2 Section 1.8)
    currentAppointment: {
      id: "DEMO-001",
      patientId: "patient-self",
      startsAt: "2026-10-20T09:30:00+07:00",
      statusUpdatedAt: "2026-10-20T09:02:00+07:00",
      mode: "in-person",
      facilityName: "Phòng khám CareFlow (123 Nguyễn Trãi, Q.1)",
      providerName: "BS. CKII Nguyễn Văn An",
      reason: "Khám tổng quát",
      status: "confirmed", // 12 spec statuses
      owner: "patient",
      estimatedFee: "Từ 300.000đ",
      queueNumber: "A012",
      estimatedWait: "15 phút",
      safetyAcknowledged: false,
      timeline: [
        { id: "tl-1", label: "Đã gửi yêu cầu", at: "2026-10-20T08:45:00+07:00", state: "done" },
        { id: "tl-2", label: "Lịch đã được xác nhận", at: "2026-10-20T09:02:00+07:00", state: "done" },
        { id: "tl-3", label: "Sắp đến giờ khám / Tiếp đón", at: "2026-10-20T09:15:00+07:00", state: "current" },
        { id: "tl-4", label: "Gặp bác sĩ khám", state: "upcoming" },
        { id: "tl-5", label: "Kết quả và hướng dẫn sau khám", state: "upcoming" }
      ]
    },

    currentAppointmentStatus: "confirmed",
    appointmentTab:0,
    lastAppointmentCancelled: false,
    cancelReason: "Tôi bận vào thời gian này",
    cancelNote: "",
    rescheduleSlot: "14:30",

    // Aftercare & Results
    resultsDoctorReviewed: true,
    activeResultTab: "conclusion", // conclusion | meds | labs | next-steps

    // Telehealth & Encounter
    videoMic: true,
    videoCamera: true,
    queueNumber: "A012",
    consultationRoom: "Phòng 302",

    // Modal dialogs
    activeModal: null, // emergency | continue-confirm | feature-soon | demo-controls | tos
    featureSoonTitle: "Tính năng này sẽ sớm có",
    lastHelpFrom: "B1",

    // Notifications
    notifications: [
      { id: "n1", title: "Lịch khám đã được xác nhận", body: "Lịch khám 09:30 · Thứ bảy, 20/06 đã được phòng khám xác nhận.", time: "10 phút trước", isRead: false, link: "D2" },
      { id: "n2", title: "Có cập nhật mới về lượt khám", body: "Bác sĩ đã xem và cập nhật kết quả cho lượt khám gần nhất.", time: "2 giờ trước", isRead: false, link: "F2" },
      { id: "n3", title: "Nhắc nhở lịch khám ngày mai", body: "Bạn có lịch hẹn vào 09:30 ngày mai. Vui lòng đến trước 15 phút.", time: "1 ngày trước", isRead: true, link: "D2" },
      { id: "n4", title: "Cập nhật hồ sơ thành công", body: "Hồ sơ cá nhân và người thân đã được đồng bộ an toàn.", time: "3 ngày trước", isRead: true, link: "G1" }
    ]
  };

  // Triple-tap counter for Demo Controls on B1
  let titleTapCount = 0;
  let titleTapTimer = null;

  // Mock analytics logger (No sensitive data)
  function logAnalytics(eventName, meta = {}) {
    console.log(`[Analytics Event] ${eventName}`, meta);
  }

  // DOM Helper
  const $ = (id) => document.getElementById(id);
  function esc(x) {
    return String(x == null ? "" : x)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // Patient names
  function personName() {
    return m.person === "self" ? "Nguyễn Minh Anh — Tôi (hồ sơ mẫu)" : "Trần Thị Mai — Mẹ (hồ sơ mẫu)";
  }
  function personShort() {
    return m.person === "self" ? "Tôi (hồ sơ mẫu)" : "Mẹ (hồ sơ mẫu)";
  }

  function getActivePatient() {
    if (m.person === "relative") {
      return state.patients[1];
    }
    return state.patients[0];
  }

  // Icon SVG Library (Stroke 2px, pure outline, no emojis)
  function icon(name, size = 20, cls = "") {
    const s = size;
    const common = `width="${s}" height="${s}" class="cf-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
    switch (name) {
      case "house":
      case "home":
        return `<svg ${common}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
      case "calendar":
        return `<svg ${common}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
      case "person":
      case "user":
        return `<svg ${common}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
      case "phone":
        return `<svg ${common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
      case "bell":
        return `<svg ${common}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;
      case "chevron-right":
        return `<svg ${common}><polyline points="9 18 15 12 9 6"></polyline></svg>`;
      case "chevron-left":
        return `<svg ${common}><polyline points="15 18 9 12 15 6"></polyline></svg>`;
      case "check":
        return `<svg ${common}><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      case "check-circle":
        return `<svg ${common}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
      case "clock":
        return `<svg ${common}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
      case "location":
      case "map-pin":
        return `<svg ${common}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
      case "video":
        return `<svg ${common}><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`;
      case "camera":
        return `<svg ${common}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`;
      case "microphone":
      case "mic":
        return `<svg ${common}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
      case "warning":
      case "alert-triangle":
        return `<svg ${common}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      case "info":
        return `<svg ${common}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
      case "cross":
      case "x-circle":
        return `<svg ${common}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
      case "arrow-clockwise":
      case "refresh":
        return `<svg ${common}><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`;
      case "document":
      case "file-text":
        return `<svg ${common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
      case "document-check":
        return `<svg ${common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15l2 2 4-4"></path></svg>`;
      case "pill":
        return `<svg ${common}><path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"></line></svg>`;
      case "shield":
        return `<svg ${common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
      case "copy":
        return `<svg ${common}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      case "lock":
        return `<svg ${common}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
      case "heart-pulse":
        return `<svg ${common}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
      case "loader":
        return `<svg ${common}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`;
      default:
        return `<svg ${common}><circle cx="12" cy="12" r="10"></circle></svg>`;
    }
  }

  // Status Chip Component (Icon + Label + Semantic Class)
  function statusChip(statusKey) {
    const map = {
      pending: { label: "Chờ xác nhận", icon: "clock", type: "warning" },
      confirmed: { label: "Đã xác nhận", icon: "check-circle", type: "success" },
      reminder: { label: "Sắp đến giờ khám", icon: "clock", type: "warning" },
      arrived: { label: "Đã đến phòng khám", icon: "location", type: "info" },
      waiting: { label: "Đang chờ khám", icon: "loader", type: "info" },
      "online-waiting": { label: "Chờ kết nối", icon: "video", type: "info" },
      delayed: { label: "Phòng khám đang trễ", icon: "clock", type: "warning" },
      "results-pending": { label: "Đang xử lý kết quả", icon: "loader", type: "info" },
      "results-ready": { label: "Kết quả đã sẵn sàng", icon: "document-check", type: "success" },
      reviewed: { label: "Bác sĩ đã xem", icon: "check-circle", type: "success" },
      cancelled: { label: "Đã hủy", icon: "cross", type: "neutral" },
      "no-show": { label: "Chưa ghi nhận đến", icon: "warning", type: "warning" },
      "connection-failed": { label: "Chưa kết nối được", icon: "warning", type: "danger" }
    };
    const s = map[statusKey] || { label: statusKey, icon: "info", type: "neutral" };
    return `<span class="chip ${s.type}">${icon(s.icon, 14)}<span>${esc(s.label)}</span></span>`;
  }

  // Profile Context Bar Component
  function profileContextBar() {
    return `
      <div class="context-bar">
        <div class="context-bar-left">
          <div class="context-bar-avatar">${m.person === "self" ? "MA" : "TM"}</div>
          <span>Đang đặt cho: <strong>${esc(personShort())}</strong></span>
        </div>
        <button class="context-bar-btn" type="button" data-action="goC1">Đổi</button>
      </div>
    `;
  }

  // 14 Core Screen Descriptions for Inspector
  const screenMeta = {
    A1: { title: "Chào mừng & Đăng nhập", goal: "Đăng nhập an toàn bằng số điện thoại với ít ma sát.", risk: "Kiểm tra định dạng SĐT, không lộ dữ liệu trước OTP." },
    A2: { title: "Tạo hồ sơ lần đầu", goal: "Tạo hồ sơ tối thiểu: họ tên, ngày sinh, giới tính.", risk: "Chỉ yêu cầu thông tin bắt buộc, không gộp nhầm hồ sơ." },
    B1: { title: "Trang chủ", goal: "Lịch gần nhất, người bệnh đang xem, và hành động tiếp theo trong 3 giây.", risk: "Tối đa 3 khối thông tin, không dùng thuật ngữ nội bộ." },
    C1: { title: "Ai đi khám", goal: "Chọn đúng hồ sơ trước khi vào luồng đặt lịch.", risk: "Tách quyền đặt hộ với quyền xem kết quả y tế." },
    C2: { title: "Lý do khám & Sàng lọc", goal: "Nhập lý do khám và phát hiện dấu hiệu nguy hiểm.", risk: "Intake không phải chẩn đoán; Có nguy hiểm bắt buộc qua C3." },
    C3: { title: "Cảnh báo nguy hiểm", goal: "Cảnh báo an toàn, cung cấp đường dây khẩn cấp 115 và hotline.", risk: "Không cho phép một chạm bỏ qua cảnh báo; cần xác nhận rõ." },
    C4: { title: "Chọn ngày giờ & Hình thức", goal: "Chọn khám trực tiếp/từ xa, bác sĩ và slot thời gian.", risk: "Slot phải kiểm tra server; có phương án thay thế khi hết giờ." },
    C5: { title: "Xác nhận đặt lịch", goal: "Kiểm tra 5 dòng thông tin, chi phí dự kiến và đồng ý điều khoản.", risk: "Không gọi pending là confirmed; không tạo trùng khi mạng đơ." },
    C6: { title: "Đặt lịch xong", goal: "Hiển thị mã lịch, hướng dẫn chuẩn bị và CTA tiếp theo rõ ràng.", risk: "Chỉ hiển thị confirmed khi có record thành công trên server." },
    D1: { title: "Danh sách lịch hẹn", goal: "Quản lý lịch sắp tới, đã khám và đã hủy theo từng hồ sơ.", risk: "Phân tách rõ trạng thái lịch, hỗ trợ lọc theo bệnh nhân." },
    D2: { title: "Chi tiết lịch hẹn", goal: "Trạng thái hiện tại, ai đang giữ việc, CTA động và timeline 5 bước.", risk: "Mọi trạng thái đều có next CTA và số hotline phòng khám." },
    D3: { title: "Hủy hoặc đổi lịch", goal: "Đổi ngày giờ mới hoặc hủy lịch kèm ghi nhận lý do rõ ràng.", risk: "Cảnh báo chính sách trước khi hủy, có nút Giữ lịch an toàn." },
    F2: { title: "Kết luận, đơn thuốc & kết quả", goal: "Hiển thị tóm tắt của bác sĩ, đơn thuốc và cận lâm sàng.", risk: "Bảo vệ riêng tư: người đặt hộ không được tự xem nếu chưa ủy quyền." },
    G2: { title: "Thông báo", goal: "Thông báo lịch khám, kết quả và việc cần làm kèm deep-link.", risk: "Tuyệt đối không để lộ dữ liệu chẩn đoán nhạy cảm ở bản xem trước." }
  };


  let extra = {byPatient:{},contactTab:0,supportMessage:"",callbackNote:"",severity:"Nhẹ",fontSize:0,faqSearch:"",settings:[true,true,true,true,true]};

  function renderSoft(id){
  const currentPatient=()=>m.person==="self"?"patient-self":"patient-relative";
  const patientData=()=>{const p=currentPatient();return extra.byPatient[p]||(extra.byPatient[p]={messages:[],symptom:"",lab:"ordered",labAppointment:false,paymentMethod:"qr",paymentStatus:"unpaid",paymentDue:"",receipt:false});};
  const info=(message)=>`<p class="field-hint" data-copy-help>${esc(message)}</p>`;
  const headline=(title,subtitle="")=>`<div class="mini-step">${id} · CAREFLOW</div><h2>${esc(title)}</h2>${subtitle?`<p class="lead">${esc(subtitle)}</p>`:""}`;
  const action=(label,event,klass="btn-secondary")=>`<button type="button" class="${klass}" data-action="${event}">${esc(label)}</button>`;
  const sim=()=>`<p class="field-hint">Dữ liệu mẫu để xem thử giao diện. Không gửi đến phòng khám.</p>`;
  const step=(text,type)=>`<div class="timeline-step ${type||""}"><div class="timeline-dot"></div><div>${esc(text)}</div></div>`;
  const p=patientData();
  const v=VI.screens[id]||{};
  switch(id){
      case "E1": return renderSoft("E1");
      case "E2": return renderSoft("E2");
      case "E3": return renderSoft("E3");
      case "E4": return renderSoft("E4");
      case "F1": return renderSoft("F1");
      case "F3": return renderSoft("F3");
      case "F4": return renderSoft("F4");
      case "G1": return renderSoft("G1");
      case "G3": return renderSoft("G3");

    case "H1":return `${headline(v.title)}<div class="box hero"><h3>${esc(v.hero)}</h3><p>${esc(v.hours)}</p>
       ${action(v.call,"callClinicHotline","btn-primary")}</div>
      <div class="btn-row">${action(v.message,"goF4")}${action(v.callback,"goF4")}</div>
      <div class="box warning"><strong>${esc(v.emergency)}</strong>${action("Gọi 115 (mô phỏng)","callEmergency","btn-danger")}</div>
      <div class="box"><label for="faq-search" class="field-label">${esc(v.search)}</label>
      <input type="search" id="faq-search" data-field="faqSearch" value="${esc(extra.faqSearch)}" placeholder="Tìm câu hỏi">
      ${["Làm sao đổi hoặc hủy lịch?","Làm sao biết đến lượt khám?","Làm sao xem kết quả?"].filter(x=>x.toLowerCase().includes(extra.faqSearch.toLowerCase())).map((x,i)=>`<button type="button" class="choice" data-action="faq" data-value="${esc(x)}">${esc(x)} ${icon("chevron-right",16)}</button>`).join("")}
      ${extra.faqSearch&&!["Làm sao đổi hoặc hủy lịch?","Làm sao biết đến lượt khám?","Làm sao xem kết quả?"].some(x=>x.toLowerCase().includes(extra.faqSearch.toLowerCase()))?`<p>${esc(v.empty)}</p>`:""}
      </div>${sim()}`;
    default:return null;
  }
}

  // Render Functions for Each Screen
  function renderScreen(id) {
    switch (id) {
      // =========================================================================
      // A1 — Chào mừng và đăng nhập (/auth)
      // =========================================================================
      case "A1":
        return `
          <div style="text-align: center; padding: 18px 0 20px;">
            <div class="brandmark" style="margin: 0 auto 14px; width: 54px; height: 54px; font-size: 20px;">CF</div>
            <h2>${esc(tx("A1","title"))}</h2>
            <p class="lead" style="margin-bottom: 0;">${esc(tx("A1","description"))}</p>
          </div>

          <div class="box">
            <label class="field-label" for="phone-input">Số điện thoại <span class="required">*</span></label>
            <input id="phone-input" type="tel" autocomplete="tel" data-field="phone" value="${esc(state.phone)}" placeholder="${esc(tx("A1","phoneHint"))}" />
            <p class="field-hint">Đây là bản xem thử; không gửi SMS thật.</p>

            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px;">
              <label class="field-label" for="otp-input" style="margin: 0;">${esc(tx("A1","otp"))} <span class="required">*</span></label>
              <button type="button" class="context-bar-btn" style="padding: 2px 8px; font-size: 12px;" data-action="resendOtp">
                ${esc(tx("A1","resend"))}
              </button>
            </div>
            <div class="otp-panel"><input id="otp-input" class="otp-overlay" aria-label="Nhập mã OTP gồm 6 số" inputmode="numeric" type="text" maxlength="6" autocomplete="one-time-code" data-field="otp" value="${esc(state.otp)}" /><div class="otp-boxes" aria-hidden="true">${Array.from({length:6},(_,i)=>`<span class="otp-digit-box" data-otp-slot="${i}">${esc(state.otp[i]||"·")}</span>`).join("")}</div></div>
            <p class="field-hint">Bản demo: dùng mã <strong>123456</strong>, không gửi SMS thật.</p>

            <div style="margin-top: 16px; display: flex; align-items: flex-start; gap: 8px;">
              <input type="checkbox" id="terms-agree" ${state.termsAccepted ? "checked" : ""} data-action="toggleTerms" style="width: 18px; height: 18px; margin-top: 2px;" />
              <label for="terms-agree" style="font-size: 13px; color: var(--color-text-700); line-height: 1.45;">
                Tôi đồng ý với Điều khoản sử dụng và Chính sách riêng tư của CareFlow.
              </label>
            </div>
          </div>

          <button type="button" class="btn-primary" data-action="login" ${state.isSubmitting ? "disabled" : ""}>
            <span>${state.isSubmitting ? "Đang xác thực..." : "Tiếp tục"}</span> ${icon("chevron-right", 18)}
          </button>
          <button type="button" class="btn-secondary" data-action="goA2">Tạo hồ sơ mới</button>
          
          <div style="text-align: center; margin-top: 14px;">
            <button type="button" class="btn-tertiary btn-sm" style="border: 0;" data-action="openHelp">
              ${icon("phone", 16)} ${esc(tx("A1","help"))}
            </button>
          </div>
        `;

      // =========================================================================
      // A2 — Tạo hồ sơ lần đầu (/auth/create-profile)
      // =========================================================================
      case "A2":
        return `
          <div class="mini-step">A2 · HỒ SƠ</div>
          <h2>${esc(tx("A2","title"))}</h2>
          <p class="lead">${esc(tx("A2","description"))}</p>

          <div class="box">
            <label class="field-label" for="profile-name">Họ và tên <span class="required">*</span></label>
            <input id="profile-name" type="text" data-field="fullName" value="${esc(state.fullName)}" placeholder="Ví dụ: Nguyễn Minh Anh" />

            <label class="field-label" for="profile-dob">Ngày sinh <span class="required">*</span></label>
            <input id="profile-dob" type="date" data-field="dob" value="${esc(state.dob)}" />

            <label class="field-label">Giới tính</label>
            <div class="segmented-control" style="margin: 6px 0 4px;">
              <button type="button" class="segmented-btn ${state.gender === "female" ? "active" : ""}" data-action="chooseGender" data-value="female">Nữ</button>
              <button type="button" class="segmented-btn ${state.gender === "male" ? "active" : ""}" data-action="chooseGender" data-value="male">Nam</button>
              <button type="button" class="segmented-btn ${state.gender === "other" ? "active" : ""}" data-action="chooseGender" data-value="other">Khác</button>
            </div>
          </div>

          <button type="button" class="btn-primary" data-action="createProfile">
            ${icon("check", 18)} <span>${esc(tx("A2","cta"))}</span>
          </button>
          <button type="button" class="btn-secondary" data-action="goBack">Quay lại</button>
        `;

      // =========================================================================
      // B1 — Trang chủ (/home)
      // =========================================================================
      case "B1": {
        const hasApt = !state.lastAppointmentCancelled;
        const aptStatus = state.currentAppointmentStatus;

        return `
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 10px; cursor: pointer;" data-action="tapHeaderTitle" title="Chạm 3 lần để mở Demo Controls">
              <div class="context-bar-avatar" style="width: 38px; height: 38px; font-size: 14px;">${m.person === "self" ? "MA" : "TM"}</div>
              <div>
                <p style="font-size: 13px; color: var(--color-text-700); margin: 0;">Xin chào,</p>
                <h3 style="margin: 0; font-size: 18px;">${esc(personShort())}</h3>
              </div>
            </div>
            <button type="button" class="context-bar-btn" data-action="goC1" title="Chuyển đổi hồ sơ người thân">
              ${icon("person", 14)} Đổi hồ sơ
            </button>
          </div>

          ${m.person === "relative" ? `
            <div style="background: #eef7fc; border: 1px solid #c7e2f7; border-radius: 10px; padding: 7px 12px; margin-bottom: 14px; font-size: 13px; color: var(--color-brand-900); display: flex; align-items: center; gap: 6px;">
              ${icon("info", 15)} <span>Đang xem hồ sơ: <strong>${esc(personShort())}</strong></span>
            </div>
          ` : ""}

          <!-- Appointment Hero Card -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span class="group-label" style="margin: 0;">${esc(tx("B1","hero"))}</span>
            <button type="button" class="context-bar-btn" style="padding: 2px 8px; font-size: 12px; border: 0; background: none;" data-action="goD1">Xem tất cả →</button>
          </div>

          ${hasApt ? `
            <div class="box hero hero-${aptStatus === "confirmed" ? "confirmed" : aptStatus === "pending" ? "pending" : "ready"}">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                ${statusChip(aptStatus)}
                <span class="chip neutral" style="font-size: 12px;">${state.selectedMode === "online" ? "Khám trực tuyến (bản mô phỏng)" : "Khám trực tiếp"}</span>
              </div>

              <h2 style="font-size: 20px; margin-bottom: 4px;">${formatAppointmentDateTime()}</h2>
              <p style="font-size: 15px; color: var(--color-text-700); margin-bottom: 6px;">
                Phòng khám CareFlow · BS. CKII Nguyễn Văn An
              </p>
              <p style="font-size: 13px; color: var(--color-text-700); margin-bottom: 14px;">
                Đang đặt cho: <strong>${esc(personShort())}</strong>
              </p>

              <div style="background: #ffffff; border: 1px solid #dbe6f0; border-radius: 12px; padding: 10px 12px; margin-bottom: 14px; font-size: 13px; display: flex; align-items: center; justify-content: space-between;">
                <span style="color: var(--color-text-700);">Đang chờ</span>
                <strong style="color: var(--color-brand-700); font-weight: 700;">
                  ${aptStatus === "pending" ? "Phòng khám (Điều phối)" : aptStatus === "arrived" ? "Lễ tân tiếp đón" : aptStatus === "results-ready" ? "Bác sĩ điều trị" : "Bạn"}
                </strong>
              </div>

              <button type="button" class="btn-primary btn-sm" data-action="goD2" style="margin: 0; width: 100%;">
                ${aptStatus === "confirmed" ? "Xem hướng dẫn" : aptStatus === "results-ready" ? "Xem kết quả" : "Xem lịch hẹn"}
              </button>
            </div>
          ` : `
            <div class="box" style="text-align: center; padding: 24px 16px;">
              <div class="empty-state-icon" style="margin: 0 auto 12px; width: 48px; height: 48px;">
                ${icon("calendar", 24)}
              </div>
              <h3 style="font-size: 17px; margin-bottom: 4px;">Chưa có lịch khám nào.</h3>
              <p class="lead" style="max-width: 260px; margin: 0 auto 16px;">
                Đặt lịch để phòng khám nhắc giờ cho bạn.
              </p>
              <button type="button" class="btn-primary btn-sm" data-action="startBooking" style="width: auto; padding: 8px 24px; margin: 0 auto;">
                Đặt lịch khám
              </button>
            </div>
          `}

          <!-- Quick Actions & Tasks -->
          <div style="margin: 18px 0 8px;">
            <span class="group-label" style="margin: 0;">${esc(tx("B1","tasks"))}</span>
          </div>

          <div class="task-item">
            <div class="task-item-icon">${icon("document", 16)}</div>
            <div class="task-item-content">
              <div class="task-item-title">Xác nhận phiếu thông tin y tế</div>
              <div class="task-item-sub">Điền triệu chứng để bác sĩ nắm trước hồ sơ khám.</div>
            </div>
            <button type="button" class="context-bar-btn" data-action="goC2">Làm ngay</button>
          </div>

          <div class="task-item">
            <div class="task-item-icon">${icon("shield", 16)}</div>
            <div class="task-item-content">
              <div class="task-item-title">Mang theo CCCD & thẻ BHYT</div>
              <div class="task-item-sub">Xuất trình tại quầy lễ tân để được tiếp đón nhanh.</div>
            </div>
          </div>

          <div class="task-item">
            <div class="task-item-icon">${icon("document-check", 16)}</div>
            <div class="task-item-content">
              <div class="task-item-title">Kết quả đợt khám trước đã có</div>
              <div class="task-item-sub">Bác sĩ đã xem xét đơn thuốc và xét nghiệm.</div>
            </div>
            <button type="button" class="context-bar-btn" data-action="goF2">Xem</button>
          </div>

          <div style="margin: 20px 0 6px;">
            <button type="button" class="btn-primary" data-action="startBooking">
              ${icon("calendar", 18)} <span>＋ Đặt lịch khám</span>
            </button>
          </div>

          <div class="quick-grid">
            <button type="button" class="quick-tile" data-action="goG1">
              <div class="quick-tile-icon" style="background: #f1ecfa; color: #6b21a8;">${icon("person", 18)}</div>
              <div>
                <div class="quick-tile-title">Hồ sơ và người thân</div>
                <div class="quick-tile-desc">Phân quyền đặt hộ</div>
              </div>
            </button>

            <button type="button" class="quick-tile" data-action="goF2">
              <div class="quick-tile-icon" style="background: #e6f6ee; color: #16734b;">${icon("pill", 18)}</div>
              <div>
                <div class="quick-tile-title">Kết quả / đơn thuốc</div>
                <div class="quick-tile-desc">Xem hồ sơ sau khám</div>
              </div>
            </button>
          </div>
        `;
      }

      // =========================================================================
      // C1 — Ai đi khám (/booking/patient)
      // =========================================================================
      case "C1":
        return `
          <div class="mini-step">C1 · BƯỚC 1/4</div>
          <h2>${esc(tx("C1","title"))}</h2>
          <p class="lead">Chọn hồ sơ của người sẽ đi khám.</p>

          <button type="button" class="choice ${m.person === "self" ? "selected" : ""}" data-action="selectPerson" data-value="self">
            <strong>Nguyễn Minh Anh — Tôi (hồ sơ mẫu)</strong>
            <small>Đặt lịch cho chính mình · Chủ tài khoản</small>
            <div class="choice-indicator">${m.person === "self" ? icon("check", 13) : ""}</div>
          </button>

          <button type="button" class="choice ${m.person === "relative" ? "selected" : ""}" data-action="selectPerson" data-value="relative">
            <strong>Trần Thị Mai — Mẹ (hồ sơ mẫu)</strong>
            <small>Đã liên kết · Quyền đặt lịch ${m.canBookRelative ? "đã có" : "đã thu hồi"}</small>
            <div class="choice-indicator">${m.person === "relative" ? icon("check", 13) : ""}</div>
          </button>

          <div class="box dashed" style="margin-top: 14px;">
            <div style="font-size: 13px; color: var(--color-text-700); line-height: 1.45;">
              <strong>Quyền người thân:</strong> Được đặt hộ không đồng nghĩa được phép xem kết quả xét nghiệm.
            </div>
            <button type="button" class="btn-secondary btn-sm" style="margin-top: 8px;" data-action="goG1">
              Kiểm tra quyền đặt hộ
            </button>
          </div>

          <button type="button" class="btn-primary" data-action="nextPerson">
            <span>Tiếp tục</span> ${icon("chevron-right", 18)}
          </button>
          <button type="button" class="btn-secondary" data-action="goB1">Quay lại trang chủ</button>
        `;

      // =========================================================================
      // C2 — Lý do khám và sàng lọc (/booking/reason)
      // =========================================================================
      case "C2": {
        const reasons = ["Khám tổng quát", "Đau hoặc khó chịu", "Theo dõi bệnh đang điều trị", "Tư vấn kết quả", "Khác"];

        return `
          <div class="mini-step">C2 · BƯỚC 2/4</div>
          <h2>Lý do khám</h2>
          ${profileContextBar()}

          <label class="field-label" for="reason-note">${esc(tx("C2","reason"))}</label>
          <textarea id="reason-note" data-field="reasonNote" placeholder="${esc(tx("C2","hint"))}">${esc(state.reasonNote)}</textarea>

          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0 14px;">
            ${reasons.map(r => `
              <button type="button" class="chip ${state.reasonCategory === r ? "info" : "neutral"}" style="padding: 7px 11px; cursor: pointer; border-radius: 9px;" data-action="chooseReason" data-value="${esc(r)}">
                <span>${esc(r)}</span>
              </button>
            `).join("")}
          </div>

          <!-- Screening Section -->
          <div class="box warning" style="margin-top: 16px;">
            <strong style="font-size: 15px; color: var(--color-danger-700);">${esc(tx("C2","screening"))}</strong>
            <p class="lead" style="margin: 4px 0 10px; font-size: 13px;">
              [Dấu hiệu cảnh báo do bác sĩ phòng khám xác định] · Chỉ mô phỏng thử nghiệm.
            </p>

            <button type="button" class="choice ${state.screeningChoice === "normal" ? "selected" : ""}" data-action="chooseScreening" data-value="normal">
              <strong>Không có (mẫu)</strong>
              <small>Đi tiếp chọn hình thức khám</small>
            </button>

            <button type="button" class="choice ${state.screeningChoice === "warning" ? "selected" : ""}" data-action="chooseScreening" data-value="warning">
              <strong style="color: var(--color-danger-700);">Có (mẫu)</strong>
              <small>Chuyển màn C3 để kiểm tra an toàn</small>
            </button>
          </div>

          <button type="button" class="btn-primary" data-action="nextScreening">
            <span>Tiếp tục</span> ${icon("chevron-right", 18)}
          </button>
          <button type="button" class="btn-secondary" data-action="goC1">Quay lại</button>
        `;
      }

      // =========================================================================
      // C3 — Cảnh báo nguy hiểm (/booking/safety-alert)
      // =========================================================================
      case "C3":
        return `
          <div class="mini-step">C3 · CẢNH BÁO</div>
          <div class="medical-review-badge">
            ${icon("shield", 14)} [MEDICAL REVIEW REQUIRED]
          </div>
          <h2>${esc(tx("C3","title"))}</h2>
          <p class="lead">${esc(tx("C3","explanation"))}</p>

          <div class="box warning" style="margin-bottom: 16px;">
            <strong style="font-size: 16px; color: var(--color-danger-700);">${esc(tx("C3","safety"))}</strong>
            <p style="font-size: 15px; color: var(--color-text-700); margin: 6px 0 10px; line-height: 1.5;">
              Trong tình huống được đánh dấu, hệ thống cần chuyển sang hướng dẫn hỗ trợ do chuyên môn phê duyệt. Không đưa lời khuyên chẩn đoán và không tự xác định bệnh nhân có thể khám trực tuyến.
            </p>
          </div>

          <button type="button" class="btn-danger" data-action="callEmergency">
            ${icon("phone", 20)} <span>${esc(tx("C3","emergency"))}</span>
          </button>

          <button type="button" class="btn-secondary" data-action="openHospitalMap">
            ${icon("location", 18)} <span>Chỉ đường đến cơ sở y tế gần nhất</span>
          </button>

          <button type="button" class="btn-secondary" data-action="callClinicHotline">
            ${icon("phone", 18)} <span>Gọi phòng khám: ${config.CLINIC_HOTLINE}</span>
          </button>

          <div class="box dashed" style="text-align: center; padding: 14px; margin-top: 14px;">
            <button type="button" class="btn-tertiary btn-sm" style="border: 0; font-size: 14px; font-weight: 600;" data-action="openContinueConfirmation">
              ${esc(tx("C3","continue"))}
            </button>
          </div>

          <button type="button" class="btn-secondary" data-action="goC2" style="margin-top: 8px;">
            Xem lại thông tin đã nhập
          </button>
        `;

      // =========================================================================
      // C4 — Chọn ngày giờ (/booking/slot)
      // =========================================================================
      case "C4": {
        const slots = ["09:00", "09:30", "10:00", "14:30", "15:00", "15:30"];
        const days = [20,21,22,23];

        return `
          <div class="mini-step">C4 · BƯỚC 3/4</div>
          <h2>${esc(tx("C4","title"))}</h2>
          ${profileContextBar()}

          <label class="field-label">Hình thức khám</label>
          <div class="segmented-control">
            <button type="button" class="segmented-btn ${state.selectedMode === "in-person" ? "active" : ""}" data-action="chooseMode" data-value="onsite">
              ${icon("location", 14)} Khám trực tiếp
            </button>
            <button type="button" class="segmented-btn ${state.selectedMode === "online" ? "active" : ""}" data-action="chooseMode" data-value="online">
              ${icon("video", 14)} ${esc(tx("C4","online"))}
            </button>
          </div>

          <label class="field-label">Ngày khám · ${formatAppointmentDateTime()}</label>
          <div class="pill-list" aria-label="Chọn ngày khám">${days.map(day=>`<button type="button" class="day-pill ${state.selectedDate.endsWith("-"+day)?"active":""}" data-action="chooseDate" data-value="2026-10-${day}">${day}/10</button>`).join("")}</div>
          <div class="slots-grid">
            ${slots.map(s => `
              <button type="button" class="slot-btn ${m.slot === s ? "selected" : ""}" data-action="chooseSlot" data-value="${s}">
                <strong>${s}</strong>
              </button>
            `).join("")}
          </div>

          ${m.slotUnavailable ? `
            <div class="notice note-error">
              ${icon("warning", 16)} <span>Ngày này đã kín lịch. Bạn có thể chọn giờ gần nhất bên dưới hoặc gọi phòng khám.</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
              <button type="button" class="btn-secondary btn-sm" data-action="chooseSlot" data-value="14:30">Xem giờ 14:30</button>
              <button type="button" class="btn-secondary btn-sm" data-action="openHelp">Gọi phòng khám</button>
            </div>
          ` : ""}

          <button type="button" class="btn-primary" data-action="nextSlot" ${!m.slot ? "disabled" : ""}>
            <span>${esc(tx("C4","cta"))} (${esc(m.slot || "Chưa chọn")})</span> ${icon("chevron-right", 18)}
          </button>
          <button type="button" class="btn-secondary" data-action="goC2">Quay lại</button>
        `;
      }

      // =========================================================================
      // C5 — Xác nhận đặt lịch (/booking/confirm)
      // =========================================================================
      case "C5":
        return `
          <div class="mini-step">C5 · BƯỚC 4/4</div>
          <h2>${esc(tx("C5","title"))}</h2>
          <p class="lead">Xác nhận đúng người khám và lịch trước khi gửi.</p>
          ${profileContextBar()}

          <div class="box">
            <div class="box-title">Thông tin đặt lịch</div>
            <div class="review-table">
              <div class="review-row">
                <span class="review-label">Người được khám</span>
                <span class="review-value">${esc(personName())}</span>
              </div>
              <div class="review-row">
                <span class="review-label">Hình thức</span>
                <span class="review-value">${state.selectedMode === "online" ? "Khám trực tuyến (bản mô phỏng)" : "Khám trực tiếp"}</span>
              </div>
              <div class="review-row">
                <span class="review-label">Ngày / giờ</span>
                <span class="review-value" style="color: var(--color-brand-700);">${formatAppointmentDateTime()}</span>
              </div>
              <div class="review-row">
                <span class="review-label">Lý do</span>
                <span class="review-value">${esc(state.reasonNote || state.reasonCategory || "Khám tổng quát")}</span>
              </div>
              <div class="review-row">
                <span class="review-label">Phí dự kiến</span>
                <span class="review-value">[Phí dự kiến do phòng khám xác nhận]</span>
              </div>
            </div>
          </div>

          <div class="accordion">
            <button type="button" class="accordion-header" data-action="togglePolicyAccordion">
              <span>Chính sách đổi & hủy lịch (Mẫu)</span>
              <span>↓</span>
            </button>
            <div class="accordion-content">
              [Chính sách đổi, hủy của phòng khám]
            </div>
          </div>

          ${m.bookingError === "SLOT_UNAVAILABLE" ? `
            <div class="box warning">
              <strong style="color: var(--color-danger-700);">Giờ khám không còn trống</strong>
              <p style="font-size: 15px; color: var(--color-text-700); margin: 4px 0 10px;">
                Hệ thống không tạo lịch. Hãy chọn khung giờ khác.
              </p>
              <button type="button" class="btn-secondary btn-sm" data-action="goC4">Chọn giờ khác</button>
            </div>
          ` : ""}

          ${m.bookingPending ? `
            <div class="box warning">
              <strong style="color: var(--color-warning-700);">Chưa xác định đã đặt thành công</strong>
              <p style="font-size: 15px; color: var(--color-text-700); margin: 4px 0 10px;">
                Không nhấn gửi lần nữa cho tới khi kiểm tra kết quả gửi trước đó.
              </p>
              <button type="button" class="btn-primary btn-sm" data-action="checkUnknown">Kiểm tra trạng thái yêu cầu</button>
            </div>
          ` : ""}

          <div class="box"><label class="row-consent"><input type="checkbox" data-action="toggleBookingConsent" ${state.bookingConsent?"checked":""} /><span>${esc(tx("C5","consent"))}</span></label></div>
          <button type="button" class="btn-primary" data-action="confirmBooking" ${m.bookingPending || state.isSubmitting ? "disabled" : ""}>
            ${icon("check", 18)} <span>${state.isSubmitting ? "Đang xử lý..." : "Xác nhận đặt lịch"}</span>
          </button>
          <button type="button" class="btn-secondary" data-action="goC4">Đổi ngày giờ</button>
        `;

      // =========================================================================
      // C6 — Đặt lịch xong (/booking/success)
      // =========================================================================
      case "C6": {
        const aptId = m.appointment ? m.appointment.id : "DEMO-001";
        return `
          <div style="text-align: center; padding: 20px 0 16px;">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: #e0f6eb; color: #16734b; display: grid; place-items: center; margin: 0 auto 14px;">
              ${icon("check", 32)}
            </div>
            <h2>${esc(tx("C6","confirmed"))}</h2>
            <p class="lead" style="margin-bottom: 0;">Phòng khám đã xác nhận lịch của bạn (mẫu).</p>
          </div>

          <div class="box hero hero-confirmed">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <span class="chip success">${esc(tx("C6","confirmed"))}</span>
              <span style="font-size: 15px; font-weight: 700; color: var(--color-brand-700);">${esc(aptId)}</span>
            </div>

            <div style="font-size: 19px; font-weight: 700; color: var(--color-brand-900); margin-bottom: 4px;">
              ${formatAppointmentDateTime()}
            </div>
            <p style="font-size: 15px; color: var(--color-text-700); margin-bottom: 8px;">
              <strong>${esc(personName())}</strong>
            </p>
            <p style="font-size: 13px; color: var(--color-text-700); margin-bottom: 12px;">
              ${state.selectedMode === "online" ? "Khám trực tuyến (bản mô phỏng)" : "Tại phòng khám CareFlow"}
            </p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
              <button type="button" class="btn-secondary btn-sm" data-action="copyBookingCode">
                ${icon("copy", 14)} Sao chép mã
              </button>
              <button type="button" class="btn-secondary btn-sm" data-action="addToCalendar">
                ${icon("calendar", 14)} Thêm vào lịch
              </button>
            </div>
          </div>

          <button type="button" class="btn-primary" data-action="goD2">
            <span>Xem lịch hẹn</span> ${icon("chevron-right", 18)}
          </button>
          <button type="button" class="btn-secondary" data-action="goB1">Về trang chủ</button>
        `;
      }

      // =========================================================================
      // D1 — Danh sách lịch hẹn (/appointments)
      // =========================================================================
      case "D1":
        return `
          <div class="segmented-control" aria-label="Lọc lịch hẹn">${["Sắp tới","Đã khám","Đã hủy"].map((label,i)=>`<button class="segmented-btn ${state.appointmentTab===i?"active":""}" type="button" data-action="filterAppointments" data-value="${i}">${label}</button>`).join("")}</div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <h2>${esc(tx("D1","title"))}</h2>
            <button type="button" class="context-bar-btn" data-action="startBooking">＋ Đặt lịch mới</button>
          </div>

          <div class="box" style="cursor: pointer;" data-action="goD2">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              ${statusChip(state.lastAppointmentCancelled ? "cancelled" : state.currentAppointmentStatus)}
              <span class="chip neutral" style="font-size: 12px;">${state.selectedMode === "online" ? "Trực tuyến (mô phỏng)" : "Trực tiếp"}</span>
            </div>
            <h3 style="font-size: 17px; margin-bottom: 4px;">${formatAppointmentDateTime()}</h3>
            <p style="font-size: 15px; color: var(--color-text-700); margin-bottom: 6px;">
              <strong>${esc(personName())}</strong>
            </p>
            <button type="button" class="btn-secondary btn-sm" data-action="goD2" style="margin-top: 6px;">
              Xem lịch hẹn
            </button>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <button type="button" class="btn-primary" data-action="startBooking">
              ${icon("calendar", 16)} Đặt lịch mới
            </button>
          </div>
        `;

      // =========================================================================
      // D2 — Chi tiết lịch hẹn (/appointments/:id)
      // =========================================================================
      case "D2": {
        const status = state.lastAppointmentCancelled ? "cancelled" : state.currentAppointmentStatus;

        // Status-to-CTA mapping for all 13 states with ZERO dead buttons (v2 Section 1.6)
        const ctaMapping = {
          pending: { label: "Gọi phòng khám", action: "callClinicHotline", icon: "phone" },
          confirmed: { label: "Xem hướng dẫn", action: "openPreparationGuide", icon: "document" },
          reminder: { label: "Check-in", action: "goE1", icon: "location" },
          arrived: { label: "Xem số thứ tự", action: "goE1", icon: "document" },
          waiting: { label: "Xem trạng thái", action: "goE1", icon: "clock" },
          "online-waiting": { label: "Vào phòng chờ", action: "goE2", icon: "video" },
          delayed: { label: "Giữ lịch / Đổi lịch", action: "goD3", icon: "calendar" },
          "results-pending": { label: "Xem tiến độ", action: "goF2", icon: "document-check" },
          "results-ready": { label: "Xem kết quả", action: "goF2", icon: "document-check" },
          reviewed: { label: "Xem kết luận", action: "goF2", icon: "document-check" },
          cancelled: { label: "Đặt lại", action: "startBooking", icon: "calendar" },
          "no-show": { label: "Gọi phòng khám", action: "callClinicHotline", icon: "phone" },
          "connection-failed": { label: "Thử lại", action: "retryConnection", icon: "arrow-clockwise" }
        };

        const activeCta = ctaMapping[status] || { label: "Xem hướng dẫn", action: "openPreparationGuide", icon: "info" };

        return `
          <div class="mini-step">D2 · CHI TIẾT LỊCH</div>
          <h2>${esc(tx("D2","title"))}</h2>

          <div class="box hero">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              ${statusChip(status)}
              <span class="chip neutral" style="font-size: 12px;">Mã: ${esc(m.appointment ? m.appointment.id : "DEMO-001")}</span>
            </div>

            <h2 style="font-size: 20px; margin-bottom: 4px;">${formatAppointmentDateTime()}</h2>
            <p style="font-size: 15px; color: var(--color-text-700); margin-bottom: 4px;">
              Người bệnh: <strong>${esc(personName())}</strong>
            </p>
            <p style="font-size: 13px; color: var(--color-text-700); margin-bottom: 14px;">
              Phòng khám CareFlow · BS. CKII Nguyễn Văn An
            </p>

            <div style="background: #ffffff; border: 1px solid #dbe6f0; border-radius: 12px; padding: 10px 12px; margin-bottom: 14px; font-size: 13px; display: flex; align-items: center; justify-content: space-between;">
              <span style="color: var(--color-text-700);">Đang chờ</span>
              <strong style="color: var(--color-brand-700); font-weight: 700;">
                ${status === "pending" ? "Phòng khám" : status === "arrived" ? "Lễ tân tiếp đón" : status === "results-ready" ? "Bác sĩ" : "Bạn"}
              </strong>
            </div>

            <button type="button" class="btn-primary" data-action="${activeCta.action}">
              ${icon(activeCta.icon, 18)} <span>${esc(activeCta.label)}</span>
            </button>
          </div>

          <!-- Dynamic 5-Step Timeline from Data (v2 Section 1.8) -->
          <div class="box">
            <div class="box-title">Hành trình buổi khám</div>
            <div class="timeline">
              ${state.currentAppointment.timeline.map((step, idx) => `
                <div class="timeline-step ${step.state === "done" ? "completed" : step.state === "current" ? "current" : ""}">
                  <div class="timeline-dot">${step.state === "done" ? icon("check", 10) : ""}</div>
                  <div class="timeline-title">
                    <span>${esc(step.label)}</span>
                    ${step.at ? `<span style="font-size: 12px; color: var(--color-text-700);">${idx === 0 ? "08:45" : idx === 1 ? "09:02" : "09:15"}</span>` : ""}
                  </div>
                  <div class="timeline-meta">${idx === 0 ? "Hệ thống đã nhận yêu cầu." : idx === 1 ? "Phòng khám đã xác nhận lịch." : idx === 2 ? "Tiếp đón và chuẩn bị gặp bác sĩ." : "Chờ cập nhật bước tiếp theo."}</div>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="box">
            <div class="box-title">Thao tác lượt khám</div>
            <div style="display: grid; gap: 8px;">
              <button type="button" class="btn-secondary btn-sm" data-action="goE1">Check-in</button>
              <button type="button" class="btn-secondary btn-sm" data-action="goE2">Chuẩn bị khám trực tuyến</button>
              <button type="button" class="btn-secondary btn-sm" data-action="goF1">Thanh toán</button>
              <button type="button" class="btn-secondary btn-sm" data-action="goF2">Xem kết quả</button>
              <button type="button" class="btn-secondary btn-sm" data-action="goD3">Đổi hoặc hủy lịch</button>
            </div>
          </div>
        `;
      }

      // =========================================================================
      // D3 — Hủy hoặc đổi lịch (/appointments/:id/change)
      // =========================================================================
      case "D3":
        return `
          <div class="mini-step">D3 · THAY ĐỔI</div>
          <h2>${esc(tx("D3","title"))}</h2>
          <p class="lead">Mọi thay đổi cần được hệ thống phòng khám xác nhận.</p>

          <div class="box" style="background: #f8fafc;">
            <strong>Lịch hiện tại: ${formatAppointmentDateTime()}</strong>
            <p style="font-size: 15px; color: var(--color-text-700); margin-top: 4px;">
              ${esc(personName())}
            </p>
          </div>

          <div class="box">
            <label class="field-label" for="cancel-reason">${esc(tx("D3","reason"))}</label>
            <input id="cancel-reason" data-field="cancelReason" value="${esc(state.cancelReason)}" placeholder="Chọn / nhập lý do" />
          </div>

          <button type="button" class="btn-secondary" data-action="goC4">Đổi sang giờ khác</button>
          <button type="button" class="btn-danger" data-action="cancelAppointment">Hủy lịch</button>
          <button type="button" class="btn-tertiary" data-action="goD2" style="font-weight: 700;">Giữ lịch</button>
        `;

      // =========================================================================
      // F2 — Kết luận, đơn thuốc, kết quả (/results/:id)
      // =========================================================================
      case "F2": {
        const canView = M.canViewResults(m);

        return `
          <div class="mini-step">F2 · SAU KHÁM</div>
          <h2>${esc(tx("F2","title"))}</h2>
          ${profileContextBar()}

          <div class="box">
            <div class="box-title">Kết quả xét nghiệm, chụp chiếu</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span>Trạng thái:</span>
              <span class="chip ${m.result === "reviewed" ? "success" : "info"}">${m.result === "reviewed" ? "Bác sĩ đã xem" : "Đang xử lý"}</span>
            </div>
            <button type="button" class="btn-secondary btn-sm" data-action="viewResult">Xem tài liệu (demo)</button>
          </div>

          <div class="box dashed">
            <div class="box-title">Kết luận của bác sĩ và đơn thuốc</div>
            <p class="field-hint">
              Nội dung kết luận chỉ xuất hiện khi người có thẩm quyền đã phát hành và người xem có quyền truy cập.
            </p>
          </div>

          <button type="button" class="btn-secondary" data-action="goF3">Xét nghiệm và chụp chiếu</button>
          <button type="button" class="btn-secondary" data-action="openHelp">Hỏi phòng khám</button>
        `;
      }

      // =========================================================================
      // G2 — Thông báo (/notifications)
      // =========================================================================
      case "G2":
        return `
          <div class="mini-step">G2 · THÔNG BÁO</div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <h2>Thông báo</h2>
            <button type="button" class="context-bar-btn" data-action="markAllRead">Đọc tất cả</button>
          </div>

          <div class="box" style="cursor: pointer;" data-action="goD2">
            <strong>Phòng khám đã xác nhận lịch</strong>
            <p style="font-size: 15px; color: var(--color-text-700); margin: 4px 0 8px;">
              Mở app để xem chi tiết
            </p>
            <button type="button" class="btn-secondary btn-sm" data-action="goD2">Mở chi tiết lịch</button>
          </div>

          <div class="box" style="cursor: pointer;" data-action="notificationResult">
            <strong>Có kết quả mới</strong>
            <p style="font-size: 15px; color: var(--color-text-700); margin: 4px 0 8px;">
              Đăng nhập để xem nội dung được phép (mô phỏng).
            </p>
            <button type="button" class="btn-secondary btn-sm" data-action="notificationResult">Mở kết quả với quyền hiện tại</button>
          </div>

          <button type="button" class="btn-secondary" data-action="openHelp">Hỗ trợ phòng khám</button>
        `;

      // =========================================================================
      // G1 / Profile — Hồ sơ & người thân (/profile)
      // =========================================================================
      case "G1":
        return `
          <div class="mini-step">G1 · HỒ SƠ</div>
          <h2>Hồ sơ & người thân</h2>
          <p class="lead">Xem người đã liên kết và quyền thao tác.</p>

          <div class="box">
            <div class="box-title">Hồ sơ của tôi</div>
            <strong>Tôi (hồ sơ mẫu)</strong>
            <span class="chip success" style="margin-left: 8px;">Chủ hồ sơ</span>
            <div style="margin-top: 10px;">
              <button type="button" class="btn-secondary btn-sm" data-action="bookSelf">Đặt lịch cho tôi</button>
            </div>
          </div>

          <div class="box">
            <div class="box-title">Hồ sơ người thân</div>
            <strong>Mẹ (hồ sơ mẫu)</strong>
            <div style="margin: 6px 0;">
              <span class="chip ${m.canBookRelative ? "success" : "neutral"}">
                ${m.canBookRelative ? "Có quyền đặt hộ" : "Không có quyền đặt hộ"}
              </span>
              <span class="chip ${m.canViewRelativeResults ? "success" : "neutral"}" style="margin-left: 6px;">
                ${m.canViewRelativeResults ? "Được xem kết quả" : "Không được xem kết quả"}
              </span>
            </div>
            <div class="callout" style="margin: 10px 0;">
              Quyền đặt lịch và xem hồ sơ là hai quyền khác nhau.
            </div>
            <div style="display: grid; gap: 8px;">
              <button type="button" class="btn-secondary btn-sm" data-action="bookRelative">Đặt lịch cho mẹ</button>
              <button type="button" class="btn-tertiary btn-sm" data-action="toggleRelativeBook">
                Mô phỏng thu hồi / cấp quyền đặt hộ
              </button>
            </div>
          </div>

          <button type="button" class="btn-secondary" data-action="goG3">Cài đặt</button>
        `;

      // =========================================================================
      // F4 / Support — Hỗ trợ & Hotline (/support)
      // =========================================================================
      case "F4":
        return `
          <div class="mini-step">F4 · HỖ TRỢ</div>
          <h2>Liên hệ phòng khám</h2>
          <p class="lead">Bản mẫu hỗ trợ kết nối trực tiếp với nhân viên điều phối.</p>

          <div class="box hero">
            <div class="box-title">Gọi phòng khám</div>
            <p class="field-hint">Hotline hỗ trợ: ${config.CLINIC_HOTLINE}</p>
            <button type="button" class="btn-secondary" data-action="callPlaceholder">
              ${icon("phone", 18)} <span>Xem số hotline (chưa cấu hình)</span>
            </button>
          </div>

          <div class="box">
            <div class="box-title">Yêu cầu gọi lại</div>
            <div style="margin-bottom: 8px;">
              <span class="chip ${m.callback === "pending" ? "success" : "neutral"}">
                ${m.callback === "pending" ? "Đã nhận yêu cầu (demo)" : "Chưa gửi yêu cầu"}
              </span>
            </div>
            <p style="font-size: 15px; color: var(--color-text-700); margin-bottom: 10px;">
              Đội phụ trách: điều phối viên (theo quy trình dự kiến).
            </p>
            <button type="button" class="btn-primary" data-action="requestCallback">
              Gửi yêu cầu gọi lại (demo)
            </button>
          </div>

          <button type="button" class="btn-secondary" data-action="goBack">Quay lại</button>
        `;

      // =========================================================================
      // Complementary Encounter Screens (E1, E2, E3, E4, F1, F3, G3)
      // =========================================================================
      case "E1":
        return `
          <div class="mini-step">E1 · TRỰC TIẾP</div>
          <h2>Check-in tại phòng khám</h2>
          ${profileContextBar()}
          <div class="box">
            <div class="box-title">Trạng thái tiếp nhận</div>
            <span class="chip ${m.queue === "checked_in" ? "success" : "neutral"}">
              ${m.queue === "checked_in" ? "Phòng khám đã nhận bạn" : "Chưa check-in"}
            </span>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; text-align: center;">
              <div style="background: #f1f5f9; padding: 12px; border-radius: 12px;">
                <span class="field-hint">Số tiếp nhận</span>
                <div style="font-size: 26px; font-weight: 800; color: var(--color-brand-700);">A012</div>
              </div>
              <div style="background: #f1f5f9; padding: 12px; border-radius: 12px;">
                <span class="field-hint">Số chờ khám</span>
                <div style="font-size: 26px; font-weight: 800; color: var(--color-brand-900);">05</div>
              </div>
            </div>
          </div>
          <button type="button" class="btn-primary" data-action="checkin">Đánh dấu check-in (demo)</button>
          <button type="button" class="btn-secondary" data-action="goD2">Xem chi tiết lịch</button>
        `;

      case "E2":
        return `
          <div class="mini-step">E2 · KIỂM TRA THIẾT BỊ</div>
          <h2>Chuẩn bị khám online</h2>
          ${profileContextBar()}
          <div class="box">
            <div class="box-title">Trước khi tham gia</div>
            <p style="font-size: 15px;">□ Có kết nối Internet</p>
            <p style="font-size: 15px;">□ Cho phép camera và micro</p>
            <p style="font-size: 15px;">□ Đang ở nơi yên tĩnh, riêng tư</p>
            <div style="height: 120px; border: 2px dashed var(--color-border-strong); border-radius: 14px; background: #eef2f6; display: grid; place-items: center; text-align: center; font-size: 13px; color: var(--color-text-700); margin: 10px 0;">
              [ VÙNG XEM CAMERA — DEMO ]
            </div>
          </div>
          <button type="button" class="btn-primary" data-action="joinVideo">Tôi đã sẵn sàng (mẫu)</button>
          <button type="button" class="btn-secondary" data-action="goE4">Không tham gia được</button>
        `;

      case "E3":
        return `
          <div class="mini-step">E3 · KHÁM VIDEO</div>
          <h2>Buổi khám trực tuyến</h2>
          <div style="height: 240px; border-radius: 18px; background: #0f172a; color: #fff; display: grid; place-items: center; text-align: center; padding: 20px;">
            <div>
              ${icon("video", 36)}
              <div style="font-weight: 700; margin-top: 10px; font-size: 16px;">[ VIDEO PLACEHOLDER ]</div>
              <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">Không có cuộc gọi thật</p>
            </div>
          </div>
          <div class="btn-row" style="margin-top: 12px;">
            <button type="button" class="btn-secondary" data-action="toggleMic">${state.videoMic ? "Tắt micro" : "Bật micro"}</button>
            <button type="button" class="btn-secondary" data-action="toggleCamera">${state.videoCamera ? "Tắt camera" : "Bật camera"}</button>
          </div>
          <button type="button" class="btn-secondary" data-action="dropCall">Mô phỏng mất kết nối</button>
          <button type="button" class="btn-tertiary" data-action="endVideo">Hoàn tất buổi khám</button>
        `;

      case "E4":
        return `
          <div class="mini-step">E4 · XỬ LÝ NGOẠI LỆ</div>
          <h2>Chưa kết nối được</h2>
          <div class="box warning">
            <strong style="color: var(--color-danger-700);">Không thể tiếp tục cuộc gọi</strong>
            <p style="font-size: 15px; color: var(--color-text-700); margin: 6px 0;">
              Cuộc gọi bị gián đoạn. Thông tin lịch hẹn vẫn được giữ lại (bản mẫu).
            </p>
          </div>
          <button type="button" class="btn-primary" data-action="retryVideo">Thử kết nối lại</button>
          <button type="button" class="btn-secondary" data-action="goF4">Yêu cầu phòng khám gọi lại</button>
          <button type="button" class="btn-tertiary" data-action="goD2">Xem lịch / chuyển khám trực tiếp</button>
        `;

      case "F1":
        return `
          <div class="mini-step">F1 · VIỆN PHÍ</div>
          <h2>Thanh toán</h2>
          <div class="box">
            <div class="box-title">Khoản thanh toán minh họa</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Khám bệnh (mẫu)</span>
              <strong>— đ</strong>
            </div>
            <div style="width: 140px; height: 140px; border: 2px dashed #94a3b8; border-radius: 14px; margin: 12px auto; display: grid; place-items: center; text-align: center; font-size: 13px;">
              [ QR PLACEHOLDER ]<br>Không quét
            </div>
            <div style="text-align: center;">
              <span class="chip ${m.payment === "paid" ? "success" : m.payment === "pending_reconciliation" ? "warning" : "neutral"}">
                ${m.payment === "paid" ? "Đã xác nhận" : m.payment === "pending_reconciliation" ? "Đang xác nhận" : "Chưa thanh toán"}
              </span>
            </div>
          </div>
          <button type="button" class="btn-primary" data-action="beginPayment">Mô phỏng đã quét QR</button>
          <p class="field-hint" style="text-align: center;">Quét QR ≠ đã trả. Chỉ hệ thống đối soát được xác nhận thành công.</p>
        `;

      case "F3":
        return `
          <div class="mini-step">F3 · CẬN LÂM SÀNG</div>
          <h2>Xét nghiệm cần làm</h2>
          ${profileContextBar()}
          <div class="box">
            <div class="box-title">Chỉ định mẫu</div>
            <strong>Xét nghiệm, chụp chiếu theo chỉ định của bác sĩ (placeholder)</strong>
            <div class="timeline" style="margin-top: 10px;">
              <div class="timeline-step completed"><div class="timeline-dot"></div><div>Đã chỉ định</div></div>
              <div class="timeline-step current"><div class="timeline-dot"></div><div>Chờ thực hiện</div></div>
              <div class="timeline-step"><div class="timeline-dot"></div><div>Có kết quả</div></div>
              <div class="timeline-step"><div class="timeline-dot"></div><div>Bác sĩ xem</div></div>
            </div>
          </div>
          <button type="button" class="btn-secondary" data-action="goF2">Xem kết quả và đơn thuốc</button>
        `;

      case "G3":
        return `
          <div class="mini-step">G3 · CÀI ĐẶT</div>
          <h2>Cài đặt</h2>
          <div class="box">
            <div class="box-title">Khả năng tiếp cận</div>
            <button type="button" class="btn-secondary btn-sm" data-action="toggleLargeText">
              ${state.largeText ? "Tắt chữ lớn mẫu" : "Bật chữ lớn mẫu"}
            </button>
            <p class="field-hint" style="margin-top: 6px;">Bản sản phẩm thật dùng Dynamic Type / font scaling theo iOS/Android.</p>
          </div>
          <div class="box">
            <div class="box-title">Quyền riêng tư</div>
            <button type="button" class="btn-secondary btn-sm" data-action="goG1">Quản lý hồ sơ người thân</button>
          </div>
        `;

      case "H1": return renderSoft("H1");

      default:
        return `
          <h2>Không tìm thấy màn hình</h2>
          <p>Mã màn hình ${esc(id)} không hợp lệ.</p>
          <button type="button" class="btn-primary" data-action="goB1">Về trang chủ</button>
        `;
    }
  }

  // Bottom Navigation (v2: Floating Pill Bar)
  function renderBottomNav() {
    const hiddenScreens = ["A1", "A2", "C1", "C2", "C3", "C4", "C5", "C6", "E2", "E3", "E4"];
    if (hiddenScreens.includes(state.currentScreen)) {
      return "";
    }

    const tabs = [
      { id: "B1", label: "Trang chủ", iconName: "house" },
      { id: "D1", label: "Lịch hẹn", iconName: "calendar" },
      { id: "G1", label: "Hồ sơ", iconName: "person" },
      { id: "H1", label: "Hỗ trợ", iconName: "phone" }
    ];

    return `
      <nav class="phone-footer" aria-label="Điều hướng chính 4 tab">
        ${tabs.map(t => {
          const isActive = state.currentScreen === t.id ||
            (t.id === "H1" && state.currentScreen === "F4") ||
            (t.id === "D1" && (state.currentScreen === "D2" || state.currentScreen === "D3")) ||
            (t.id === "G1" && state.currentScreen === "G3");
          return `
            <button type="button" class="phone-footer-btn ${isActive ? "active" : ""}" data-screen="${t.id}" aria-label="${t.label}">
              ${icon(t.iconName, 22)}
              <span>${t.label}</span>
            </button>
          `;
        }).join("")}
      </nav>
    `;
  }

  // Sidebar Menu Renderers (All 23 screens included for explorer)
  function renderSidebar() {
    const scenarios = [
      { id: "self", title: "01 · Tự đặt lịch" },
      { id: "proxy", title: "02 · Đặt hộ người thân" },
      { id: "warning", title: "03 · Có cảnh báo" },
      { id: "slot", title: "04 · Giờ khám đã hết" },
      { id: "unknown", title: "05 · Mất phản hồi mạng" }
    ];

    $("scenario-menu").innerHTML = scenarios.map(s => `
      <button type="button" class="scenario ${state.scenario === s.id ? "active" : ""}" data-scenario="${s.id}">
        ${icon(s.id === "warning" ? "warning" : "calendar", 16)}
        <span>${esc(s.title)}</span>
      </button>
    `).join("");

    const groups = [
      { name: "Bắt đầu", items: [["A1", "Chào mừng / OTP"], ["A2", "Tạo hồ sơ"], ["B1", "Trang chủ"]] },
      { name: "Đặt lịch & sàng lọc", items: [["C1", "Ai đi khám?"], ["C2", "Lý do & sàng lọc"], ["C3", "Cảnh báo nguy hiểm"], ["C4", "Ngày, giờ, hình thức"], ["C5", "Xác nhận"], ["C6", "Đặt lịch xong"]] },
      { name: "Quản lý lịch", items: [["D1", "Danh sách lịch"], ["D2", "Chi tiết lịch"], ["D3", "Hủy / đổi lịch"]] },
      { name: "Trong lượt khám", items: [["E1", "Check-in / STT"], ["E2", "Chuẩn bị online"], ["E3", "Khám video"], ["E4", "Chưa kết nối"]] },
      { name: "Sau khám", items: [["F1", "Thanh toán"], ["F2", "Đơn / kết quả"], ["F3", "Xét nghiệm cần làm"], ["F4", "Hỏi phòng khám"]] },
      { name: "Tài khoản", items: [["G1", "Hồ sơ / người thân"], ["G2", "Thông báo"], ["G3", "Cài đặt"], ["H1", "Hỗ trợ"]] }
    ];

    $("mobile-screen-picker").innerHTML = groups.flatMap(g => g.items).map(item => `<option value="${item[0]}" ${state.currentScreen===item[0]?"selected":""}>${item[0]} · ${esc(item[1])}</option>`).join("");

    $("screen-menu").innerHTML = groups.map(g => `
      <div class="group-label">${esc(g.name)}</div>
      ${g.items.map(s => `
        <button type="button" class="screen-nav ${state.currentScreen === s[0] ? "active" : ""}" data-screen="${s[0]}">
          <span class="code-label">${s[0]}</span>
          <span>${esc(s[1])}</span>
          ${["A1", "A2", "B1", "C1", "C2", "C3", "C4", "C5", "C6", "D1", "D2", "D3", "F2", "G2"].includes(s[0]) ? '<span class="screen-mvp-badge">MVP</span>' : ""}
        </button>
      `).join("")}
    `).join("");
  }

  // Inspector Panel Renderer
  function renderInspector() {
    const meta = screenMeta[state.currentScreen] || { title: "Màn hình mở rộng", goal: "Thành phần phụ trợ", risk: "Tuân thủ phân quyền" };

    $("inspector-content").innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span class="chip info" style="font-size: 11px; font-weight: 800;">SCREEN ${esc(state.currentScreen)}</span>
        <span style="font-size: 13px; font-weight: 700; color: var(--color-brand-900);">${esc(meta.title)}</span>
      </div>
      <dl>
        <dt>Mục tiêu</dt>
        <dd>${esc(meta.goal)}</dd>
        <dt>Điều kiện / rủi ro</dt>
        <dd>${esc(meta.risk)}</dd>
        <dt>Người được khám</dt>
        <dd><strong>${esc(personName())}</strong></dd>
        <dt>Sàng lọc mô phỏng</dt>
        <dd>${esc(m.screening || "Chưa chọn")}${m.risk ? " (đang khóa đặt lịch)" : ""}</dd>
        <dt>Kết quả booking</dt>
        <dd>${esc(m.appointment ? "Confirmed demo: " + m.appointment.id : (m.bookingPending ? "Chưa rõ, chờ kiểm tra" : "Chưa được xác nhận"))}</dd>
        <dt>Thanh toán mẫu</dt>
        <dd>${esc(m.payment)}</dd>
      </dl>
    `;

    $("demo-outcome").value = state.bookingOutcome;
    $("status-override").value = state.currentAppointmentStatus;
  }

  // Master Render Loop
  function render() {
    renderSidebar();
    renderInspector();

    // Top Header state
    const backBtn = $("header-back-btn");
    const level1Screens = ["B1", "D1", "G1", "H1", "G2"];
    if (level1Screens.includes(state.currentScreen) || state.currentScreen === "A1") {
      backBtn.style.display = "none";
    } else {
      backBtn.style.display = "flex";
    }

    const unreadCount = state.notifications.filter(n => !n.isRead).length;
    const badge = $("header-unread-badge");
    badge.style.display = unreadCount > 0 ? "block" : "none";

    $("phone-screen-tag").textContent = state.currentScreen;
    $("phone-main").setAttribute("data-current-screen",state.currentScreen);
    $("offline-bar").style.display = state.isOffline ? "flex" : "none";

    // Main Content
    let contentHtml = "";
    if (state.notice) {
      contentHtml += `
        <div class="notice ${state.noticeType === "error" || /không|lỗi|thiếu|tạm|hết|chưa/i.test(state.notice) ? "note-error" : state.noticeType === "success" ? "note-success" : ""}" role="status">
          ${icon(state.noticeType === "error" ? "warning" : state.noticeType === "success" ? "check" : "info", 16)}
          <span>${esc(state.notice)}</span>
        </div>
      `;
    }
    contentHtml += renderScreen(state.currentScreen);

    // Active Modal Injection
    if (state.activeModal === "emergency") {
      contentHtml += `
        <div class="modal-overlay" data-action="closeModal">
          <div class="modal-sheet" onclick="event.stopPropagation()">
            <div class="sheet-handle"></div>
            <h3 style="color: var(--color-danger-700); margin-bottom: 8px;">Gọi cấp cứu ${config.EMERGENCY_NUMBER}</h3>
            <p style="font-size: 15px; color: var(--color-text-700); margin-bottom: 16px; line-height: 1.5;">
              Bản demo mô phỏng quay số đến Trung tâm Cấp cứu ${config.EMERGENCY_NUMBER}. Trong tình huống khẩn cấp ngoài đời thật, hãy sử dụng điện thoại gọi ngay ${config.EMERGENCY_NUMBER} hoặc đến cơ sở y tế gần nhất.
            </p>
            <button type="button" class="btn-danger" data-action="closeModal">Đóng thông báo</button>
          </div>
        </div>
      `;
    } else if (state.activeModal === "continue-confirm") {
      contentHtml += `
        <div class="modal-overlay" data-action="closeModal">
          <div class="modal-sheet" onclick="event.stopPropagation()">
            <div class="sheet-handle"></div>
            <h3>Xác nhận tiếp tục đặt lịch</h3>
            <p style="font-size: 15px; color: var(--color-text-700); margin-bottom: 14px; line-height: 1.5;">
              Ứng dụng không thể thay thế đánh giá y tế trực tiếp trong trường hợp nguy hiểm.
            </p>
            <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 16px; background: #fff8f8; padding: 10px; border-radius: 12px; border: 1px solid #fed7d7;">
              <input type="checkbox" id="safety-ack-check" ${state.safetyAckChecked ? "checked" : ""} data-action="toggleSafetyAck" style="width: 20px; height: 20px; margin-top: 2px;" />
              <label for="safety-ack-check" style="font-size: 14px; font-weight: 600; color: var(--color-danger-700); line-height: 1.4;">
                Tôi hiểu và vẫn muốn tiếp tục đặt lịch hẹn thông thường.
              </label>
            </div>
            <button type="button" class="btn-primary" data-action="confirmContinueBooking" ${!state.safetyAckChecked ? "disabled" : ""}>
              Tôi hiểu và tiếp tục
            </button>
            <button type="button" class="btn-secondary" data-action="closeModal">Xem lại cảnh báo</button>
          </div>
        </div>
      `;
    } else if (state.activeModal === "cancel-confirm") {
      contentHtml += `
        <div class="modal-overlay"><div class="modal-sheet" role="dialog" aria-modal="true" aria-label="Hủy lịch khám này?">
          <div class="sheet-handle"></div><h3>Hủy lịch khám này?</h3>
          <p class="lead">[Chính sách đổi, hủy của phòng khám]</p>
          <p class="lead">Lý do: ${esc(state.cancelReason)}</p>
          <button type="button" class="btn-primary" data-action="closeModal">Giữ lịch</button>
          <button type="button" class="btn-danger" data-action="confirmCancelAppointment">Hủy lịch</button>
        </div></div>`;
    } else if (state.activeModal === "feature-soon") {
      contentHtml += `
        <div class="modal-overlay" data-action="closeModal">
          <div class="feature-soon-sheet" onclick="event.stopPropagation()">
            <div class="sheet-handle"></div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <div style="width: 40px; height: 40px; border-radius: 12px; background: var(--color-info-100); color: var(--color-brand-700); display: grid; place-items: center;">
                ${icon("info", 22)}
              </div>
              <h3 style="margin: 0; font-size: 18px;">Tính năng này sẽ sớm có</h3>
            </div>
            <p style="font-size: 15px; line-height: 22px; color: var(--color-text-700); margin: 8px 0 18px;">
              Đây là bản mô phỏng giao diện cho tính năng tiếp đón và điều phối. Trong phiên bản hoàn chỉnh, chức năng này sẽ tích hợp trực tiếp với hệ thống phòng khám.
            </p>
            <button type="button" class="btn-primary" data-action="callClinicHotline">
              ${icon("phone", 18)} <span>Gọi phòng khám (${config.CLINIC_HOTLINE})</span>
            </button>
            <button type="button" class="btn-secondary" data-action="closeModal">Để sau</button>
          </div>
        </div>
      `;
    } else if (state.activeModal === "demo-controls") {
      contentHtml += `
        <div class="modal-overlay" data-action="closeModal">
          <div class="demo-controls-panel" onclick="event.stopPropagation()">
            <div class="sheet-handle"></div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <h3 style="margin: 0; font-size: 18px;">Bảng điều khiển Demo (Hidden)</h3>
              <button type="button" class="context-bar-btn" data-action="closeModal">Đóng</button>
            </div>
            <p class="field-hint" style="margin-bottom: 14px;">Chuyển nhanh trạng thái lượt khám (theo ma trận chuyển đổi v2 Section 2.1):</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
              ${Object.keys(ALLOWED_TRANSITIONS).map(st => `
                <button type="button" class="btn-secondary btn-sm" style="margin: 0; font-size: 12px;" data-action="demoSetStatus" data-value="${st}">
                  ${st === state.currentAppointmentStatus ? "● " : ""}${st}
                </button>
              `).join("")}
            </div>

            <div style="display: grid; gap: 8px;">
              <button type="button" class="btn-secondary btn-sm" data-action="toggleOffline">
                ${state.isOffline ? "Tắt chế độ ngoại tuyến" : "Bật chế độ ngoại tuyến (Offline)"}
              </button>
              <button type="button" class="btn-secondary btn-sm" data-action="resetMockData">
                Đặt lại toàn bộ dữ liệu mẫu
              </button>
            </div>
          </div>
        </div>
      `;
    }

    $("phone-content").innerHTML = contentHtml;
    $("phone-footer").innerHTML = renderBottomNav();

    // Toggle danger style for C3
    $("phone-frame").classList.toggle("danger-mode", state.currentScreen === "C3");
    $("announcer").textContent = `${state.currentScreen}: ${state.notice || ""}`;
  }

  // Navigation Logic
  function nav(screenId) {
    state.notice = "";

    // Safety guard: Danger screening must not bypass C3
    if (m.risk && ["C4", "C5", "C6"].includes(screenId)) {
      state.notice = "Đã có cảnh báo: phải có nhân viên y tế xem xét trước khi tiếp tục.";
      state.noticeType = "error";
      state.currentScreen = "C3";
      render();
      return;
    }

    // Protection for C6
    if (screenId === "C6" && !M.mayEnter(m, "C6")) {
      state.notice = "Chưa có lượt khám được hệ thống xác nhận.";
      state.noticeType = "error";
      state.currentScreen = "C5";
      render();
      return;
    }

    if (!M.SCREENS.includes(screenId)) {
      state.notice = "Không tìm thấy màn hình.";
      render();
      return;
    }

    state.currentScreen = screenId;
    render();

    const scrollEl = $("phone-main");
    if (scrollEl) {
      scrollEl.scrollTop = 0;
      scrollEl.focus({ preventScroll: true });
    }
  }

  function showNotice(msg, type = "info") {
    state.notice = msg;
    state.noticeType = type;
    render();
  }

  // Scenarios Reset
  function resetScenario(scenarioId) {
    m = M.initial();
    state.scenario = scenarioId;
    state.notice = "";
    state.bookingOutcome = "success";
    state.currentAppointmentStatus = "confirmed";
    state.lastAppointmentCancelled = false;
    state.screeningChoice = "";
    state.reasonNote = "";
    state.safetyAckChecked = false;
    state.currentAppointment.safetyAcknowledged = false;

    if (scenarioId === "self") {
      state.currentScreen = "A1";
      showNotice("Đăng nhập với số mẫu và OTP 123456, sau đó chọn Đặt lịch khám.");
    } else if (scenarioId === "proxy") {
      M.choosePerson(m, "relative");
      state.currentScreen = "C1";
      showNotice("Kịch bản: đặt lịch cho mẹ. Kiểm tra quyền đặt hộ và quyền xem kết quả.");
    } else if (scenarioId === "warning") {
      state.currentScreen = "C2";
      state.screeningChoice = "warning";
      showNotice("Kịch bản: chọn lựa chọn cảnh báo, sau đó thử quay lại và tiếp tục đặt lịch.", "error");
    } else if (scenarioId === "slot") {
      M.screening(m, "normal");
      state.screeningChoice = "normal";
      m.slot = "09:00";
      state.currentScreen = "C5";
      state.bookingOutcome = "slot_unavailable";
      showNotice("Kịch bản: hệ thống báo giờ khám đã hết.", "error");
    } else if (scenarioId === "unknown") {
      M.screening(m, "normal");
      state.screeningChoice = "normal";
      m.slot = "09:00";
      state.currentScreen = "C5";
      state.bookingOutcome = "network_unknown";
      showNotice("Kịch bản: phản hồi đặt lịch chưa rõ (mất mạng).", "error");
    } else if (scenarioId === "results") {
      state.currentScreen = "F2";
      showNotice("Kịch bản: xem kết luận, đơn thuốc và kết quả xét nghiệm.");
    }

    render();
  }

  // Action Dispatcher
    function runExtendedAction(action,value){
  const record=()=>{const pid=m.person==="self"?"patient-self":"patient-relative";return extra.byPatient[pid]||(extra.byPatient[pid]={messages:[],symptom:"",lab:"ordered",labAppointment:false,paymentMethod:"qr",paymentStatus:"unpaid",paymentDue:"",receipt:false});};
  const r=record();
  switch(action){
    case "qrCheckin":return showNotice("Bạn có thể quét mã QR tại quầy. Tính năng quét mã chưa kết nối (mẫu).");
    case "audioOnly":state.videoCamera=false;return showNotice("Đã chuyển sang chế độ chỉ âm thanh (mẫu).");
    case "switchToOnsite":state.selectedMode="in-person";m.mode="onsite";return nav("D3");
    case "choosePaymentMethod":r.paymentMethod=value;return render();
    case "deferPayment":r.paymentStatus="deferred";r.paymentDue=state.paymentDue||"";return showNotice("Đã ghi nhận đề nghị thanh toán sau (mẫu). Phòng khám cần xác nhận.","success");
    case "showReceipt":return showNotice("Biên lai minh họa: mã DEMO-001, số tiền 350.000 ₫. Không phải chứng từ thanh toán thật.");
    case "simulatedSettlePayment":if(m.payment!=="pending_reconciliation")return showNotice("Chưa có khoản chuyển đang xác minh.","error");M.settlePayment(m);r.paymentStatus="paid";return showNotice("Đã thanh toán — trạng thái được gán bởi bộ mô phỏng, không phải ngân hàng.","success");
    case "bookLab":r.labAppointment=true;return showNotice("Đã tạo lịch xét nghiệm giả lập. Cần phòng khám xác nhận trước khi đến.","success");
    case "uploadLab":return showNotice("Chỉ sử dụng dữ liệu mẫu. Không tải thông tin sức khỏe thật lên prototype.");
    case "contactTab":extra.contactTab=Number(value);return render();
    case "messageSuggestion":extra.supportMessage=value;return render();
    case "sendMessage":if(!extra.supportMessage.trim())return showNotice("Bạn nhập nội dung trước khi gửi nhé.","error");r.messages.push(extra.supportMessage.trim());extra.supportMessage="";return showNotice("Phòng khám đã nhận tin của bạn (mẫu).","success");
    case "chooseSymptom":r.symptom=value;return render();
    case "chooseSeverity":extra.severity=value;return render();
    case "sendSymptoms":if(!r.symptom)return showNotice("Bạn hãy chọn nội dung cần báo.","error");r.messages.push("Báo triệu chứng: "+r.symptom+" · "+extra.severity);return showNotice("Phòng khám đã nhận tin của bạn (mẫu).","success");
    case "selectFamilyProfile":if(value==="patient-father")return showNotice("Hồ sơ này chưa được kết nối trong demo.","error");M.choosePerson(m,value==="patient-self"?"self":"relative");return showNotice("Đang chọn hồ sơ: "+personShort()+".");
    case "addFamily":return showNotice("Thêm người thân chưa kết nối dữ liệu thật. Vui lòng gọi phòng khám để xác minh quyền.");
    case "settingsSection":return showNotice("Mục "+value+" đang có trong bản xem thử. Bạn có thể chỉnh cỡ chữ và thông báo bên dưới.");
    case "setFontSize":extra.fontSize=Number(value);state.largeText=extra.fontSize>0;document.body.classList.toggle("large-text",state.largeText);return render();
    case "toggleSetting":extra.settings[Number(value)]=!extra.settings[Number(value)];return render();
    case "promptLogout":state.activeModal="logout-confirm";return render();
    case "promptDelete":state.activeModal="delete-confirm";return render();
    case "confirmLogout":state.activeModal=null;return nav("A1");
    case "faq":return showNotice("Câu hỏi: "+value+". Phòng khám sẽ hướng dẫn chi tiết khi được cấu hình.");
    default:return null;
  }
}

function handleAction(action, value) {
    if (["qrCheckin","audioOnly","switchToOnsite","choosePaymentMethod","deferPayment","showReceipt","simulatedSettlePayment","bookLab","uploadLab","contactTab","messageSuggestion","sendMessage","chooseSymptom","chooseSeverity","sendSymptoms","selectFamilyProfile","addFamily","settingsSection","setFontSize","toggleSetting","promptLogout","promptDelete","confirmLogout","faq"].includes(action)) return runExtendedAction(action,value);
    switch (action) {
      case "tapHeaderTitle":
        titleTapCount++;
        if (titleTapTimer) clearTimeout(titleTapTimer);
        if (titleTapCount >= 3) {
          titleTapCount = 0;
          state.activeModal = "demo-controls";
          render();
        } else {
          titleTapTimer = setTimeout(() => { titleTapCount = 0; }, 600);
        }
        return;

      case "login":
        if (!state.termsAccepted) return showNotice("Bạn cần đồng ý với điều khoản để tiếp tục.","error");
        if (!/^0\d{9,10}$/.test(state.phone.trim()) || state.otp.trim() !== "123456") {
          return showNotice("Số điện thoại mẫu hoặc OTP không hợp lệ. Mã demo: 123456.", "error");
        }
        logAnalytics("login_success", { phone: "***" });
        return nav("B1");

      case "resendOtp":
        state.otpCountdown = 30;
        return showNotice("Đây là bản xem thử: mã 123456. Không gửi SMS thật.");

      case "goA2":
        return nav("A2");

      case "createProfile":
        if (!state.fullName.trim()) {
          return showNotice("Vui lòng nhập họ và tên bệnh nhân.", "error");
        }
        logAnalytics("profile_created");
        return nav("B1");

      case "startBooking":
        if (m.risk) return nav("C3");
        m = M.initial();
        state.screeningChoice = "";
        state.reasonNote = "";
        logAnalytics("booking_started");
        return nav("C1");

      case "selectPerson":
      case "selectPatient":
        M.choosePerson(m, value);
        state.screeningChoice = "";
        state.reasonNote = "";
        return showNotice("Đã chọn " + personShort() + ". Thông tin lý do khám trước đó đã được xóa.");

      case "nextPerson":
      case "nextPatient":
        if (!M.canBook(m)) {
          return showNotice("Chưa có quyền đặt lịch cho hồ sơ người thân này. Hãy liên hệ phòng khám.", "error");
        }
        logAnalytics("patient_selected", { person: m.person });
        return nav("C2");

      case "chooseGender":
        state.gender = value;
        return render();

      case "chooseReason":
        state.reasonCategory = value;
        return render();

      case "toggleVoiceInput":
        state.voiceRecording = !state.voiceRecording;
        if (state.voiceRecording) {
          showNotice("Đang mô phỏng nhận diện giọng nói tiếng Việt...", "info");
          setTimeout(() => {
            state.reasonNote = (state.reasonNote ? state.reasonNote + " " : "") + "Tôi cảm thấy mệt mỏi và đau đầu vùng thái dương.";
            state.voiceRecording = false;
            render();
          }, 1500);
        }
        return render();

      case "chooseScreening":
      case "selectScreening":
        state.screeningChoice = value;
        M.screening(m, value);
        return render();

      case "nextScreening": {
        m.reason = state.reasonNote || state.reasonCategory;
        const r = M.screening(m, state.screeningChoice);
        if (!r.ok) return showNotice("Vui lòng chọn một tình huống mô phỏng.", "error");
        logAnalytics("screening_completed", { choice: state.screeningChoice });
        return nav(r.next);
      }

      case "callEmergency":
        state.activeModal = "emergency";
        logAnalytics("support_called", { target: config.EMERGENCY_NUMBER });
        return render();

      case "openHospitalMap":
        showNotice("Mở định vị chỉ đường: Bệnh viện CareFlow, 123 Nguyễn Trãi, Q.1.", "info");
        return;

      case "callClinicHotline":
        showNotice("Mô phỏng quay số đường dây nóng phòng khám: " + config.CLINIC_HOTLINE, "info");
        logAnalytics("support_called", { target: "clinic_hotline" });
        return;

      case "callPlaceholder":
        return showNotice("Bản demo không được cấu hình hotline và không thực hiện cuộc gọi thật.");

      case "openContinueConfirmation":
        state.activeModal = "continue-confirm";
        return render();

      case "toggleSafetyAck":
        state.safetyAckChecked = !state.safetyAckChecked;
        return render();

      case "confirmContinueBooking":
        state.activeModal = null;
        state.currentAppointment.safetyAcknowledged = true;
        return showNotice("Phòng khám cần xem lại thông tin trước khi xác nhận lịch. Luồng đặt lịch tự động vẫn tạm dừng.", "error");

      case "chooseMode":
        state.selectedMode = value === "online" ? "online" : "in-person";
        m.mode = value === "online" ? "online" : "onsite";
        return render();

      case "chooseDate":
        state.selectedDate = value;
        m.slot = "";
        state.selectedSlot = "";
        return render();

      case "chooseSlot":
        state.selectedSlot = value;
        m.slot = value;
        m.slotUnavailable = false;
        m.bookingError = "";
        if (state.bookingOutcome === "slot_unavailable") state.bookingOutcome = "success";
        return render();

      case "nextSlot":
        if (!m.slot) return showNotice("Vui lòng chọn giờ khám.", "error");
        logAnalytics("slot_selected", { slot: m.slot });
        return nav("C5");

      case "toggleBookingConsent":
        state.bookingConsent = !state.bookingConsent;
        return render();

      case "togglePolicyAccordion":
        return showNotice("Chính sách: Đổi hoặc hủy lịch trước 2 tiếng hoàn toàn miễn phí.");

      case "confirmBooking": {
        if (!state.bookingConsent) return showNotice("Bạn cần đồng ý với điều khoản và chính sách đổi, hủy lịch.","error");
        state.isSubmitting = true;
        render();
        logAnalytics("booking_submitted");
        if (!m.slot) m.slot = "09:00";
        if (m.screening !== "normal" && m.screening !== "warning") return showNotice("Bạn cần trả lời câu hỏi an toàn trước khi gửi yêu cầu.","error");
        if (!state.bookingConsent) return showNotice("Bạn cần đồng ý với điều khoản và chính sách đổi, hủy lịch.","error");
        const r = M.attemptBooking(m, state.bookingOutcome);
        state.isSubmitting = false;

        if (r.ok) {
          state.currentAppointmentStatus = "confirmed";
          state.lastAppointmentCancelled = false;
          state.currentAppointment.startsAt=state.selectedDate+"T"+(m.slot||"09:00")+":00+07:00";
          logAnalytics("booking_confirmed");
          return nav("C6");
        }
        if (r.code === "SLOT_UNAVAILABLE") {
          return showNotice("Giờ khám không còn trống. Chưa có lịch nào được tạo.", "error");
        }
        if (r.code === "UNCONFIRMED_REQUEST") {
          return showNotice("Chưa xác định đã đặt thành công. Cần kiểm tra trước khi thử lại.", "error");
        }
        if (r.code === "CLINICAL_REVIEW_REQUIRED") {
          return nav("C3");
        }
        if (r.code === "NO_BOOK_PERMISSION") {
          return showNotice("Không có quyền đặt lịch cho hồ sơ người thân.", "error");
        }
        return showNotice("Chưa thể xác nhận đặt lịch: " + r.code, "error");
      }

      case "checkUnknown": {
        const r = M.resolveUnknown(m, false);
        if (r.ok) {
          state.bookingOutcome = "success";
          return showNotice("chưa ghi nhận lịch. Có thể thử gửi lại sau khi kiểm tra.", "success");
        }
        return showNotice("Không có yêu cầu đang chờ kiểm tra.", "error");
      }

      case "copyBookingCode":
        if (navigator.clipboard) {
          navigator.clipboard.writeText(state.lastBookingCode);
        }
        return showNotice("✓ Đã sao chép mã lịch khám: " + state.lastBookingCode, "success");

      case "addToCalendar":
        return showNotice("✓ Đã lưu lịch hẹn vào ứng dụng Lịch trên thiết bị.", "success");

      case "openPreparationGuide":
        return showNotice("Hướng dẫn chuẩn bị: Mang theo CCCD và đơn thuốc đang dùng.");

      case "openFeatureSoonCheckin":
      case "openFeatureSoonQueue":
      case "openFeatureSoonWaiting":
        state.activeModal = "feature-soon";
        return render();

      case "retryConnection":
        showNotice("Đang thử kết nối lại với phòng khám...", "info");
        setTimeout(() => {
          state.activeModal = "feature-soon";
          render();
        }, 1500);
        return;

      case "goBack": {
        const backMap = {
          A2: "A1",
          C1: "B1",
          C2: "C1",
          C4: "C2",
          C5: "C4",
          D2: "D1",
          D3: "D2",
          F2: "B1",
          G2: "B1",
          F4: state.lastHelpFrom
        };
        return nav(backMap[state.currentScreen] || "B1");
      }

      case "openHelp":
        state.lastHelpFrom = state.currentScreen;
        return nav("H1");

      case "goC1": return nav("C1");
      case "goC2": return nav("C2");
      case "goC4": return nav("C4");
      case "goB1": return nav("B1");
      case "goD1": return nav("D1");
      case "goD2": return nav("D2");
      case "goD3": return nav("D3");
      case "goE1": return nav("E1");
      case "goE2": return nav("E2");
      case "goE4": m.video = "unreachable"; return nav("E4");
      case "goF1": return nav("F1");
      case "goF2": return nav("F2");
      case "goF3": return nav("F3");
      case "goF4": state.lastHelpFrom = state.currentScreen; return nav("F4");
      case "goG1": return nav("G1");
      case "goG2": return nav("G2");
      case "goH1":
        return nav("H1");

      case "filterAppointments":
        state.appointmentTab=Number(value);
        return render();

      case "goG3": return nav("G3");
      case "goScreen": return nav(value);

      case "chooseCancelReason":
        state.cancelReason = value;
        return render();

      case "cancelAppointment":
        state.activeModal="cancel-confirm";
        return render();

      case "confirmCancelAppointment":
        state.activeModal=null;
        state.lastAppointmentCancelled = true;
        state.currentAppointmentStatus = "cancelled";
        if (m.appointment) m.appointment.status = "cancelled";
        logAnalytics("cancellation_completed");
        showNotice("Đã mô phỏng hủy và ghi lý do. Phần mềm thật cần xác nhận từ máy chủ.", "success");
        return nav("D2");

      case "checkin":
        m.queue = "checked_in";
        state.currentAppointmentStatus = "arrived";
        showNotice("Check-in đã được mô phỏng. Hai loại số thứ tự vẫn tách biệt.", "success");
        return nav("E1");

      case "joinVideo":
        m.video = "connected";
        return nav("E3");

      case "dropCall":
        m.video = "dropped";
        return nav("E4");

      case "retryVideo":
        m.video = "waiting";
        return nav("E2");

      case "endVideo":
        return nav("D2");

      case "toggleMic":
        state.videoMic = !state.videoMic;
        return render();

      case "toggleCamera":
        state.videoCamera = !state.videoCamera;
        return render();

      case "beginPayment":
        if(m.payment==="unpaid")M.startPayment(m);
        { const pid=m.person==="self"?"patient-self":"patient-relative"; const rec=extra.byPatient[pid]||(extra.byPatient[pid]={messages:[],symptom:"",lab:"ordered",labAppointment:false,paymentMethod:"qr",paymentStatus:"unpaid",paymentDue:"",receipt:false}); rec.paymentStatus=m.payment; }
        return showNotice("Đang xác nhận thanh toán. Quét QR không tự thành đã thu.", "info");

      case "viewResult":
        if (!M.canViewResults(m)) {
          return showNotice("Hồ sơ người thân chưa có quyền xem kết quả. Thông tin được giữ riêng tư.", "error");
        }
        return showNotice("Đây là bản mẫu không có kết quả y tế thật. Trạng thái hiện tại: " + m.result, "info");

      case "notificationResult":
        if (!M.canViewResults(m)) {
          return showNotice("Không có quyền xem kết quả của hồ sơ này. Không thể mở từ thông báo.", "error");
        }
        return nav("F2");

      case "switchResultTab":
        state.activeResultTab = value;
        return render();

      case "requestCallback":
        M.requestCallback(m);
        return showNotice("Đã nhận yêu cầu (demo). Không có ticket thật.", "success");

      case "bookSelf":
        M.choosePerson(m, "self");
        state.screeningChoice = "";
        state.reasonNote = "";
        return nav("C1");

      case "bookRelative":
        M.choosePerson(m, "relative");
        state.screeningChoice = "";
        state.reasonNote = "";
        return nav("C1");

      case "toggleRelativeBook":
        m.canBookRelative = !m.canBookRelative;
        showNotice(`Quyền đặt lịch cho người thân: ${m.canBookRelative ? "Có quyền đặt hộ" : "Không có quyền đặt hộ"}.`);
        return render();

      case "toggleLargeText":
        state.largeText = !state.largeText;
        document.body.classList.toggle("large-text", state.largeText);
        showNotice(`Chế độ cỡ chữ lớn: ${state.largeText ? "Đã bật" : "Đã tắt"}.`);
        return render();

      case "toggleOffline":
        state.isOffline = !state.isOffline;
        showNotice(`Chế độ ngoại tuyến: ${state.isOffline ? "BẬT (dữ liệu lưu local)" : "TẮT (kết nối bình thường)"}.`);
        return render();

      case "toggleTerms":
        state.termsAccepted = !state.termsAccepted;
        return render();

      case "demoSetStatus":
        state.currentAppointmentStatus = value;
        showNotice(`[Demo Controls] Đã chuyển trạng thái lượt khám sang: ${value}`);
        return render();

      case "resetMockData":
        resetScenario("self");
        showNotice("[Demo Controls] Đã đặt lại toàn bộ dữ liệu mẫu.");
        return;

      case "closeModal":
        state.activeModal = null;
        return render();

      case "markAllRead":
        state.notifications.forEach(n => n.isRead = true);
        return render();

      case "runSmokeTests":
        return runSmokeTests();

      default:
        return showNotice("Hành động: " + action);
    }
  }

  // Quick Smoke Tests for Inspector
  function runSmokeTests() {
    const cases = [];
    function assert(name, fn) {
      try {
        if (!fn()) throw new Error("Assertion failed");
        cases.push([name, true]);
      } catch (e) {
        cases.push([name, false]);
      }
    }

    assert("Có đủ 23 màn hình", () => M.SCREENS.length === 23);
    assert("Đặt lịch bình thường", () => {
      let s = M.initial();
      M.screening(s, "normal");
      return M.attemptBooking(s).ok;
    });
    assert("Đặt hộ đúng patientId", () => {
      let s = M.initial();
      M.choosePerson(s, "relative");
      M.screening(s, "normal");
      s.slot = "14:30";
      return M.attemptBooking(s).appointment?.patientId === "patient-relative";
    });
    assert("Đặt hộ không tự xem kết quả", () => {
      let s = M.initial();
      M.choosePerson(s, "relative");
      return !M.canViewResults(s);
    });
    assert("Đã thu hồi quyền đặt hộ bị chặn", () => {
      let s = M.initial();
      M.choosePerson(s, "relative");
      s.canBookRelative = false;
      M.screening(s, "normal");
      s.slot = "09:00";
      return M.attemptBooking(s).code === "NO_BOOK_PERMISSION";
    });
    assert("Có cảnh báo không mở C4/C6", () => {
      let s = M.initial();
      M.screening(s, "warning");
      return !M.mayEnter(s, "C4") && !M.mayEnter(s, "C6");
    });
    assert("Có cảnh báo không gửi booking", () => {
      let s = M.initial();
      M.screening(s, "warning");
      return M.attemptBooking(s).code === "CLINICAL_REVIEW_REQUIRED";
    });
    assert("Quay lại đổi câu trả lời không bỏ qua cảnh báo", () => {
      let s = M.initial();
      M.screening(s, "warning");
      return M.screening(s, "normal").next === "C3";
    });
    assert("Hết slot không tạo appointment", () => {
      let s = M.initial();
      M.screening(s, "normal");
      return M.attemptBooking(s, "slot_unavailable").code === "SLOT_UNAVAILABLE" && !s.appointment;
    });
    assert("Mất mạng không hiện thành công", () => {
      let s = M.initial();
      M.screening(s, "normal");
      M.attemptBooking(s, "network_unknown");
      return !s.appointment && !M.mayEnter(s, "C6");
    });
    assert("Không gửi booking trùng khi chưa rõ", () => {
      let s = M.initial();
      M.screening(s, "normal");
      M.attemptBooking(s, "network_unknown");
      return M.attemptBooking(s).code === "UNCONFIRMED_REQUEST";
    });
    assert("Chuyển người xóa dữ liệu sàng lọc", () => {
      let s = M.initial();
      M.screening(s, "warning");
      s.reason = "test";
      M.choosePerson(s, "relative");
      return !s.risk && s.reason === "";
    });
    assert("QR không đồng nghĩa đã thu", () => {
      let s = M.initial();
      M.startPayment(s);
      return s.payment === "pending_reconciliation";
    });
    assert("Doctor review không đồng nghĩa informed", () => {
      let s = M.initial();
      M.doctorReviewed(s);
      return s.communication === "pending";
    });
    assert("Deep link sai người bị chặn", () => !M.mayOpenResultLink(M.initial(), "patient-relative"));

    const success = cases.filter(x => x[1]).length;
    $("qa-results").innerHTML = `<p class="chip ${success === cases.length ? "success" : "warning"}" style="margin-bottom: 8px;">${success}/${cases.length} PASS</p>` +
      cases.map(x => `<p class="${x[1] ? "qa-pass" : "qa-fail"}">${x[1] ? "✓" : "✗"} ${esc(x[0])}</p>`).join("");
    $("announcer").textContent = `Kiểm thử ${success} trên ${cases.length} đạt.`;
  }

  // Event Listeners
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action],[data-screen],[data-scenario]");
    if (!el) return;
    if (el.dataset.scenario) return resetScenario(el.dataset.scenario);
    if (el.dataset.screen) return nav(el.dataset.screen);
    if (el.dataset.action) return handleAction(el.dataset.action, el.dataset.value);
  });

  document.addEventListener("input", (e) => {
    if(e.target.dataset.field==="otp"){e.target.value=e.target.value.replace(/\D/g,"").slice(0,6);document.querySelectorAll("[data-otp-slot]").forEach((slot,i)=>slot.textContent=e.target.value[i]||"·");}
    if (e.target.dataset.field) {
      const field = e.target.dataset.field;
      if (Object.prototype.hasOwnProperty.call(state, field)) {
        state[field] = e.target.value;
      }
    }
  });

  $("mobile-screen-picker").addEventListener("change",e=>nav(e.target.value));

  $("demo-outcome").addEventListener("change", (e) => {
    state.bookingOutcome = e.target.value;
    render();
  });

  $("status-override").addEventListener("change", (e) => {
    state.currentAppointmentStatus = e.target.value;
    render();
  });

  // Start with self booking scenario
  resetScenario("self");
})();
