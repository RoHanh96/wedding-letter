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
      father: "Ông Nguyễn Văn Hảnh",
      mother: "Bà Bùi Thị Mềm",
      address: "",
    },
    bride: {
      label: "Nhà Gái",
      father: "",
      mother: "Bà Nguyễn Thị Thu Thuỷ",
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
      venue: "Nhà sinh hoạt cộng đồng tổ 6",
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

  photo: "assets/photo.svg", // đổi thành "assets/photo.jpg" khi có ảnh thật (ảnh dọc 3:4)

  // Album ảnh: chép ảnh vào assets/gallery/ rồi liệt kê ở đây (nên 4–9 ảnh). Để [] thì ẩn album.
  // Đang dùng ảnh mẫu để xem bố cục.
  gallery: [
    "assets/photo.svg",
    "assets/photo.svg",
    "assets/photo.svg",
    "assets/photo.svg",
    "assets/photo.svg",
    "assets/photo.svg",
  ],
  music: "assets/music.mp3", // bài "A Thousand Years"

  // Link Web App của Google Apps Script (xem README). Để trống thì form chưa gửi được.
  rsvpEndpoint: "",

  // Dòng nơi tổ chức in trên tấm thiệp và dưới ảnh cưới (để "" thì ẩn)
  letterPlace: "Hà Nội · Hải Phòng",

  // Hiển thị khi link không có ?to=...
  defaultGuest: "Bạn",
};
