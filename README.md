# Mindful Shield – Dừng lại & Phát triển bản thân 🌱

Tiện ích mở rộng (Browser Extension - Manifest V3) giúp bạn làm chủ bản thân, tự động phát hiện khi tìm kiếm nội dung nhạy cảm (18+, sex, hentai, khiêu dâm...) trên các công cụ tìm kiếm hoặc khi mở các trang web người lớn, hiển thị màn hình nhắc nhở với các câu hỏi suy ngẫm, hình ảnh, video và câu nói truyền cảm hứng phát triển bản thân.

---

## 📌 Các công việc đã hoàn thành

### 1. Kiến trúc & Cấu hình Extension
- [x] **`manifest.json` (Manifest V3)**: Tương thích hoàn toàn với Google Chrome, Microsoft Edge, Cốc Cốc, Brave, Opera. Hỗ trợ chạy trong **chế độ ẩn danh (Incognito / InPrivate)** với chế độ `spanning`.
- [x] **Bộ Icon & Ảnh chất lượng cao**: Đã tạo icon ứng dụng (16, 32, 48, 128px) và 5 hình ảnh nghệ thuật tạo động lực (bình minh trên đỉnh núi, chạy bộ sáng sớm, bàn học tập trung, thiền bên hồ, tập luyện kỷ luật).

### 2. Thuật toán phát hiện thông minh (`src/detector.js`)
- [x] **Hỗ trợ 25 công cụ tìm kiếm & mạng xã hội**: Google, Bing, Yahoo, DuckDuckGo, Cốc Cốc, Yandex, Baidu, Brave Search, YouTube, TikTok, Facebook, Reddit, X (Twitter), Tumblr, Twitch...
- [x] **Cơ chế quét tham số tìm kiếm tổng quát (`genericSearch`)**: Quét các tham số `?q=`, `?search=`, `?keyword=` trên mọi trang web khác.
- [x] **Bắt đường dẫn tìm kiếm (Path Search)**: Bắt các dạng `/search/<từ_khóa>`, `/tag/<từ_khóa>`, `/hashtag/<từ_khóa>`.
- [x] **Xử lý tiếng Việt & Tiếng Anh chuẩn xác**:
  - Chuẩn hoá NFD, tự động nhận diện từ khóa có dấu / không dấu (`phim sex`, `phim-sex`, `phimsex`).
  - Hỗ trợ cú pháp từ khóa linh hoạt:
    - Từ khóa thường: Khớp nguyên từ/cụm từ.
    - Cú pháp `*`: Khớp chuỗi con (`*porn`, `*hentai`).
    - Cú pháp `=`: Khớp chính xác có dấu (`=lồn`, `=cặc`, `=nứng`) nhằm tránh bắt nhầm các từ vô hại (`lon bia`, `nung gốm`).
- [x] **Danh sách cho phép (Allowlist)**: Tránh bắt nhầm các nội dung học thuật, sức khỏe (`giáo dục giới tính`, `sex education`, `sức khỏe sinh sản`, `nhiễm sắc thể giới tính`, `nofap`, địa danh `essex`, `sussex`...).
- [x] **Chặn trực tiếp tên miền người lớn (`DEFAULT_DOMAINS`)**: Tự động phát hiện khi truy cập các web người lớn phổ biến và đuôi tên miền `.xxx`, `.porn`...
- [x] **Kiểm thử tự động (Unit Tests)**: 8/8 bộ test (`tests/detector.test.js`) đều đã PASS 100%.

### 3. Service Worker nền (`src/background.js`)
- [x] Bắt sự kiện điều hướng `webNavigation.onBeforeNavigate`, `onHistoryStateUpdated` (hỗ trợ Single Page Apps như YouTube, TikTok), `tabs.onUpdated`.
- [x] Chống trùng lặp (deduplication) khi nhiều sự kiện cùng kích hoạt trong vài giây.
- [x] Hỗ trợ miễn trừ tạm thời (`session allowlist`): Sau khi người dùng vượt qua thử thách và chọn "Vẫn tiếp tục", từ khóa đó sẽ được miễn trừ trong N phút đã định trước.
- [x] Huy hiệu (Badge) trên thanh công cụ: Hiển thị trạng thái bảo vệ hoặc tạm dừng.

### 4. Màn hình can thiệp nhắc nhở (`pages/intervention.html`, `css`, `js`)
- [x] Giao diện cao cấp hiện đại: Kính mờ (Glassmorphism), nền mờ nghệ thuật thay đổi ngẫu nhiên, hiệu ứng cực quang (Aurora).
- [x] **Số liệu chuỗi ngày (Streak) & Chiến thắng (Wins)** cập nhật trực tiếp theo thời gian thực.
- [x] **Câu hỏi gợi mở tâm trí**: Tự động chọn ngẫu nhiên các câu hỏi suy ngẫm sâu sắc ("Bạn xem để làm gì? 10 phút sau bạn sẽ cảm thấy thế nào?").
- [x] **Mục tiêu cá nhân ("Lý do tôi bắt đầu")**: Hiển thị nhắc nhở về người mà bạn muốn trở thành.
- [x] **Nhật ký cảm xúc & Mood Selector**: Viết ra suy nghĩ lúc đó và gắn nhãn cảm xúc (*Buồn chán, Cô đơn, Căng thẳng, Mệt mỏi, Tò mò, Thói quen*).
- [x] **Gợi ý hành động lành mạnh thay thế**: Hít thở, chống đẩy, uống nước lạnh, đi bộ, đọc sách...
- [x] **38 câu nói truyền cảm hứng** (Jim Rohn, Viktor Frankl, Marcus Aurelius, Lão Tử, James Clear...).
- [x] **Kho Video & Hình ảnh phát triển bản thân**:
  - Tích hợp sẵn 5 video TED/TEDx kinh điển về tác hại của nội dung khiêu dâm và sức mạnh kỷ luật.
  - Video nhúng thông minh qua YouTube no-cookie kèm ảnh thumbnail bìa để tối ưu hiệu năng.
  - Bộ hình ảnh truyền cảm hứng sống tích cực.
