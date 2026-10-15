/* CareFlow Vietnamese patient-facing UI copy. Source: 12-ui-copy-vi.md. Placeholders require clinic approval. */
(function(root){'use strict';const data={
  "meta": {
    "locale": "vi-VN",
    "voice": "Thân thiện, rõ ràng như lễ tân",
    "source": "12-ui-copy-vi.md",
    "status": "DRAFT — MEDICAL/LEGAL APPROVAL REQUIRED FOR BRACKETED CONTENT"
  },
  "common": {
    "continue": "Tiếp tục",
    "callClinic": "Gọi phòng khám",
    "later": "Để sau",
    "retry": "Thử lại",
    "sending": "Đang gửi…",
    "loading": "Đang tải…",
    "comingSoon": "Sắp ra mắt",
    "noNetwork": "Mất mạng. Nội dung bạn nhập vẫn còn.",
    "offline": "Đang mất mạng · Dữ liệu lúc [09:12]",
    "error": "Chưa gửi được. Bạn thử lại hoặc gọi phòng khám.",
    "notAvailable": "Lịch này không còn nữa. Bạn xem lại danh sách lịch hẹn nhé.",
    "paymentAmount": "350.000 ₫",
    "clinicHours": "[Thứ Hai đến Thứ Bảy, 07:30–17:00]",
    "replyTime": "[30 phút]",
    "reopenTime": "[07:30]",
    "emergency": "115"
  },
  "statuses": {
    "pending": [
      "Chờ phòng khám xác nhận",
      "Lễ tân đang xử lý"
    ],
    "confirmed": [
      "Đã xác nhận",
      "Đang chờ bạn"
    ],
    "reminder": [
      "Sắp đến giờ khám",
      "Đang chờ bạn"
    ],
    "arrived": [
      "Bạn đã đến",
      "Lễ tân đang xử lý"
    ],
    "waiting": [
      "Đang chờ khám",
      "Bác sĩ chuẩn bị gọi bạn"
    ],
    "delayed": [
      "Bác sĩ đang trễ",
      "Phòng khám đang sắp xếp"
    ],
    "online-waiting": [
      "Chờ bác sĩ gọi",
      "Bác sĩ chuẩn bị gọi bạn"
    ],
    "connection-failed": [
      "Chưa kết nối được",
      "Phòng khám đang xử lý"
    ],
    "results-pending": [
      "Đang chờ kết quả",
      "Phòng xét nghiệm"
    ],
    "results-ready": [
      "Có kết quả",
      "Bác sĩ chuẩn bị xem"
    ],
    "reviewed": [
      "Bác sĩ đã xem",
      "Đang chờ bạn"
    ],
    "cancelled": [
      "Đã hủy",
      ""
    ],
    "no-show": [
      "Chưa đến khám",
      ""
    ]
  },
  "notifications": {
    "confirmed": [
      "Phòng khám đã xác nhận lịch",
      "Mở app để xem chi tiết"
    ],
    "oneDay": [
      "Mai bạn có lịch khám",
      "Xem hướng dẫn chuẩn bị"
    ],
    "twoHours": [
      "2 giờ nữa đến giờ khám",
      "Sẵn sàng check-in"
    ],
    "checkIn": [
      "Bạn có thể check-in",
      "Mở app khi đến phòng khám"
    ],
    "queue": [
      "Sắp đến lượt bạn",
      "Mở app để xem số thứ tự"
    ],
    "doctor": [
      "Bác sĩ đã sẵn sàng",
      "Vào phòng chờ ngay"
    ],
    "disconnect": [
      "Chưa kết nối được",
      "Mở app để chọn cách tiếp theo"
    ],
    "results": [
      "Có kết quả mới",
      "Mở app để xem"
    ],
    "reply": [
      "Phòng khám đã trả lời",
      "Mở app để đọc"
    ],
    "payment": [
      "Còn một khoản cần thanh toán",
      "Mở app để xem"
    ]
  },
  "screens": {
    "A1": {
      "title": "Chào mừng đến CareFlow",
      "description": "Đặt lịch khám, theo dõi lịch hẹn và xem kết quả ngay trên điện thoại.",
      "phone": "Số điện thoại",
      "phoneHint": "Nhập số điện thoại của bạn",
      "otp": "Nhập mã 6 số vừa gửi đến bạn",
      "resend": "Gửi lại mã",
      "otpWrong": "Mã chưa đúng. Bạn thử nhập lại nhé.",
      "otpExpired": "Mã đã hết hạn. Bạn lấy mã mới nhé.",
      "cta": "Tiếp tục",
      "help": "Cần giúp? Gọi phòng khám"
    },
    "A2": {
      "title": "Thông tin của bạn",
      "description": "Chỉ cần vài thông tin để tạo hồ sơ. Phần còn lại bạn bổ sung sau.",
      "fullName": "Họ và tên",
      "dob": "Ngày sinh",
      "gender": "Giới tính",
      "nameHint": "Nhập đúng như trên giấy tờ để lúc đến khám không phải chỉnh lại.",
      "cta": "Tạo hồ sơ"
    },
    "B1": {
      "greeting": "Xin chào, [Tên]",
      "context": "Đang đặt cho: Bạn",
      "hero": "Lịch khám sắp tới",
      "cta": "Đặt lịch khám",
      "tasks": "Việc cần làm",
      "empty": "Chưa có lịch khám nào. Đặt lịch để phòng khám nhắc giờ cho bạn."
    },
    "C1": {
      "title": "Ai đi khám?",
      "self": "Bạn",
      "add": "Thêm người thân",
      "cta": "Tiếp tục"
    },
    "C2": {
      "title": "Lý do khám",
      "reason": "Bạn đến khám vì sao?",
      "hint": "Ví dụ: ho 2 ngày, hơi sốt",
      "onset": "Bắt đầu từ khi nào?",
      "screening": "Bạn có đang gặp dấu hiệu nào dưới đây không?",
      "alertPlaceholder": "[Dấu hiệu cảnh báo do bác sĩ phòng khám xác định]",
      "none": "Không có",
      "yes": "Có",
      "required": "Bạn mô tả ngắn lý do khám để bác sĩ chuẩn bị nhé.",
      "cta": "Tiếp tục"
    },
    "C3": {
      "title": "Bạn nên đến cơ sở y tế ngay",
      "explanation": "[Giải thích ngắn nguy cơ và việc cần làm, do bác sĩ phòng khám duyệt]",
      "emergency": "Gọi cấp cứu 115",
      "clinic": "Gọi phòng khám",
      "continue": "Tôi hiểu rủi ro và vẫn muốn đặt lịch",
      "review": "Phòng khám sẽ xem lại thông tin của bạn trước khi xác nhận lịch.",
      "ack": "Tôi hiểu và muốn tiếp tục",
      "cta": "Tiếp tục đặt lịch",
      "safety": "Luồng đặt lịch tự động tạm dừng. Nhân viên y tế có thẩm quyền cần đánh giá trước khi tiếp tục."
    },
    "C4": {
      "title": "Chọn ngày giờ khám",
      "onsite": "Trực tiếp",
      "online": "Trực tuyến",
      "doctor": "Bác sĩ: Phòng khám sắp xếp",
      "full": "Hết chỗ",
      "fullDay": "Ngày này đã kín lịch. Bạn thử ngày khác nhé.",
      "help": "Không thấy giờ phù hợp? Nhờ phòng khám gợi ý",
      "cta": "Chọn giờ này"
    },
    "C5": {
      "title": "Kiểm tra lại trước khi đặt",
      "person": "Người khám",
      "reason": "Lý do",
      "mode": "Hình thức",
      "time": "Thời gian",
      "fee": "Phí dự kiến",
      "consent": "Tôi đồng ý với điều khoản và chính sách đổi, hủy lịch",
      "cta": "Gửi yêu cầu đặt lịch"
    },
    "C6": {
      "pending": "Đã gửi yêu cầu đặt lịch",
      "pendingDescription": "Phòng khám sẽ xác nhận trong khoảng [30 phút]. Có kết quả, app sẽ báo cho bạn.",
      "confirmed": "Lịch khám đã xác nhận",
      "confirmedDescription": "Hẹn gặp bạn lúc [Giờ khám] · [Ngày khám].",
      "calendar": "Thêm vào lịch điện thoại",
      "cta": "Xem lịch hẹn"
    },
    "D1": {
      "title": "Lịch hẹn",
      "upcoming": "Sắp tới",
      "past": "Đã khám",
      "cancelled": "Đã hủy",
      "empty": "Chưa có lịch khám nào. Lịch bạn đặt sẽ hiện ở đây."
    },
    "D2": {
      "title": "Chi tiết lịch hẹn",
      "pending": "Phòng khám chưa xác nhận lịch này",
      "confirmed": "Lịch đã xác nhận",
      "timeline": [
        "Đã gửi yêu cầu",
        "Phòng khám xác nhận",
        "Đến phòng khám",
        "Gặp bác sĩ",
        "Kết quả và hướng dẫn"
      ],
      "cta": [
        "Xem hướng dẫn",
        "Check-in",
        "Vào phòng chờ",
        "Thanh toán",
        "Xem kết quả",
        "Đặt lịch tái khám"
      ],
      "change": "Đổi lịch",
      "cancel": "Hủy lịch",
      "call": "Gọi phòng khám"
    },
    "D3": {
      "title": "Đổi hoặc hủy lịch",
      "reason": "Lý do của bạn là gì?",
      "reasons": [
        "Bận việc đột xuất",
        "Đã đỡ hơn",
        "Muốn đổi giờ khác",
        "Lý do khác"
      ],
      "policy": "[Chính sách đổi, hủy của phòng khám]",
      "cta": "Đổi sang giờ khác",
      "cancel": "Hủy lịch",
      "confirmTitle": "Hủy lịch khám này?",
      "keep": "Giữ lịch",
      "cancelled": "Đã hủy lịch. Cần khám lại, bạn đặt lịch mới bất cứ lúc nào.",
      "book": "Đặt lịch mới"
    },
    "E1": {
      "title": "Check-in và số thứ tự",
      "unarrived": "Bạn đã đến phòng khám chưa?",
      "arrival": "Tôi đã đến",
      "qr": "Quét mã QR tại quầy",
      "tooEarly": "Chưa đến giờ check-in. Bạn check-in được từ [08:30].",
      "number": "Số thứ tự của bạn",
      "calling": "Đang gọi",
      "updated": "Cập nhật [09:12]",
      "note": "Đến lượt, app sẽ báo ngay. Bạn không cần mở máy chờ.",
      "called": "Đến lượt bạn rồi.",
      "calledBody": "Mời bạn vào [Phòng khám số 3].",
      "delay": "Bác sĩ đang trễ khoảng [20 phút].",
      "late": "Bạn đến trễ so với giờ hẹn.",
      "latePolicy": "[Chính sách đến trễ]",
      "support": "Tôi cần hỗ trợ"
    },
    "E2": {
      "title": "Kiểm tra trước khi khám online",
      "description": "Thử nhanh camera, micro và mạng để buổi khám không bị gián đoạn.",
      "camera": "Camera",
      "microphone": "Micro",
      "network": "Mạng",
      "notChecked": "Chưa kiểm tra",
      "checking": "Đang kiểm tra",
      "ok": "Ổn",
      "enable": "Cần bật",
      "why": "Vì sao cần camera và micro?",
      "permission": "Bác sĩ cần nhìn và nghe bạn để khám từ xa. Hình ảnh và âm thanh chỉ dùng trong buổi khám này.",
      "allow": "Cho phép",
      "later": "Để sau",
      "prep": [
        "Chọn nơi yên tĩnh, đủ sáng",
        "Chuẩn bị sổ khám và đơn thuốc cũ",
        "Sạc đầy pin hoặc cắm sạc"
      ],
      "cta": "Vào phòng chờ",
      "call": "Khám bằng cuộc gọi thường",
      "waiting": "Bạn đang ở phòng chờ.",
      "waitingHint": "Bác sĩ sẽ vào trong khoảng [5 phút].",
      "denied": "Chưa bật camera hoặc micro.",
      "deniedHint": "Vào Cài đặt, chọn CareFlow rồi bật Camera và Micro.",
      "callback": "Nhờ phòng khám gọi lại"
    },
    "E3": {
      "connecting": "Đang kết nối với bác sĩ…",
      "weak": "Mạng yếu. Hình ảnh đã tắt để giữ tiếng.",
      "video": "Bật lại hình ảnh",
      "reconnect": "Đang kết nối lại… [12 giây]",
      "audio": "Chuyển sang gọi thoại",
      "left": "Bác sĩ rời đi một lát. Bạn chờ thêm chút nhé.",
      "end": "Kết thúc buổi khám?",
      "stay": "Tiếp tục khám",
      "finish": "Kết thúc",
      "done": "Buổi khám đã kết thúc.",
      "instructions": "Xem hướng dẫn",
      "help": "Cần hỗ trợ khẩn",
      "issue": "Báo sự cố kết nối"
    },
    "E4": {
      "title": "Chưa kết nối được với bác sĩ",
      "description": "Lịch khám vẫn còn nguyên. Bạn muốn làm gì tiếp?",
      "retry": "Thử lại ngay",
      "callback": "Nhờ phòng khám gọi lại",
      "callbackHint": "Phòng khám gọi vào số của bạn trong khoảng [10 phút]",
      "rebook": "Hẹn buổi online khác",
      "onsite": "Đổi sang khám trực tiếp",
      "autotry": "Tự thử lại sau [20 giây]",
      "stop": "Dừng",
      "sent": "Đã gửi yêu cầu. Phòng khám sẽ gọi lại cho bạn."
    },
    "F1": {
      "title": "Thanh toán",
      "total": "Tổng cộng",
      "amount": "350.000 ₫",
      "unpaid": "Chưa thanh toán",
      "methods": "Chọn cách thanh toán",
      "qr": "Chuyển khoản QR",
      "qrHint": "Quét mã bằng app ngân hàng",
      "counter": "Thanh toán tại quầy",
      "counterHint": "Tiền mặt hoặc thẻ",
      "pharmacy": "Thanh toán tại nhà thuốc",
      "pharmacyHint": "Cùng lúc nhận thuốc",
      "cta": "Thanh toán 350.000 ₫",
      "later": "Thanh toán sau",
      "scan": "Quét mã để chuyển khoản",
      "copy": "Sao chép",
      "transferred": "Tôi đã chuyển khoản",
      "checking": "Đang kiểm tra khoản chuyển…",
      "paid": "Đã thanh toán.",
      "receipt": "Lưu biên lai",
      "failed": "Chưa nhận được tiền. Bạn thử lại hoặc chọn cách khác.",
      "deferDate": "Chọn ngày bạn sẽ thanh toán",
      "deferReason": "Lý do"
    },
    "F2": {
      "title": "Kết quả và hướng dẫn",
      "conclusion": "Kết luận của bác sĩ",
      "prescription": "Đơn thuốc",
      "labs": "Kết quả xét nghiệm",
      "pending": "Kết quả đang được xử lý. Có kết quả, app sẽ báo cho bạn.",
      "awaitingDoctor": "Bác sĩ chưa xem kết quả này.",
      "medicine": "Tên thuốc · Cách dùng",
      "help": "Có thắc mắc? Hỏi phòng khám",
      "cta": "Đặt lịch tái khám"
    },
    "F3": {
      "title": "Xét nghiệm và chụp chiếu",
      "before": "Bác sĩ đề nghị làm xét nghiệm trước buổi khám.",
      "after": "Bác sĩ chỉ định thêm xét nghiệm.",
      "statuses": [
        "Cần đặt hẹn",
        "Đã hẹn",
        "Có kết quả",
        "Chờ bác sĩ xem",
        "Bác sĩ đã xem"
      ],
      "prep": "Cần chuẩn bị",
      "where": "Làm ở đâu",
      "duration": "Mất bao lâu",
      "cta": "Đặt hẹn xét nghiệm",
      "empty": "Chưa có chỉ định nào. Bác sĩ chỉ định xong, bạn sẽ thấy ở đây.",
      "upload": "Có kết quả từ nơi khác? Tải lên",
      "fileError": "Tệp quá lớn hoặc không đúng định dạng. Chọn ảnh hoặc PDF dưới 10 MB."
    },
    "F4": {
      "title": "Hỏi phòng khám",
      "tabs": [
        "Nhắn tin",
        "Báo triệu chứng",
        "Gọi lại"
      ],
      "emergency": "Khẩn cấp? Gọi 115",
      "reply": "Phòng khám thường trả lời trong khoảng [30 phút].",
      "starter": [
        "Hỏi về đơn thuốc",
        "Cách dùng thuốc",
        "Triệu chứng mới hoặc chưa đỡ"
      ],
      "input": "Nhập tin nhắn",
      "afterHours": "Phòng khám đang nghỉ. Tin của bạn sẽ được trả lời lúc [07:30] sáng mai.",
      "symptoms": "Bạn đang gặp chuyện gì?",
      "severity": [
        "Nhẹ",
        "Vừa",
        "Nặng"
      ],
      "send": "Gửi cho phòng khám",
      "sent": "Phòng khám đã nhận tin của bạn.",
      "callback": "Phòng khám gọi lại về việc gì?",
      "request": "Gửi yêu cầu gọi lại"
    },
    "G1": {
      "title": "Hồ sơ",
      "active": "Đang đặt lịch cho",
      "personal": "Thông tin cá nhân",
      "family": "Người thân",
      "history": "Lịch sử khám",
      "missing": "Còn thiếu thông tin",
      "add": "Bổ sung",
      "fields": [
        "Họ và tên",
        "Quan hệ",
        "Ngày sinh",
        "Giới tính",
        "Số điện thoại"
      ],
      "consent": "Tôi có quyền đặt lịch và xem thông tin của người này",
      "save": "Lưu",
      "remove": "Bỏ [Tên] khỏi danh sách?",
      "empty": "Bạn chưa thêm người thân. Thêm để đặt lịch hộ nhanh hơn.",
      "duplicate": "Hồ sơ này có vẻ đã có sẵn. Bạn gọi phòng khám để được hỗ trợ."
    },
    "G2": {
      "title": "Thông báo",
      "empty": "Chưa có thông báo nào. Nhắc lịch và tin từ phòng khám sẽ hiện ở đây."
    },
    "G3": {
      "title": "Cài đặt",
      "groups": [
        "Thông báo",
        "Hiển thị",
        "Ngôn ngữ",
        "Quyền riêng tư và bảo mật",
        "Về ứng dụng"
      ],
      "notifications": [
        "Thông báo trên điện thoại",
        "Tin nhắn SMS hoặc Zalo",
        "Nhắc trước 1 ngày",
        "Nhắc trước 2 giờ",
        "Ẩn nội dung nhạy cảm trên màn hình khóa"
      ],
      "font": [
        "Mặc định",
        "Lớn",
        "Rất lớn"
      ],
      "optout": "Tắt hết thông báo, bạn có thể lỡ nhắc lịch khám.",
      "logout": "Đăng xuất khỏi tài khoản?",
      "delete": "Xóa tài khoản?",
      "deleteHint": "Thông tin tài khoản sẽ bị xóa. Hồ sơ bệnh án có thể được giữ theo quy định. [Pháp lý duyệt]"
    },
    "H1": {
      "title": "Hỗ trợ",
      "hero": "Cần giúp gì?",
      "hours": "Phòng khám làm việc [Thứ Hai đến Thứ Bảy, 07:30–17:00].",
      "call": "Gọi phòng khám",
      "message": "Nhắn tin",
      "callback": "Nhờ gọi lại",
      "emergency": "Khẩn cấp? Gọi 115",
      "search": "Tìm câu hỏi",
      "empty": "Không thấy câu hỏi phù hợp. Bạn nhắn tin hoặc gọi phòng khám nhé.",
      "afterHours": "Phòng khám đang nghỉ. Bạn có thể nhắn tin, phòng khám trả lời vào [07:30] sáng mai."
    }
  }
};
root.CareFlowCopy=Object.freeze(data);
if(typeof module!=='undefined'&&module.exports)module.exports=data;
})(typeof window!=='undefined'?window:globalThis);
