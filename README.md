# Thiệp cưới online: mở thư

Trang tĩnh viết bằng HTML/CSS/JS thuần, không cần build, deploy thẳng lên GitHub Pages.

Trình tự khi khách mở link (theo 4 ảnh mẫu trong `../wedding-letter-backups/mau-4-man-hinh/`):
1. Phong bì ảnh thật trên mặt bàn có hoa, dòng "Chạm vào phong bì để mở thư". Khách chạm thì phong bì zoom to, con dấu tách, ruy băng tuột, nắp mở. Nhạc nền phát ngay lúc chạm.
2. Tấm thiệp dọc mép xé trượt ra (đôi thiên nga, "Thiệp mời", tên, ngày, nơi tổ chức) và dừng lại với dòng "Chạm để đọc tiếp".
3. Chạm tiếp thì thiệp phóng thành khung ảnh oval có nơ, dòng "Cào nhẹ để nhìn thấy chúng mình nhé!". Khách cào để ảnh hiện dần.
4. Cào được khoảng 55% thì ảnh hiện hẳn, bên dưới là tên, ngày, nơi tổ chức, đôi thiên nga, lời mời có tên khách và nút "Xem chi tiết" dẫn xuống thông tin nhà trai / nhà gái, lịch, sự kiện (có nút Google Maps), album và form xác nhận tham dự.

Giao diện theo phong cách vintage trắng ngà và olive: phong bì giấy dập nổi quấn ruy băng olive và con dấu sáp, hoa trắng lá olive, khung ảnh tròn, thẻ giấy mép xé, album kiểu polaroid. Ảnh hoa màu nước (`flowers-arch.webp`, `flowers-garland.webp`, `flowers-sprig.webp`) đã được tách nền trong suốt từ ảnh gốc; ảnh gốc lưu ở `../wedding-letter-backups/anh-hoa-goc/`. Các họa tiết còn lại vẽ bằng SVG (`emboss.svg`, `emboss-leaf.svg`, `liner.svg`, `ornament.svg`).

Trang đầu dùng ảnh chụp cùng một ánh nắng: `intro-bg.webp` (nền hoa, khăn voan trên mặt bàn đá) và `envelope-photo.webp` (phong bì cắt từ ảnh chụp trên chính mặt bàn đó, bóng đổ theo hướng nắng). Khi khách chạm, ảnh phong bì mờ đi đúng lúc con dấu tách để phong bì dựng bằng code (cùng tông, ruy băng, con dấu, nhánh hoa) tiếp tục animation mở thư. Nếu thay ảnh phong bì khác tỉ lệ 461:350 thì cần chỉnh `aspect-ratio` của `.env` và vị trí con dấu, ruy băng trong `css/style.css`. Ảnh gốc lưu ở `../wedding-letter-backups/anh-hoa-goc/`.

Màn cào ảnh và trang chi tiết dùng nền trắng ngà cho nội dung nổi bật, hoa thật chỉ ở góc trên trái và góc dưới phải (`corner-tl.webp`, `corner-br.webp`, cắt từ ảnh nền, mép mờ dần).

Các bản giao diện cũ (tông trắng và xanh nhạt) được lưu ở thư mục `../wedding-letter-backups/`, nằm ngoài thư mục thiệp nên không bị đưa lên mạng.

## Sửa nội dung

Toàn bộ nội dung nằm trong `js/config.js`: tên, bố mẹ, sự kiện, ngày âm lịch, địa chỉ, link bản đồ.

- **Tấm thiệp trong phong bì:** là ảnh `assets/letter-card.webp`, cắt nguyên từ mẫu thiệp in để giữ đúng nét chữ thư pháp, nên sửa tên/ngày trong `config.js` sẽ không đổi tấm thiệp này. Muốn đổi thì thay ảnh khác cùng tỉ lệ 770:1118 (ảnh hiện tại đã phóng 2x và làm nét để hiển thị rõ trên điện thoại). Các chữ viết tay còn lại dùng font Ms Madi, màu `#7B2D2A`.
- **Ảnh cưới (khung oval cào):** `assets/photo.jpg`, đã cắt tỉ lệ 0.74 (rộng 900px).
- **Album (sổ lưu niệm):** ảnh trong `assets/gallery/`, liệt kê ở `gallery`. Bố cục polaroid rải chồng đẹp nhất với 4 ảnh theo thứ tự dọc, dọc, ngang, dọc; mỗi ảnh nên rộng khoảng 1100px, dưới 200KB. Ảnh gốc lưu ở `../wedding-letter-backups/anh-cuoi-goc/`.
- **Hộp mừng cưới:** cuối trang, bấm hộp quà để mở mã QR. Chép ảnh QR ngân hàng vào `assets/` rồi điền đường dẫn vào `gift[].qr` (để `""` thì hiện khung chờ, không có nút tải).
- **Nhạc nền:** chép file vào `assets/music.mp3`. Nếu chưa có file thì nút nhạc tự ẩn.

## Link mời theo tên khách

Thêm `?to=` vào cuối link, dùng dấu `-` thay cho khoảng trắng:

```
https://<user>.github.io/wedding-letter/?to=Anh-Minh
https://<user>.github.io/wedding-letter/?to=Cô-Chú-Tuấn
```

Nếu link không có `?to=` thì thiệp hiển thị "Bạn".

## Chạy thử trên máy

```bash
python3 -m http.server 5173
```

Sau đó mở http://localhost:5173. Muốn thử trên điện thoại thì dùng cùng mạng wifi và mở `http://<IP máy>:5173`.

## Kết nối form với Google Sheets

1. Tạo một Google Sheet mới, chọn **Tiện ích mở rộng → Apps Script**.
2. Dán nội dung file `apps-script/Code.gs` vào, rồi lưu.
3. Chọn **Triển khai → Triển khai mới**, loại **Ứng dụng web**:
   - Thực thi dưới dạng: **Tôi**
   - Người có quyền truy cập: **Bất kỳ ai**
4. Cấp quyền, sau đó copy URL dạng `https://script.google.com/macros/s/.../exec`.
5. Dán URL đó vào `rsvpEndpoint` trong `js/config.js`.

Mỗi lần khách gửi form, Sheet `RSVP` sẽ có thêm một dòng.

## Deploy lên GitHub Pages

1. Tạo repo trên GitHub (ví dụ `wedding-letter`) và push toàn bộ thư mục này lên.
2. Vào **Settings → Pages → Branch: `main` / root**, rồi bấm Save.
3. Vài phút sau trang sẽ có ở `https://<user>.github.io/wedding-letter/`.