- [x] **Bài tập thở 1 phút (Box Breathing)**: Đồng hồ động hỗ trợ chu kỳ Hít vào 4s – Giữ 4s – Thở ra 6s giúp xoa dịu xung động dopamine tức thời.
- [x] **Nút chiến thắng**: "🌱 Tôi chọn phát triển bản thân" bắn pháo hoa Confetti, tăng số lần chiến thắng và đưa về trang an toàn (Google).
- [x] **Bộ rào cản trì hoãn (Friction Gate)**:
  - Nút "Vẫn tiếp tục" bị khóa đếm ngược (mặc định 30 giây).
  - Yêu cầu bắt buộc viết lý do tại sao vẫn muốn xem (tối thiểu 20 ký tự).
  - Có tùy chọn bật "Chế độ nghiêm khắc" để ẩn hoàn toàn nút tiếp tục.

### 5. Trang quản trị & Cài đặt nâng cao (`pages/options.html`, `css`, `js`)
- [x] **Bảng điều khiển (Dashboard)**: Biểu đồ cột 14 ngày gần nhất phân tích số lần vượt qua, số lần tiếp tục; tính tỉ lệ thắng và chuỗi ngày kỷ lục.
- [x] **Sổ tay nhật ký (Journal)**: Xem lại toàn bộ lịch sử các lần bị can thiệp, lý do và tâm trạng bạn đã ghi lại.
- [x] **Tự do thêm/sửa/xóa nội dung**:
  - Thêm / sửa câu nói hay (hỗ trợ nhập hàng loạt mỗi dòng một câu).
  - Thêm hình ảnh từ URL hoặc **kéo thả tải ảnh từ máy tính** (lưu trữ cục bộ vào IndexedDB).
  - Thêm video từ link YouTube hoặc video tải từ máy tính (`.mp4`, `.webm`).
  - Tùy chỉnh danh sách câu hỏi suy ngẫm, mục tiêu cá nhân, hành động thay thế.
- [x] **Quản lý & Thử nghiệm từ khóa**: Giao diện chỉnh sửa từ khóa phát hiện & danh sách cho phép, tích hợp sẵn khung **Tester** để kiểm tra ngay xem từ khóa hoặc URL có bị kích hoạt không.
- [x] **Khóa cam kết (`lockDisable`)**: Khi muốn tắt bảo vệ, tạm dừng hoặc xóa bớt từ khóa, người dùng buộc phải tự tay gõ lại câu cam kết: *"Tôi chịu trách nhiệm với lựa chọn của mình"*.
- [x] **Sao lưu & Phục hồi (JSON Backup)**: Xuất và nhập toàn bộ cấu hình, từ khóa, câu nói, nhật ký dễ dàng.

### 6. Popup nhanh trên thanh công cụ (`pages/popup.html`, `js`)
- [x] Xem nhanh chuỗi ngày hiện tại, số chiến thắng hôm nay.
- [x] Hiển thị ngẫu nhiên 1 câu danh ngôn ngắn.
- [x] Nút bật/tắt bảo vệ hoặc tạm dừng 15 phút, 1 giờ (có kiểm tra câu cam kết).
- [x] Nút mở nhanh trang Cài đặt & Xem trước màn hình nhắc.

---

## 🚀 Hướng dẫn cài đặt vào trình duyệt (Chrome, Edge, Cốc Cốc, Brave)

1. Mở trình duyệt của bạn (Chrome, Edge, Cốc Cốc hoặc Brave).
2. Truy cập vào trang quản lý tiện ích:
   - Trên **Chrome / Brave**: `chrome://extensions`
   - Trên **Microsoft Edge**: `edge://extensions`
   - Trên **Cốc Cốc**: `coccoc://extensions`
3. Bật công tắc **Chế độ dành cho nhà phát triển** (**Developer mode**) ở góc trên bên phải.
4. Bấm vào nút **Tải tiện ích đã giải nén** (**Load unpacked**).
5. Trỏ tới thư mục:
   ```
   D:\Personal\DevelopYourself\think-sex-or-development-yourself\extension
   ```
6. **Quan trọng để bảo vệ toàn diện (Chế độ ẩn danh / InPrivate)**:
   - Trên thẻ tiện ích **Mindful Shield**, bấm vào **Chi tiết (Details)**.
   - Bật tùy chọn **Cho phép ở chế độ ẩn danh (Allow in InPrivate / Allow in incognito)**.

---

## 🧪 Cách chạy Unit Tests
Trong thư mục gốc của dự án:
```bash
node --test tests/detector.test.js
```
Kết quả: 8/8 tests passed.
