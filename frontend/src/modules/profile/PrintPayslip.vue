<template>
  <div class="print-page bg-white text-black min-h-screen p-8 mx-auto max-w-[210mm] font-serif">
    
    <div v-if="!printData" class="text-center text-red-500 py-10">
      Không tìm thấy dữ liệu in. Vui lòng tắt tab này và thử lại từ trang Cá nhân.
    </div>

    <div v-else>
      <div class="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 class="font-black text-2xl uppercase">HỆ THỐNG LAPTOP STORE</h1>
          <p class="text-sm mt-1">Đ/c: 273 An Dương Vương, P.3, Q.5, TP.HCM</p>
          <p class="text-sm">Hotline: 1900 xxxx</p>
        </div>
        <div class="text-right">
          <p class="italic text-sm">Ngày in: {{ currentDate }}</p>
        </div>
      </div>

      <div v-if="printData.type === 'month'" class="space-y-6">
        <h2 class="text-xl font-bold text-center uppercase tracking-widest">
          PHIẾU LƯƠNG NHÂN VIÊN THÁNG {{ printData.data.thang }}/{{ printData.data.nam }}
        </h2>
        
        <table class="w-full text-sm border border-black mb-6">
          <tr>
            <td class="border-b border-r border-black p-2 font-bold w-32 bg-gray-100">Họ và tên:</td>
            <td class="border-b border-black p-2 font-bold uppercase">{{ printData.user.hoTen }}</td>
            <td class="border-b border-l border-r border-black p-2 font-bold w-32 bg-gray-100">Mã NV:</td>
            <td class="border-b border-black p-2">{{ printData.user.maNhanVien }}</td>
          </tr>
          <tr>
            <td class="border-r border-black p-2 font-bold bg-gray-100">Chức vụ:</td>
            <td class="p-2">{{ printData.user.tenChucVu }}</td>
            <td class="border-l border-r border-black p-2 font-bold bg-gray-100">Lương cơ sở:</td>
            <td class="p-2">{{ formatPrice(printData.data.luongTheoGio) }}/h</td>
          </tr>
        </table>

        <table class="w-full text-sm border-collapse border border-black">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-black p-2 text-left">DIỄN GIẢI KHOẢN MỤC</th>
              <th class="border border-black p-2 text-right">THU NHẬP (VNĐ)</th>
              <th class="border border-black p-2 text-right">KHẤU TRỪ (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-black p-2">Lương hành chính ({{ printData.data.soGioLamBinhThuong }}h)</td>
              <td class="border border-black p-2 text-right">{{ formatPrice(printData.data.luongCoBan) }}</td>
              <td class="border border-black p-2 text-right"></td>
            </tr>
            <tr v-if="printData.data.tongTienTangCa > 0">
              <td class="border border-black p-2">Tiền tăng ca ({{ printData.data.soGioTangCa }}h x HS {{ printData.data.heSoTangCa }})</td>
              <td class="border border-black p-2 text-right">{{ formatPrice(printData.data.tongTienTangCa) }}</td>
              <td class="border border-black p-2 text-right"></td>
            </tr>
            <tr v-if="printData.data.phuCapChucVu > 0">
              <td class="border border-black p-2">Phụ cấp chức vụ</td>
              <td class="border border-black p-2 text-right">{{ formatPrice(printData.data.phuCapChucVu) }}</td>
              <td class="border border-black p-2 text-right"></td>
            </tr>
            <tr>
              <td class="border border-black p-2">Phụ cấp cố định (Cơm, Xăng)</td>
              <td class="border border-black p-2 text-right">{{ formatPrice(printData.data.phuCapKhac) }}</td>
              <td class="border border-black p-2 text-right"></td>
            </tr>
            <tr v-if="printData.data.thuong > 0">
              <td class="border border-black p-2">Thưởng ngoại lệ</td>
              <td class="border border-black p-2 text-right">{{ formatPrice(printData.data.thuong) }}</td>
              <td class="border border-black p-2 text-right"></td>
            </tr>
            <tr>
              <td class="border border-black p-2">Phạt đi trễ <span v-if="printData.data.soPhutDiTre > 0">({{ printData.data.soPhutDiTre }} phút)</span></td>
              <td class="border border-black p-2 text-right"></td>
              <td class="border border-black p-2 text-right">{{ formatPrice(printData.data.tongTienPhat) }}</td>
            </tr>
            <tr>
              <td class="border border-black p-2">Khấu trừ Bảo hiểm (BHXH, BHYT)</td>
              <td class="border border-black p-2 text-right"></td>
              <td class="border border-black p-2 text-right">{{ formatPrice(printData.data.truBaoHiem) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-gray-100 font-bold">
              <td class="border border-black p-3 text-right uppercase">Tổng thực lãnh:</td>
              <td colspan="2" class="border border-black p-3 text-center text-lg">
                {{ formatPrice(printData.data.thucLanh) }}
              </td>
            </tr>
          </tfoot>
        </table>

        <div class="flex justify-between mt-12 px-10">
          <div class="text-center">
            <p class="font-bold mb-16">Người lập phiếu</p>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
          <div class="text-center">
            <p class="font-bold mb-16">Nhân viên nhận</p>
            <p>{{ printData.user.hoTen }}</p>
          </div>
        </div>
      </div>

      <div v-if="printData.type === 'year'" class="space-y-6">
        <h2 class="text-xl font-bold text-center uppercase tracking-widest">
          BẢNG TỔNG HỢP LƯƠNG NĂM {{ printData.year }}
        </h2>
        <p class="text-center text-sm font-bold mb-6">Nhân viên: {{ printData.user.hoTen }} - Mã NV: {{ printData.user.maNhanVien }}</p>

        <table class="w-full text-sm border-collapse border border-black">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-black p-2 text-center w-16">THÁNG</th>
              <th class="border border-black p-2 text-right">LƯƠNG CƠ BẢN</th>
              <th class="border border-black p-2 text-right">TĂNG CA</th>
              <th class="border border-black p-2 text-right">PHỤ CẤP + THƯỞNG</th>
              <th class="border border-black p-2 text-right">KHẤU TRỪ</th>
              <th class="border border-black p-2 text-right font-bold">THỰC LÃNH</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="slip in printData.data" :key="slip.maLuong">
              <td class="border border-black p-2 text-center font-bold">{{ slip.thang }}</td>
              <td class="border border-black p-2 text-right">{{ formatPrice(slip.luongCoBan) }}</td>
              <td class="border border-black p-2 text-right">{{ formatPrice(slip.tongTienTangCa) }}</td>
              <td class="border border-black p-2 text-right">{{ formatPrice((slip.phuCapChucVu || 0) + (slip.phuCapKhac || 0) + (slip.thuong || 0)) }}</td>
              <td class="border border-black p-2 text-right">{{ formatPrice((slip.tongTienPhat || 0) + (slip.truBaoHiem || 0)) }}</td>
              <td class="border border-black p-2 text-right font-bold">{{ formatPrice(slip.thucLanh) }}</td>
            </tr>
          </tbody>
          <tfoot v-if="printData.data.length > 0">
            <tr class="bg-gray-100 font-bold">
              <td colspan="5" class="border border-black p-3 text-right">TỔNG THU NHẬP TRONG NĂM:</td>
              <td class="border border-black p-3 text-right text-lg">
                {{ formatPrice(printData.data.reduce((sum, item) => sum + Number(item.thucLanh), 0)) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const printData = ref(null);
const currentDate = ref(new Date().toLocaleDateString('vi-VN'));

const formatPrice = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

onMounted(() => {
  // 1. Lấy dữ liệu từ bộ nhớ tạm
  const storedData = localStorage.getItem('print_payslip_data');
  if (storedData) {
    printData.value = JSON.parse(storedData);
    
    // 2. Kích hoạt hộp thoại IN của trình duyệt sau nửa giây để Vue kịp Render HTML
    setTimeout(() => {
      window.print();
    }, 500);

    // Xóa bộ nhớ sau khi in xong cho sạch
    setTimeout(() => {
        localStorage.removeItem('print_payslip_data');
    }, 2000);
  }
});
</script>

<style scoped>
/* Reset toàn bộ nền, thiết lập font chữ chung cho màn hình */
:global(body) {
  background-color: #f3f4f6;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

.print-page {
  /* Ép font chữ chuẩn văn bản (Arial dễ nhìn, hoặc đổi thành 'Times New Roman' nếu muốn kiểu hóa đơn truyền thống) */
  font-family: Arial, Helvetica, sans-serif !important;
}

@media print {
  @page {
    size: A4 portrait; /* Khổ A4 dọc */
    margin: 15mm; 
  }
  
  /* Ẩn URL header/footer thừa của trình duyệt */
  :global(body) {
    background-color: white !important;
    margin: 0;
    padding: 0;
  }

  /* ÉP KHUÔN FONT CHỮ LÚC IN */
  * {
    /* Khóa tỷ lệ chữ, cấm trình duyệt tự phóng to thu nhỏ */
    -webkit-text-size-adjust: 100% !important;
    font-family: Arial, Helvetica, sans-serif !important; 
  }

  /* Dự phòng mạnh: Nếu do lỡ cấu hình sai Router mà Sidebar vẫn lọt vào, dòng này sẽ ép ẩn mọi thứ bên ngoài trang in */
  :global(#app > *:not(.print-page)) {
    display: none !important;
  }
}
</style>