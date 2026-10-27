/*
 * TOÀN BỘ NỘI DUNG THIỆP NẰM Ở FILE NÀY.
 * Chỉ cần sửa giá trị trong dấu "..." rồi lưu lại, không cần đụng tới file khác.
 */
window.WEDDING = {
  groom: {
    name: "Nguyễn Văn Hãnh", // tên đầy đủ hiển thị trong thiệp
    short: "Hãnh",           // tên gọi, dùng cho chữ cái viết tắt trên phong bì
  },
  bride: {
    name: "Nguyễn Lan Anh",
    short: "Anh",            // tên gọi, hiện trên thiệp: "Hãnh & Anh"
  },

  // Để trống "" dòng nào thì dòng đó không hiển thị
  families: {
    groom: {
      label: "Nhà Trai",
      father: "Ông: Nguyễn Văn Hảnh",
      mother: "Bà: Bùi Thị Mềm",
      address: "",
    },
    bride: {
      label: "Nhà Gái",
      father: "",
      mother: "Bà: Nguyễn Thị Thu Thuỷ",
      address: "",
    },
  },

  /*
   * Các sự kiện, hiển thị theo thứ tự trong danh sách.
   * datetime: "YYYY-MM-DDTHH:mm" (giờ Việt Nam), thứ trong tuần được tự tính
   * lunar:    nhập tay ngày âm lịch
   * mapUrl:   link Google Maps (mở Maps > Chia sẻ > Sao chép link).
   *           Để trống "" thì sẽ tự tìm theo address.
   */
  events: [
    {
      id: "party",
      side: "Nhà Gái",
      title: "Tiệc Mừng Cưới",
      icon: "glasses", // glasses = ly rượu, rings = nhẫn cưới, heart = trái tim
      datetime: "2026-11-13T18:00",
      lunar: "Tức ngày 5 tháng 10 năm Bính Ngọ",
      venue: "Nhà Sinh Hoạt Cộng Đồng Tổ 6",
      address: "Phường Xuân Phương, Hà Nội",
      mapUrl: "https://maps.app.goo.gl/4MLwXhPXxbin71JZ7",
    },
    {
      id: "ceremony",
      side: "Nhà Trai",
      title: "Lễ Thành Hôn",
      icon: "rings",
      datetime: "2026-11-14T11:00",
      lunar: "Tức ngày 6 tháng 10 năm Bính Ngọ",
      venue: "Tư gia nhà trai",
      address: "Thôn Lương Trạch, xã Vĩnh Hải, Hải Phòng",
      mapUrl: "https://maps.app.goo.gl/7UhU7Lfyx2iWuj856",
    },
  ],

  photo: "assets/photo.jpg", // ảnh trong khung oval cào (đã cắt tỉ lệ 0.74)

  // Album kiểu sổ lưu niệm: bố cục cho 4 ảnh theo thứ tự dọc, dọc, ngang, dọc.
  // (ảnh 04 dùng làm nền phần hộp mừng cưới, không đưa vào album)
  gallery: [
    "assets/gallery/01.jpg",
    "assets/gallery/02.jpg",
    "assets/gallery/03.jpg",
    "assets/gallery/05.jpg",
  ],

  // Hộp mừng cưới: ảnh QR ngân hàng (để "" thì hiện khung chờ) và số tài khoản cho nút "Copy STK"
  gift: [
    { label: "Chú rể", name: "Nguyễn Văn Hãnh", bank: "MB Bank", account: "0972183010", qr: "assets/qr-chu-re.webp" },
    { label: "Cô dâu", name: "Nguyễn Lan Anh", bank: "MB Bank", account: "0326654295", qr: "assets/qr-co-dau.webp" },
  ],
  music: "assets/music.mp3", // bài "A Thousand Years"

  // Link Web App của Google Apps Script (xem README). Để trống thì form chưa gửi được.
  rsvpEndpoint: "https://script.google.com/macros/s/AKfycbwRNzD8XO5poll75llOWwrTBpw5CyF1FM2X-uHe-jhEKVRDXCBE40NxyKR4q4oMsx_cjw/exec",

  // Dòng nơi tổ chức in trên tấm thiệp và dưới ảnh cưới (để "" thì ẩn)
  letterPlace: "Hà Nội · Hải Phòng",

  // Hiển thị khi link không có ?to=...
  defaultGuest: "Bạn",
};
