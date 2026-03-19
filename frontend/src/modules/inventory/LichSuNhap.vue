<template>
  <div class="space-y-6 relative">
    
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <el-button link @click="$router.push('/inventory/stock')" class="!p-0 text-slate-400 hover:text-blue-500">
            <el-icon class="text-xl"><Back /></el-icon>
          </el-button>
          <h2 class="text-2xl font-bold text-slate-900">Lịch sử Nhập kho</h2>
        </div>
        <p class="text-slate-500 ml-7">Tra cứu các phiếu nhập hàng và chi tiết mã Serial</p>
      </div>
      <div class="flex gap-3">
        <el-input 
          v-model="searchQuery" 
          placeholder="Tìm theo Mã phiếu..." 
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
      <el-table :data="filteredPhiếu" style="width: 100%" size="large" stripe>
        
        <el-table-column prop="maPhieuNhap" label="Mã Phiếu" width="150">
          <template #default="scope">
            <span class="font-bold text-blue-600 font-mono">PN-{{ scope.row.maPhieuNhap }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="ngayNhap" label="Ngày Nhập" width="180">
          <template #default="scope">
            <div class="flex items-center gap-2 text-slate-600">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(scope.row.ngayNhap) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="tenNCC" label="Nhà Cung Cấp" min-width="250">
          <template #default="scope">
            <span class="font-semibold text-slate-800">{{ scope.row.tenNCC }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="tongTien" label="Tổng Giá Trị" min-width="180" align="right">
          <template #default="scope">
            <span class="font-bold text-emerald-600">{{ formatPrice(scope.row.tongTien) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Thao tác" width="150" align="center" fixed="right">
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
      title="CHI TIẾT PHIẾU NHẬP KHO" 
      width="850px"
      destroy-on-close
      class="custom-dialog"
    >
      <div v-if="selectedPhieu" class="space-y-6">
        
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-slate-500 mb-1">Mã phiếu nhập:</p>
            <p class="font-bold text-lg text-blue-600 font-mono">PN-{{ selectedPhieu.maPhieuNhap }}</p>
          </div>
          <div>
            <p class="text-slate-500 mb-1">Ngày lập phiếu:</p>
            <p class="font-bold text-slate-800">{{ formatDate(selectedPhieu.ngayNhap) }}</p>
          </div>
          <div class="col-span-2 border-t border-slate-200 pt-3">
            <p class="text-slate-500 mb-1">Nhà cung cấp:</p>
            <p class="font-bold text-slate-800">{{ selectedPhieu.tenNCC }}</p>
          </div>
        </div>

        <div>
          <h3 class="font-bold text-slate-800 mb-3">Danh sách sản phẩm nhập ({{ selectedPhieu.chiTiet.length }} mã)</h3>
          <el-table :data="selectedPhieu.chiTiet" style="width: 100%" border>
            
            <el-table-column type="expand">
              <template #default="props">
                <div class="p-4 bg-slate-50 border-y border-slate-200 shadow-inner">
                  <p class="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Danh sách Số Serial (maMay) đã nhập:</p>
                  <div class="flex flex-wrap gap-2">
                    <el-tag 
                      v-for="sn in props.row.serials" 
                      :key="sn" 
                      type="info" 
                      effect="plain" 
                      class="font-mono text-xs border-slate-300 text-slate-700 bg-white"
                    >
                      <el-icon class="mr-1"><FullScreen /></el-icon> {{ sn }}
                    </el-tag>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="maSP" label="Mã SP" width="140">
              <template #default="scope">
                <span class="font-mono text-slate-600 text-xs font-bold">{{ scope.row.maSP }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="tenSP" label="Tên Sản Phẩm" min-width="200">
              <template #default="scope">
                <span class="font-semibold text-slate-800">{{ scope.row.tenSP }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="donGiaNhap" label="Đơn giá nhập" width="130" align="right">
              <template #default="scope">
                {{ formatPrice(scope.row.donGiaNhap) }}
              </template>
            </el-table-column>

            <el-table-column prop="soLuong" label="SL" width="70" align="center">
              <template #default="scope">
                <span class="font-bold">{{ scope.row.soLuong }}</span>
              </template>
            </el-table-column>

            <el-table-column label="Thành tiền" width="150" align="right">
              <template #default="scope">
                <span class="font-bold text-emerald-600">{{ formatPrice(scope.row.donGiaNhap * scope.row.soLuong) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="flex justify-end pt-4 border-t border-slate-100">
          <div class="text-right">
            <p class="text-slate-500 text-sm mb-1">TỔNG GIÁ TRỊ PHIẾU NHẬP</p>
            <p class="text-2xl font-black text-blue-600">{{ formatPrice(selectedPhieu.tongTien) }}</p>
          </div>
        </div>

      </div>
      
      <template #footer>
        <div class="flex justify-end gap-3 pt-2">
          <el-button @click="dialogVisible = false" size="large">Đóng</el-button>
          <el-button type="primary" size="large" @click="handlePrint">
            <el-icon class="mr-2"><Printer /></el-icon> In Phiếu
          </el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Search, Calendar, Back, FullScreen, Printer } from '@element-plus/icons-vue';

// --- MOCK DATABASE (Dữ liệu đã được Backend Join từ các bảng PhieuNhap, NhaCungCap, ChiTiet, MayTinh) ---
const dbPhieuNhap = ref([
  {
    maPhieuNhap: 827364,
    ngayNhap: '2026-03-18T08:30:00Z',
    maNCC: 1,
    tenNCC: 'Công ty TNHH Dell Việt Nam', // Đã join từ bảng NhaCungCap
    tongTien: 114000000,
    chiTiet: [
      {
        maSP: '3',
        tenSP: 'Dell XPS 13 Plus 9320',
        soLuong: 3,
        donGiaNhap: 38000000,
        // Backend trả về mảng Serial gom nhóm theo từng mã SP
        serials: ['SN-DELL-11111', 'SN-DELL-22222', 'SN-DELL-33333'] 
      }
    ]
  },
  {
    maPhieuNhap: 192837,
    ngayNhap: '2026-03-19T10:15:00Z',
    maNCC: 2,
    tenNCC: 'Apple Vietnam LLC',
    tongTien: 110000000,
    chiTiet: [
      {
        maSP: '1',
        tenSP: 'MacBook Air M2 13 inch',
        soLuong: 5,
        donGiaNhap: 22000000,
        serials: ['SN-MAC-98765', 'SN-MAC-98766', 'SN-MAC-98767', 'SN-MAC-98768', 'SN-MAC-98769']
      }
    ]
  }
]);

// --- STATE ---
const searchQuery = ref('');
const dateRange = ref('');
const dialogVisible = ref(false);
const selectedPhieu = ref(null);

// --- COMPUTED ---
const filteredPhiếu = computed(() => {
  return dbPhieuNhap.value.filter(phieu => {
    // Lọc theo Mã phiếu (Ép kiểu về chuỗi để tìm kiếm)
    const matchSearch = phieu.maPhieuNhap.toString().includes(searchQuery.value);
    
    // Tạm bỏ qua logic lọc DateRange cho đỡ phức tạp phần Mock, 
    // thực tế bạn sẽ so sánh dateRange[0] và dateRange[1] với phieu.ngayNhap
    
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

const openDetail = (phieu) => {
  selectedPhieu.value = phieu;
  dialogVisible.value = true;
};

const handlePrint = () => {
  window.print(); // Gọi lệnh in cơ bản của trình duyệt
};
</script>

<style scoped>
/* Bo tròn Dialog cho hiện đại */
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
/* Tuỳ chỉnh hàng mở rộng (Expand row) của Table */
:deep(.el-table__expanded-cell) {
  padding: 0 !important;
}
</style>