/* CareFlow contextual experience layer — real Unsplash photography, synthetic UI-only guidance.
   It never changes medical state, booking transitions, payments or personal records. */
(function installCareFlowExperience(root) {
  'use strict';
  const IMG = Object.freeze({
    appointment: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1100&q=78',
    consultation: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1100&q=78',
    radiology: 'https://images.unsplash.com/photo-1666214277730-e9c7e755e5a3?auto=format&fit=crop&w=1100&q=78',
    clinician: 'https://images.unsplash.com/photo-1758691462651-611d730c5272?auto=format&fit=crop&w=1100&q=78'
  });
  const esc = (value) => String(value == null ? '' : value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
  const icon = (name, size = 18) => root.CareFlowIcon(name, size);
  const link = (label, to, subtle = false) =>
    '<button type="button" class="cfx-link' + (subtle ? ' is-subtle' : '') +
    '" data-action="go" data-to="' + esc(to) + '">' + esc(label) +
    icon('arrow-right', 16) + '</button>';
  const tip = (name, title, description, to, label) =>
    '<div class="cfx-tile"><span class="cfx-tile-icon">' + icon(name, 21) +
    '</span><strong>' + esc(title) + '</strong><p>' + esc(description) +
    '</p>' + (to ? link(label || 'Xem thêm', to, true) : '') + '</div>';
  const section = (eyebrow, title, html, description = '') =>
    '<section class="cfx-section" aria-label="' + esc(title) + '">' +
    '<div class="cfx-section-heading"><span>' + esc(eyebrow) + '</span><h2>' +
    esc(title) + '</h2>' + (description ? '<p>' + esc(description) + '</p>' : '') +
    '</div>' + html + '</section>';
  const grid = (...cards) => '<div class="cfx-grid">' + cards.join('') + '</div>';
  const details = (title, content, subtitle = '') =>
    '<details class="cfx-disclosure"><summary><span>' +
    icon('info', 19) + '</span><span><strong>' + esc(title) + '</strong>' +
    (subtitle ? '<small>' + esc(subtitle) + '</small>' : '') +
    '</span>' + icon('chevron-right', 18) + '</summary><div class="cfx-disclosure-body">' +
    content + '</div></details>';
  const list = (...items) => '<ul class="cfx-bullets">' +
    items.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>';
  const photo = (key, title, text, to, label) =>
    '<div class="cfx-photo-card"><img src="' + IMG[key] +
    '" alt="Ảnh minh họa hoạt động chăm sóc sức khỏe từ Unsplash" loading="lazy" ' +
    'width="560" height="360" data-cfx-fallback="./assets/images/clinic-reception.webp">' +
    '<div class="cfx-photo-copy"><span>Góc chăm sóc</span><strong>' +
    esc(title) + '</strong><p>' + esc(text) + '</p>' +
    (to ? link(label || 'Xem thêm', to) : '') + '</div></div>';
  const checklist = (key, title, items) =>
    '<div class="cfx-checklist" data-cfx-checklist="' + esc(key) + '">' +
    '<div class="cfx-check-head"><strong>' + esc(title) + '</strong>' +
    '<span class="cfx-check-count" role="status" aria-live="polite">0/' + items.length +
    ' đã chuẩn bị</span></div>' +
    items.map((item, i) =>
      '<label class="cfx-check-row"><input type="checkbox" data-cfx-index="' + i +
      '"><span class="cfx-check-mark" aria-hidden="true">' + icon('check', 14) +
      '</span><span>' + esc(item) + '</span></label>').join('') +
    '<p class="cfx-check-foot">Danh sách tự kiểm tra trên thiết bị, không gửi đến phòng khám.</p></div>';
  const band = (text, to, action) =>
    '<div class="cfx-action-band"><span>' + icon('headphones', 20) +
    '</span><p>' + esc(text) + '</p>' + link(action || 'Hỗ trợ', to || 'K5') + '</div>';

  const panels = {
    B1: () => section('CHỌN CÁCH CHĂM SÓC', 'Tiện ích dành cho bạn',
      grid(tip('user', 'Khám cho người thân', 'Chọn đúng hồ sơ trước khi gửi lịch khám.', 'K2', 'Xem hồ sơ'),
        tip('message-circle', 'Có câu hỏi?', 'Hỏi phòng khám về giờ hẹn và chuẩn bị trước khám.', 'K5', 'Liên hệ'))),
    C1: () => section('BẮT ĐẦU ĐẶT LỊCH', 'Chọn đúng người đi khám',
      photo('consultation', 'Một nơi cho cả gia đình',
        'Hồ sơ của mỗi người được tách riêng để hạn chế nhầm lịch hẹn và kết quả.', 'K2', 'Quản lý hồ sơ') +
      details('Trước khi đặt cho người thân',
        list('Kiểm tra tên và ngày sinh của người đi khám.',
          'Chỉ xem kết quả của người mà bạn được cấp quyền.',
          'Bạn có thể thay đổi người đi khám ở bước này.'))),
    C2: () => section('HỖ TRỢ KHAI TRIỆU CHỨNG', 'Giúp bác sĩ hiểu rõ hơn',
      grid(tip('clock', 'Bắt đầu khi nào?', 'Ghi lại thời điểm bắt đầu và triệu chứng thay đổi ra sao.'),
        tip('document', 'Đã dùng gì?', 'Nếu có, kể tên thuốc và biện pháp đã thực hiện.')) +
      details('Gợi ý viết lý do khám',
        list('Mô tả vấn đề chính bằng lời của bạn.',
          'Có thể bổ sung thời gian, mức độ ảnh hưởng và bệnh sử liên quan.',
          'Đừng bỏ qua bước kiểm tra dấu hiệu nguy hiểm tiếp theo.'))),
    C5: () => section('TRONG LÚC CHỜ PHẢN HỒI', 'Điều gì diễn ra tiếp theo?',
      grid(tip('shield', 'Phòng khám xem xét', 'Hình thức khám sẽ được xác nhận theo nhu cầu và thông tin đã khai.'),
        tip('headphones', 'Cần trao đổi?', 'Hãy liên hệ trực tiếp nếu tình trạng hoặc yêu cầu thay đổi.', 'K5', 'Hỗ trợ'))),
    C6: () => section('SO SÁNH NHANH', 'Chọn hình thức phù hợp',
      grid(tip('map-pin', 'Tại phòng khám', 'Phù hợp khi cần khám trực tiếp, thăm khám và làm chỉ định tại cơ sở.'),
        tip('video', 'Trực tuyến', 'Cần đường truyền ổn định và không gian đủ riêng tư.')) +
      details('Không chắc nên chọn cách nào?',
        'Phòng khám có thể cần xem xét lại hình thức khám dựa trên thông tin sức khỏe đã cung cấp. ' +
        'Khám trực tuyến không thay thế cấp cứu.')),
    C7: () => section('ĐẶT LỊCH CHỦ ĐỘNG', 'Trước khi chọn giờ',
      grid(tip('calendar', 'Kiểm tra lịch', 'Chọn ngày thuận tiện để chuẩn bị và di chuyển.'),
        tip('clock', 'Giờ có thể thay đổi', 'Đặt lịch chỉ hoàn tất theo trạng thái xác nhận hiển thị trong ứng dụng.'))),
    C8: () => section('KIỂM TRA LẦN CUỐI', 'Sau khi gửi yêu cầu',
      details('Phòng khám sẽ phản hồi thế nào?',
        list('Theo dõi trạng thái phiếu khám và thông báo trong ứng dụng.',
          'Nếu giờ vừa được chọn không còn, bạn có thể chọn lại.',
          'Không chuyển khoản khi chưa có chỉ dẫn thanh toán rõ ràng.'))),
    C9: () => section('TIẾP TỤC HÀNH TRÌNH', 'Bạn có thể làm ngay',
      grid(tip('calendar', 'Theo dõi lịch khám', 'Xem trạng thái yêu cầu và phiếu khám của bạn.', 'D1', 'Mở lịch hẹn'),
        tip('headphones', 'Hỏi phòng khám', 'Trao đổi khi muốn đổi giờ hoặc cần chuẩn bị đặc biệt.', 'K5', 'Liên hệ'))),
    D1: () => section('QUẢN LÝ LỊCH KHÁM', 'Những việc thường cần',
      grid(tip('calendar-plus', 'Đặt lịch tiếp theo', 'Tạo yêu cầu mới cho bản thân hoặc người thân.', 'C1', 'Đặt lịch'),
        tip('user', 'Kiểm tra hồ sơ', 'Mỗi người có lịch khám và kết quả riêng.', 'K2', 'Hồ sơ'))),
    D3: () => section('ĐỔI LỊCH', 'Cần lưu ý',
      details('Lịch mới chưa chắc được xác nhận',
        'Kiểm tra trạng thái phiếu khám sau khi gửi yêu cầu đổi giờ. ' +
        'Nếu chưa có xác nhận, hãy liên hệ phòng khám.')),
    D4: () => section('HỦY LỊCH', 'Trước khi quyết định',
      details('Nếu vẫn muốn đi khám',
        'Bạn có thể chọn quay lại phiếu khám để đổi lịch thay vì hủy. ' +
        'Tình trạng phí hoặc hoàn tiền phụ thuộc thông tin của phòng khám.')),
    E1: () => section('CHECKLIST TRƯỚC BUỔI KHÁM', 'Sẵn sàng cho lịch hẹn',
      checklist('onsite', 'Bạn đã chuẩn bị gì?',
        ['Kiểm tra giờ hẹn và địa điểm trên phiếu khám.',
         'Mang giấy tờ, đơn thuốc và kết quả cũ nếu đang có.',
         'Ghi lại câu hỏi muốn trao đổi với bác sĩ.']) +
      band('Có hướng dẫn xét nghiệm hay nhịn ăn riêng? Hỏi phòng khám trước khi thực hiện.', 'K5', 'Hỏi ngay')),
    E2: () => section('TẠI PHÒNG KHÁM', 'Sau khi báo đã đến',
      grid(tip('clock', 'Theo dõi lượt khám', 'Kiểm tra tiến trình tiếp nhận trong phiếu khám.', 'E3', 'Xem tiến trình'),
        tip('headphones', 'Cần hỗ trợ tại quầy?', 'Hỏi nhân viên nếu tên hoặc giờ khám chưa chính xác.', 'K5', 'Liên hệ'))),
    E3: () => section('TRONG KHI CHỜ', 'Giữ thông tin trong tầm tay',
      grid(tip('document', 'Phiếu khám', 'Thông tin lịch, người khám và yêu cầu có thể xem lại.', 'D2', 'Mở phiếu khám'),
        tip('message-circle', 'Có thay đổi?', 'Thông báo với quầy tiếp nhận hoặc đội ngũ chăm sóc.', 'K5', 'Hỗ trợ'))),
    F1: () => section('CẬN LÂM SÀNG', 'Cần chuẩn bị đúng hướng dẫn',
      grid(tip('document-check', 'Đọc chỉ định', 'Xem tên, trạng thái và ghi chú của từng chỉ định.'),
        tip('headphones', 'Chưa rõ yêu cầu?', 'Không tự nhịn ăn hoặc ngừng thuốc; hãy hỏi phòng khám.', 'K5', 'Hỏi phòng khám'))),
    F2: () => section('CẬN LÂM SÀNG', 'Hiểu kết quả theo đúng ngữ cảnh',
      details('Kết quả cần được bác sĩ giải thích',
        'Các kết quả xét nghiệm nên được xem cùng triệu chứng, bệnh sử và nhận định của bác sĩ. ' +
        'Nếu chưa rõ ý nghĩa, bạn có thể hỏi phòng khám.')),
    F3: () => section('CHUẨN BỊ LÀM XÉT NGHIỆM', 'Trước ngày hẹn',
      checklist('lab', 'Điều cần xác nhận',
        ['Đúng tên xét nghiệm và người thực hiện.',
         'Đã hỏi phòng khám về yêu cầu chuẩn bị riêng.',
         'Đã kiểm tra nơi thực hiện và giờ hẹn.'])),
    F4: () => section('CHIA SẺ TÀI LIỆU', 'Bảo vệ thông tin cá nhân',
      details('Kiểm tra tệp trước khi đính kèm',
        'Chỉ chọn tài liệu liên quan đến lượt khám và đúng người bệnh. ' +
        'Đây là prototype: tệp không được tải lên máy chủ.')),
    G1: () => section('CHECKLIST KHÁM TRỰC TUYẾN', 'Sẵn sàng kết nối',
      checklist('online', 'Kiểm tra trước giờ hẹn',
        ['Mạng đủ ổn định để gọi video.',
         'Camera và micro đã được kiểm tra.',
         'Chọn không gian yên tĩnh, đủ riêng tư.']) +
      band('Nếu không vào được phòng chờ, hãy mở lại lịch hẹn hoặc nhờ hỗ trợ.', 'K5', 'Cần trợ giúp')),
    G2: () => section('TRONG PHÒNG CHỜ', 'Không bỏ lỡ cuộc gọi',
      grid(tip('video', 'Giữ thiết bị sẵn sàng', 'Ở lại màn chờ và kiểm tra âm thanh.'),
        tip('headphones', 'Kết nối gián đoạn?', 'Liên hệ phòng khám nếu chờ quá lâu hoặc gặp sự cố.', 'K5', 'Hỗ trợ'))),
    G5: () => section('KHI KHÔNG KẾT NỐI ĐƯỢC', 'Bạn vẫn có cách tiếp tục',
      grid(tip('calendar', 'Xem lại phiếu khám', 'Kiểm tra giờ hẹn và trạng thái cuộc gọi.', 'D2', 'Phiếu khám'),
        tip('headphones', 'Nhờ kết nối lại', 'Trao đổi với phòng khám về bước tiếp theo.', 'K5', 'Liên hệ'))),
    H1: () => section('SAU BUỔI KHÁM', 'Giữ lại thông tin cần thiết',
      grid(tip('document-check', 'Lời dặn và đơn thuốc', 'Xem nội dung đã được chia sẻ cho lượt khám này.', 'H6', 'Xem lời dặn'),
        tip('headphones', 'Cần giải thích thêm?', 'Gửi câu hỏi cho đội ngũ chăm sóc.', 'K5', 'Hỗ trợ'))),
    H2: () => section('THANH TOÁN', 'Kiểm tra trước khi trả',
      details('Xác minh thông tin thanh toán',
        'Đối chiếu người khám, dịch vụ và số tiền hiển thị. ' +
        'Ứng dụng hiện mô phỏng trạng thái thanh toán; không thực hiện giao dịch thật.')),
    H3: () => section('THANH TOÁN SAU', 'Giữ lại phiếu khám',
      grid(tip('document', 'Xem tình trạng phí', 'Theo dõi thông tin thanh toán trong lượt khám.', 'D2', 'Phiếu khám'),
        tip('headphones', 'Có thắc mắc?', 'Liên hệ để được hướng dẫn thanh toán.', 'K5', 'Hỗ trợ'))),
    H5: () => section('CHỨNG TỪ KHÁM', 'Bạn có thể kiểm tra',
      details('Lưu thông tin để đối chiếu',
        'Đối chiếu tình trạng thanh toán và nội dung chứng từ của đúng lượt khám. ' +
        'Dữ liệu tài chính trong prototype chỉ là minh họa.')),
    H6: () => section('CHĂM SÓC SAU KHÁM', 'Những bước tiếp theo',
      photo('clinician', 'Hiểu rõ lời dặn của bác sĩ',
        'Xem lại đơn thuốc và hướng dẫn được cung cấp; hỏi lại nếu có điều chưa rõ.', 'K5', 'Hỏi phòng khám') +
      checklist('aftercare', 'Tự kiểm tra việc cần nhớ',
        ['Đã đọc hướng dẫn sau khám của đúng lượt khám.',
         'Đã lưu câu hỏi cần hỏi lại bác sĩ.',
         'Đã kiểm tra ngày tái khám nếu được yêu cầu.'])),
    H7: () => section('KẾT QUẢ VÀ THEO DÕI', 'Thông tin bạn cần',
      grid(tip('document-check', 'Xem lời dặn', 'Đọc kết luận và chỉ dẫn được chia sẻ trong phần trên.'),
        tip('message-circle', 'Còn câu hỏi?', 'Gửi câu hỏi cho phòng khám về kết quả.', 'K5', 'Liên hệ'))),
    I1: () => section('GIỮ LIÊN LẠC', 'Chọn đúng kênh hỗ trợ',
      grid(tip('message-circle', 'Gửi câu hỏi', 'Ghi rõ điều chưa hiểu để phòng khám phản hồi.', 'I5', 'Tin nhắn'),
        tip('headphones', 'Cần liên hệ nhanh?', 'Mở danh mục hỗ trợ và yêu cầu gọi lại.', 'K5', 'Hỗ trợ'))),
    I2: () => section('CẬP NHẬT SAU KHÁM', 'Viết ngắn gọn, dễ xử lý',
      details('Những thông tin nên có',
        list('Điều gì thay đổi so với sau buổi khám?',
          'Tình trạng bắt đầu từ khi nào?',
          'Bạn đang cần phòng khám giải đáp điều gì?'))),
    I3: () => section('THEO DÕI TẠI NHÀ', 'Ghi nhận để trao đổi',
      checklist('followup', 'Gợi ý tự chuẩn bị',
        ['Đọc lại hướng dẫn đã nhận.',
         'Ghi chú điều đã thay đổi để báo phòng khám.',
         'Chuẩn bị câu hỏi cho lần liên hệ tiếp theo.']) +
      details('Khi triệu chứng trở nặng',
        'Không chờ câu trả lời qua ứng dụng nếu có dấu hiệu nguy hiểm. ' +
        'Gọi 115 hoặc đến cơ sở cấp cứu gần nhất.')),
    I4: () => section('CHUYỂN CHUYÊN KHOA', 'Trước lượt khám tiếp theo',
      grid(tip('document', 'Giữ phiếu khám', 'Xem lại thông tin chuyển khám và chỉ định.'),
        tip('headphones', 'Chưa rõ bước tiếp?', 'Liên hệ phòng khám để xác nhận.', 'K5', 'Hỗ trợ'))),
    I5: () => section('TIN NHẮN CHĂM SÓC', 'Để nhận phản hồi rõ ràng',
      details('Viết một tin nhắn hiệu quả',
        'Nêu rõ lượt khám và câu hỏi chính; không chia sẻ mật khẩu hoặc mã OTP. ' +
        'Nếu khẩn cấp, gọi 115 thay vì đợi tin nhắn.')),
    J1: () => section('TÁI KHÁM', 'Chuẩn bị cho lần gặp tiếp theo',
      grid(tip('document-check', 'Xem hồ sơ cũ', 'Xem lời dặn và kết quả đã được chia sẻ.', 'H6', 'Lời dặn'),
        tip('headphones', 'Chưa rõ thời gian?', 'Liên hệ phòng khám để được hướng dẫn.', 'K5', 'Hỗ trợ'))),
    K1: () => section('THÔNG TIN LIÊN QUAN', 'Quản lý cập nhật',
      grid(tip('calendar', 'Lịch hẹn của bạn', 'Xem trực tiếp mọi thay đổi từ phiếu khám.', 'D1', 'Mở lịch'),
        tip('shield', 'Cài đặt nhắc hẹn', 'Tùy chọn thông báo và quyền riêng tư.', 'K4', 'Cài đặt'))),
    K3: () => section('LỊCH SỬ KHÁM', 'Tìm lại nội dung quan trọng',
      grid(tip('document-check', 'Đơn thuốc và kết luận', 'Chọn một lượt khám hoàn tất để xem nội dung được chia sẻ.'),
        tip('user', 'Hồ sơ người thân', 'Quyền xem kết quả phụ thuộc từng hồ sơ.', 'K2', 'Hồ sơ'))),
    K4: () => section('QUYỀN RIÊNG TƯ', 'Bạn kiểm soát điều gì?',
      details('Dữ liệu trong bản trải nghiệm',
        'Trạng thái và dữ liệu minh họa được lưu ở trình duyệt. ' +
        'Đây không phải hệ thống hồ sơ bệnh án thật. Không nhập dữ liệu sức khỏe thật.') +
      band('Bạn muốn phòng khám hỗ trợ truy cập hoặc chỉnh sửa hồ sơ?', 'K5', 'Liên hệ'))
  };
  function applyRealPhoto(node, selector, key, alt) {
    const element = node.querySelector(selector);
    if (!element || !IMG[key]) return;
    const fallback = element.getAttribute('src');
    if (!fallback) return;
    element.dataset.cfxFallback = fallback;
    element.src = IMG[key];
    if (alt !== undefined) element.alt = alt;
    element.loading = selector.includes('appointment-object') ? 'eager' : 'lazy';
  }
  function restoreChecklist(node, id, visitId) {
    node.querySelectorAll('[data-cfx-checklist]').forEach(group => {
      const storageKey = 'careflow-ui-check-v1:' + id + ':' + (visitId || 'none') +
        ':' + group.dataset.cfxChecklist;
      group.dataset.cfxStorage = storageKey;
      let checked = [];
      try { checked = JSON.parse(root.sessionStorage.getItem(storageKey) || '[]'); } catch (_) {}
      group.querySelectorAll('input[data-cfx-index]').forEach(input => {
        input.checked = Array.isArray(checked) && checked.includes(Number(input.dataset.cfxIndex));
      });
      updateChecklist(group);
    });
  }
  function updateChecklist(group) {
    const boxes = [...group.querySelectorAll('input[data-cfx-index]')];
    const done = boxes.filter(input => input.checked).length;
    const status = group.querySelector('.cfx-check-count');
    if (status) status.textContent = done + '/' + boxes.length + ' đã chuẩn bị';
    group.classList.toggle('is-complete', done === boxes.length);
  }
  function enrichExistingCards(content, s, id) {
    if (id !== 'B1') return;
    const upcoming = (s?.visits || [])
      .filter(visit => !['completed', 'cancelled', 'no-show'].includes(visit.status))
      .sort((a, b) => ((a.date || '') + (a.slot || '')).localeCompare((b.date || '') + (b.slot || '')))[0];
    const footer = content.querySelector('.cf-home-appointment-footer');
    if (upcoming && footer && upcoming.mode === 'onsite' &&
        ['confirmed', 'reminder'].includes(upcoming.status)) {
      const prepare = root.document.createElement('button');
      prepare.type = 'button';
      prepare.className = 'cfx-hero-secondary';
      prepare.dataset.action = 'go';
      prepare.dataset.to = 'E1';
      prepare.dataset.id = upcoming.id;
      prepare.textContent = 'Chuẩn bị trước khám';
      footer.prepend(prepare);
    }
    const aftercare = content.querySelector('.cf-home-care-card');
    const recent = (s?.visits || []).some(visit =>
      visit.status === 'completed' && root.CareFlowModel.canViewResults(s, visit));
    if (recent && aftercare) {
      const tools = root.document.createElement('div');
      tools.className = 'cfx-card-tools';
      tools.innerHTML = '<span>Chưa rõ lời dặn hoặc đơn thuốc?</span>' +
        '<button type="button" data-action="go" data-to="K5">Hỏi phòng khám ' +
        icon('arrow-right', 14) + '</button>';
      aftercare.append(tools);
    }
  }
  function decorate({id, s, u, guarded}) {
    const content = root.document.getElementById('phone-content');
    if (!content || guarded) return;
    const imagery = {
      B1: [['.appointment-object', 'appointment', ''],
           ['.ref-discover-image img', 'consultation', 'Ảnh minh họa buổi tư vấn tại phòng khám từ Unsplash']],
      D2: [['.ref-detail-hero img', 'radiology', 'Ảnh minh họa bác sĩ trao đổi với bệnh nhân từ Unsplash']],
      K5: [['.cf-context-photo img', 'consultation', 'Ảnh minh họa tư vấn tại phòng khám từ Unsplash']]
    };
    if (id.startsWith('A')) applyRealPhoto(content, '.auth-scene img', 'clinician',
      'Ảnh minh họa bác sĩ từ Unsplash');
    (imagery[id] || []).forEach(([selector, key, alt]) => applyRealPhoto(content, selector, key, alt));
    enrichExistingCards(content, s, id);
    const renderPanel = panels[id];
    if (!renderPanel) return;
    const panel = root.document.createElement('div');
    panel.className = 'cfx-insert cfx-screen-' + id.toLowerCase();
    panel.innerHTML = renderPanel();
    if (id === 'B1') {
      const anchor = content.querySelector('.cf-home-task-section');
      if (anchor) anchor.before(panel);
      else content.append(panel);
    } else {
      content.append(panel);
    }
    restoreChecklist(panel, id, s?.activeVisitId);
    panel.querySelectorAll('img[data-cfx-fallback]').forEach(img => img.addEventListener('error', fallbackImage, {once:true}));
  }
  function fallbackImage(event) {
    const img = event.currentTarget;
    const fallback = img.dataset.cfxFallback;
    if (fallback && img.getAttribute('src') !== fallback) {
      img.removeAttribute('data-cfx-fallback');
      img.src = fallback;
    }
  }
  root.document.addEventListener('error', function(event) {
    const img = event.target;
    if (img?.tagName === 'IMG' && img.dataset.cfxFallback) fallbackImage({currentTarget:img});
  }, true);
  root.document.addEventListener('change', function(event) {
    const checkbox = event.target.closest?.('input[data-cfx-index]');
    if (!checkbox) return;
    const group = checkbox.closest('[data-cfx-checklist]');
    if (!group) return;
    const indexes = [...group.querySelectorAll('input[data-cfx-index]')]
      .filter(input => input.checked).map(input => Number(input.dataset.cfxIndex));
    try { root.sessionStorage.setItem(group.dataset.cfxStorage, JSON.stringify(indexes)); } catch (_) {}
    updateChecklist(group);
  });
  root.CareFlowExperience = {decorate, IMG};
})(window);
