# Chrome Web Store – Hồ sơ đăng tải (Mindful Shield v1.0.0)

Gói tải lên: `dist/mindful-shield-v1.0.0.zip` (tạo lại bằng `npm run package`).

## 0. Việc phải làm trên tài khoản (không thể làm bằng code)
- [ ] Cài đặt → nhập **email liên hệ** → bấm xác minh → mở mail và xác nhận.
- [ ] Phí đăng ký nhà phát triển $5 (một lần).
- [ ] Chụp ảnh màn hình thật (xem mục 5).

## 1. Thẻ "Danh sách cửa hàng"

**Tên:** Mindful Shield – Dừng lại & Phát triển bản thân

**Mô tả ngắn (≤132 ký tự, lấy từ manifest):**
Nhắc bạn dừng lại và suy ngẫm khi tìm kiếm nội dung 18+, sex, hentai bằng hình ảnh, video phát triển bản thân.

**Mô tả chi tiết (tiếng Việt):**
```
Mindful Shield giúp bạn làm chủ thói quen xem nội dung 18+ bằng cách chen vào một khoảnh khắc suy ngẫm đúng lúc bạn cần nhất.

Khi bạn tìm kiếm nội dung nhạy cảm trên Google, Bing, Cốc Cốc, Yahoo, DuckDuckGo, YouTube, TikTok, Reddit… hoặc mở thẳng một trang web người lớn, tiện ích sẽ hiện màn hình nhắc nhở thay vì mở trang đó.

TÍNH NĂNG
• Câu hỏi suy ngẫm: "Bạn xem để làm gì? 10 phút sau bạn sẽ cảm thấy thế nào?"
• Lý do của riêng bạn: ghi sẵn mục tiêu, hiện lại mỗi khi bị cám dỗ.
• Câu nói, hình ảnh, video phát triển bản thân có sẵn – và bạn tự thêm từ ngoài vào (link YouTube, ảnh/video tải từ máy).
• Bài tập thở 1 phút, gợi ý hành động thay thế (chống đẩy, đi bộ, uống nước…).
• Nhật ký cảm xúc, chuỗi ngày giữ vững, biểu đồ 14 ngày.
• Rào cản chống bốc đồng: đếm ngược + viết lý do mới được tiếp tục; có chế độ nghiêm khắc.
• Khóa cam kết: muốn tắt bảo vệ phải tự gõ câu cam kết.
• Từ khóa/tên miền tùy chỉnh, danh sách ngoại lệ (giáo dục giới tính, sức khỏe…), hiểu tiếng Việt có dấu và không dấu.

QUYỀN RIÊNG TƯ
Mọi dữ liệu (từ khóa, nhật ký, ảnh, video) chỉ lưu trên máy bạn. Không có máy chủ, không theo dõi, không gửi lịch sử duyệt web đi đâu.

Mã nguồn mở: https://github.com/Moobbot/develop-yourself
```

**Danh mục:** Năng suất (Productivity) hoặc Lối sống.  **Ngôn ngữ:** Tiếng Việt.

## 2. Thẻ "Phương thức bảo vệ quyền riêng tư"

**Mô tả mục đích duy nhất:**
Mindful Shield helps users overcome unwanted adult-content habits by detecting sensitive search queries locally and showing a self-development reflection page.

**Mã từ xa:** Không, tôi không sử dụng mã từ xa.

| Quyền | Lý do |
|---|---|
| `alarms` | Handles timed pauses (15 min / 1 h) and re-enables protection when the timer ends. |
| `storage` | Stores user settings, keywords, quotes, goals and journal entries locally. |
| `unlimitedStorage` | Lets users keep their own uploaded motivational images/videos (IndexedDB) and history without quota errors. |
| `tabs` | Redirects the current tab to the local reflection page when an adult query or domain is detected. |
| `webNavigation` | Observes top-level navigations and SPA route changes (e.g. YouTube) to detect queries before the page loads. |
| Quyền máy chủ (`<all_urls>`) | Needed to read search-query URLs on many search engines and to match adult domains. All analysis happens locally; no URL is transmitted. |

**Dữ liệu người dùng thu thập:** tích "Hoạt động trên web" không cần thiết; nếu form bắt khai báo, chọn *Lịch sử duyệt web / Hoạt động trên web* và ghi rõ "xử lý cục bộ, không truyền đi".
Tích cả 3 cam kết (không bán, không dùng ngoài mục đích, không dùng cho tín dụng) và ô chứng nhận tuân thủ chính sách.

**URL chính sách bảo mật:** https://github.com/Moobbot/develop-yourself/blob/main/PRIVACY_POLICY.md

## 3. Thẻ "Phân phối"
- Hiển thị: Công khai (hoặc Không công khai nếu muốn thử trước).
- Khu vực: tất cả.

## 4. Lưu ý duyệt
- Tiện ích dùng từ khóa người lớn chỉ để **phát hiện** (không chứa nội dung người lớn). Nên nêu rõ trong mô tả mục đích để tránh bị hiểu nhầm.
- Tăng `version` trong `manifest.json` mỗi lần tải bản mới.

## 5. Ảnh cửa hàng (bắt buộc ≥1 ảnh 1280×800 hoặc 640×400)
Hãy chụp ảnh thật, không dùng ảnh dựng:
1. Cài tiện ích (Load unpacked) → tìm `phim sex` trên Google → chụp màn hình nhắc nhở.
2. Mở Cài đặt → Tổng quan (biểu đồ).
3. Mở Cài đặt → Hình ảnh/Video (thêm nội dung).
4. Popup trên thanh công cụ.
Đặt cửa sổ trình duyệt 1280×800 rồi chụp. Mẹo: nút "👁 Xem trước" trong Cài đặt mở màn hình nhắc mà không cần tìm kiếm.
