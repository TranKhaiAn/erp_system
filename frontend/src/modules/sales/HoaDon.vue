<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Quản lý Hóa Đơn Bán Hàng</h2>
        <p class="text-slate-500">Tra cứu lịch sử giao dịch, chi tiết đơn hàng và số Serial đã xuất</p>
      </div>
      <div class="flex gap-3">
        <el-input 
          v-model="searchQuery" 
          placeholder="Tìm Mã HĐ hoặc SĐT khách..." 
          :prefix-icon="Search"
          class="!w-64"
          clearable
        />
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="Đến"
          start-placeholder="Từ ngày"
          end-placeholder="Đến ngày"
          format="DD/MM/YYYY"
          class="!w-72"
        />
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <el-table :data="filteredHoaDon" style="width: 100%" size="large" stripe>
        
        <el-table-column prop="maHoaDon" label="Mã Hóa Đơn" width="140">
          <template #default="scope">
            <span class="font-bold text-blue-600 font-mono">{{ scope.row.maHoaDon }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="ngayLap" label="Ngày Lập" width="180">
          <template #default="scope">
            <div class="flex items-center gap-2 text-slate-600">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(scope.row.ngayLap) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Khách Hàng" min-width="200">
          <template #default="scope">
            <div>
              <p class="font-bold text-slate-800">{{ scope.row.tenKH }}</p>
              <p class="text-xs text-slate-500 font-mono mt-0.5"><el-icon><Phone /></el-icon> {{ scope.row.sdt }}</p>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Thanh Toán (Doanh thu)" width="180" align="right">
          <template #default="scope">
            <span class="font-black text-emerald-600">{{ formatPrice(scope.row.thanhTien) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Thao tác" width="130" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" plain size="small" @click="openDetail(scope.row)">
              Xem chi tiết
            </el-button>
          </template>
        </el-table-column>

      </el-table>
    </div>

    <el-dialog 
      v-model="dialogVisible" 
      title="CHI TIẾT GIAO DỊCH" 
      width="850px"
      destroy-on-close
      class="custom-dialog"
    >
      <div v-if="selectedHoaDon" class="space-y-6">
        
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
          <div>
            <p class="text-slate-500 mb-1">Mã Hóa Đơn:</p>
            <p class="font-bold text-lg text-blue-600 font-mono">HD-{{ selectedHoaDon.maHoaDon }}</p>
          </div>
          <div>
            <p class="text-slate-500 mb-1">Ngày bán:</p>
            <p class="font-bold text-slate-800">{{ formatDate(selectedHoaDon.ngayLap) }}</p>
          </div>
          <div class="border-t border-slate-200 pt-3">
            <p class="text-slate-500 mb-1">Khách hàng:</p>
            <p class="font-bold text-slate-800">{{ selectedHoaDon.tenKH }}</p>
            <p class="text-slate-600">{{ selectedHoaDon.sdt }}</p>
          </div>
          <div class="border-t border-slate-200 pt-3">
            <p class="text-slate-500 mb-1">Nhân viên bán hàng:</p>
            <p class="font-bold text-slate-800">NV01 - Nguyễn Văn Admin</p>
          </div>
        </div>

        <div>
          <h3 class="font-bold text-slate-800 mb-3">Sản phẩm đã mua</h3>
          <el-table :data="selectedHoaDon.chiTiet" style="width: 100%" border>
            
            <el-table-column type="expand">
              <template #default="props">
                <div class="p-4 bg-slate-50 border-y border-slate-200 shadow-inner">
                  <p class="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Số Serial (maMay) đã xuất cho khách:</p>
                  <div class="flex flex-wrap gap-2">
                    <el-tag 
                      v-for="sn in props.row.serials" 
                      :key="sn" 
                      type="success" 
                      effect="light" 
                      class="font-mono text-xs border-emerald-300 text-emerald-700 bg-emerald-50"
                    >
                      <el-icon class="mr-1"><FullScreen /></el-icon> {{ sn }}
                    </el-tag>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="tenSP" label="Tên Sản Phẩm" min-width="200">
              <template #default="scope">
                <span class="font-semibold text-slate-800">{{ scope.row.tenSP }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="donGia" label="Đơn giá bán" width="130" align="right">
              <template #default="scope">
                {{ formatPrice(scope.row.donGia) }}
              </template>
            </el-table-column>

            <el-table-column prop="soLuong" label="SL" width="70" align="center">
              <template #default="scope">
                <span class="font-bold">{{ scope.row.soLuong }}</span>
              </template>
            </el-table-column>

            <el-table-column label="Thành tiền" width="150" align="right">
              <template #default="scope">
                <span class="font-bold text-blue-600">{{ formatPrice(scope.row.thanhTien) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="flex justify-end pt-4 border-t border-slate-100">
          <div class="text-right space-y-1">
            <div class="flex justify-between gap-8 text-sm text-slate-500">
              <span>Tổng cộng:</span>
              <span>{{ formatPrice(selectedHoaDon.tongTien) }}</span>
            </div>
            <div class="flex justify-between gap-8 text-xl mt-2 pt-2 border-t border-slate-200">
              <span class="font-bold text-slate-800">KHÁCH ĐÃ TRẢ:</span>
              <span class="font-black text-emerald-600">{{ formatPrice(selectedHoaDon.thanhTien) }}</span>
            </div>
          </div>
        </div>

      </div>
      
      <template #footer>
        <div class="flex justify-end gap-3 pt-2">
          <el-button @click="dialogVisible = false" size="large">Đóng</el-button>
          <el-button type="primary" size="large" @click="handlePrint">
            <el-icon class="mr-2"><Printer /></el-icon> In Lại Hóa Đơn
          </el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Search, Calendar, Phone, FullScreen, Printer } from '@element-plus/icons-vue';

// --- MOCK DATABASE TỔNG HỢP CHO FRONTEND ---
// Dữ liệu này giả định Backend đã gộp từ KhachHang, HoaDon, ChiTietHoaDon và MayTinh
const dbHoaDon = ref([
  {
    maHoaDon: 1001,
    ngayLap: '2026-03-20T10:15:00Z',
    maKH: 1,
    tenKH: 'Nguyễn Văn A',
    sdt: '0901234567',
    tongTien: 26490000,
    thanhTien: 26490000, // Nếu có giảm giá thì thanhTien sẽ thấp hơn tongTien
    chiTiet: [
      {
        maSP: 1,
        tenSP: 'MacBook Air M2 13 inch',
        soLuong: 1,
        donGia: 26490000,
        donGiaGoc: 22000000, // Lấy từ ChiTietPhieuNhap lên
        thanhTien: 26490000,
        serials: ['SN-MAC-33333'] // Khớp với bảng Máy Tính hôm trước
      }
    ]
  },
  {
    maHoaDon: 1002,
    ngayLap: '2026-03-20T14:30:00Z',
    maKH: 2,
    tenKH: 'Trần Thị B',
    sdt: '0988777666',
    tongTien: 77990000,
    thanhTien: 77990000,
    chiTiet: [
      {
        maSP: 3,
        tenSP: 'Asus ROG Strix G15',
        soLuong: 1,
        donGia: 32990000,
        donGiaGoc: 28000000,
        thanhTien: 32990000,
        serials: ['SN-ASUS-999']
      },
      {
        maSP: 2,
        tenSP: 'Dell XPS 13 Plus 9320',
        soLuong: 1,
        donGia: 45000000,
        donGiaGoc: 38000000,
        thanhTien: 45000000,
        serials: ['SN-DELL-555']
      }
    ]
  }
]);

// --- STATE ---
const searchQuery = ref('');
const dateRange = ref('');
const dialogVisible = ref(false);
const selectedHoaDon = ref(null);

// --- COMPUTED ---
const filteredHoaDon = computed(() => {
  return dbHoaDon.value.filter(hd => {
    const query = searchQuery.value.toLowerCase();
    // Tìm theo mã hóa đơn hoặc số điện thoại
    const matchSearch = hd.maHoaDon.toString().includes(query) || hd.sdt.includes(query);
    return matchSearch;
  });
});

// --- METHODS ---
const formatPrice = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
};

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('vi-VN', { 
    day: '2-digit', month: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit'
  });
};

const openDetail = (hoadon) => {
  selectedHoaDon.value = hoadon;
  dialogVisible.value = true;
};

const handlePrint = () => {
  // Thực tế sẽ gọi lại Component BillPrintDialog giống bên trang POS
  window.print();
};
</script>

<style scoped>
:deep(.custom-dialog) {
  border-radius: 16px;
  overflow: hidden;
}
:deep(.custom-dialog .el-dialog__header) {
  background-color: #f8fafc;
  margin-right: 0;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}
:deep(.custom-dialog .el-dialog__title) {
  font-weight: 800;
  color: #0f172a;
}
:deep(.el-table__expanded-cell) {
  padding: 0 !important;
}
</style>