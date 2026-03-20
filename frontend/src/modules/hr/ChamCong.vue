<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Bảng Chấm Công Hằng Ngày</h2>
        <p class="text-slate-500">Quản lý giờ ra/vào, đi trễ và trạng thái làm việc của nhân viên</p>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-slate-600 font-semibold">Chọn ngày xem:</span>
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="Chọn ngày"
          format="DD/MM/YYYY"
          value-format="YYYY-MM-DD"
          :clearable="false"
          class="!w-48"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="p-3 bg-blue-50 text-blue-600 rounded-lg"><el-icon class="text-2xl"><UserFilled /></el-icon></div>
        <div><p class="text-sm text-slate-500">Tổng nhân viên</p><p class="text-xl font-bold">{{ dbNhanVien.length }}</p></div>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><el-icon class="text-2xl"><Check /></el-icon></div>
        <div><p class="text-sm text-slate-500">Có mặt</p><p class="text-xl font-bold">{{ countStatus('Đi làm') }}</p></div>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="p-3 bg-amber-50 text-amber-600 rounded-lg"><el-icon class="text-2xl"><Warning /></el-icon></div>
        <div><p class="text-sm text-slate-500">Đi trễ / Về sớm</p><p class="text-xl font-bold">{{ countLate }}</p></div>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="p-3 bg-rose-50 text-rose-600 rounded-lg"><el-icon class="text-2xl"><Remove /></el-icon></div>
        <div><p class="text-sm text-slate-500">Vắng / Nghỉ phép</p><p class="text-xl font-bold">{{ countStatus('Nghỉ phép') + countStatus('Nghỉ ốm') }}</p></div>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <el-table :data="attendanceList" style="width: 100%" size="large" stripe>
        
        <el-table-column prop="maNhanVien" label="Mã NV" width="100" align="center">
          <template #default="scope">
            <span class="font-bold text-slate-600 font-mono">NV{{ scope.row.maNhanVien }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Họ và Tên" min-width="200">
          <template #default="scope">
            <span class="font-bold text-slate-800">{{ scope.row.hoTen }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="gioVao" label="Giờ Vào (Check-in)" width="150" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.gioVao" :type="isLate(scope.row.gioVao) ? 'danger' : 'success'" effect="plain" class="font-mono font-bold text-sm">
              {{ scope.row.gioVao }}
            </el-tag>
            <span v-else class="text-slate-400 italic text-sm">- Chưa chấm -</span>
          </template>
        </el-table-column>

        <el-table-column prop="gioRa" label="Giờ Ra (Check-out)" width="150" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.gioRa" type="info" effect="plain" class="font-mono font-bold text-sm">
              {{ scope.row.gioRa }}
            </el-tag>
            <span v-else class="text-slate-400 italic text-sm">- Chưa chấm -</span>
          </template>
        </el-table-column>

        <el-table-column label="Tổng giờ làm" width="130" align="center">
          <template #default="scope">
            <span class="font-black text-blue-600">{{ calculateHours(scope.row.gioVao, scope.row.gioRa) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="trangThai" label="Trạng thái" width="150" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.trangThai)" effect="dark" class="font-bold w-24">
              {{ scope.row.trangThai }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Thao tác" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="openEditModal(scope.row)">
              <el-icon class="text-xl"><EditPen /></el-icon> Sửa
            </el-button>
          </template>
        </el-table-column>

      </el-table>
    </div>

    <el-dialog 
      v-model="dialogVisible" 
      title="ĐIỀU CHỈNH CHẤM CÔNG" 
      width="450px"
      destroy-on-close
      class="custom-dialog"
    >
      <div v-if="editingRecord" class="space-y-4">
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm mb-4">
          <p class="text-slate-500 mb-1">Nhân viên:</p>
          <p class="font-bold text-lg text-blue-600 mb-2">{{ editingRecord.hoTen }} (NV{{ editingRecord.maNhanVien }})</p>
          <p class="text-slate-500 mb-1">Ngày chấm công:</p>
          <p class="font-bold text-slate-800">{{ formatDateVN(selectedDate) }}</p>
        </div>

        <el-form label-position="top">
          <div class="grid grid-cols-2 gap-4">
            <el-form-item label="Giờ Check-in">
              <el-time-picker v-model="formTime.gioVao" format="HH:mm" value-format="HH:mm" placeholder="--:--" class="!w-full" />
            </el-form-item>
            <el-form-item label="Giờ Check-out">
              <el-time-picker v-model="formTime.gioRa" format="HH:mm" value-format="HH:mm" placeholder="--:--" class="!w-full" />
            </el-form-item>
          </div>
          <el-form-item label="Trạng thái hằng ngày">
            <el-select v-model="formTime.trangThai" class="w-full">
              <el-option label="Đi làm" value="Đi làm" />
              <el-option label="Nghỉ phép (Có đơn)" value="Nghỉ phép" />
              <el-option label="Nghỉ ốm (Có đơn)" value="Nghỉ ốm" />
              <el-option label="Vắng mặt (Không phép)" value="Vắng mặt" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-3 pt-2">
          <el-button @click="dialogVisible = false">Hủy</el-button>
          <el-button type="primary" @click="saveAttendance" class="font-bold">LƯU THAY ĐỔI</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Calendar, UserFilled, Check, Warning, Remove, EditPen } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// --- MOCK DATABASE ---
const dbNhanVien = ref([
  { maNhanVien: 1, hoTen: 'Nguyễn Văn Admin', trangThai: 1 },
  { maNhanVien: 2, hoTen: 'Trần Thị Sales', trangThai: 1 },
  { maNhanVien: 3, hoTen: 'Lê Văn Kho', trangThai: 1 },
]);

// Dữ liệu bảng ChamCong
const dbChamCong = ref([
  { maChamCong: 101, maNhanVien: 1, ngayLamViec: '2026-03-20', gioVao: '07:55', gioRa: '17:05', trangThai: 'Đi làm' },
  { maChamCong: 102, maNhanVien: 2, ngayLamViec: '2026-03-20', gioVao: '08:15', gioRa: null, trangThai: 'Đi làm' }, // Đi trễ, chưa về
  { maChamCong: 103, maNhanVien: 3, ngayLamViec: '2026-03-20', gioVao: null, gioRa: null, trangThai: 'Nghỉ phép' }, // Nghỉ có đơn
]);

// --- STATE ---
const today = new Date().toISOString().split('T')[0];
const selectedDate = ref(today);
const dialogVisible = ref(false);
const editingRecord = ref(null);
const formTime = ref({ gioVao: '', gioRa: '', trangThai: '' });

// Giờ làm việc chuẩn để tính đi trễ (8:00 AM)
const STANDARD_START_TIME = '08:00';

// --- COMPUTED: Ghép bảng NhanVien và ChamCong ---
const attendanceList = computed(() => {
  return dbNhanVien.value.map(nv => {
    // Tìm bản ghi chấm công của nhân viên này trong ngày được chọn
    const cc = dbChamCong.value.find(c => c.maNhanVien === nv.maNhanVien && c.ngayLamViec === selectedDate.value);
    
    // Nếu chưa có dữ liệu chấm công ngày đó, tạo data mặc định hiển thị
    return {
      maNhanVien: nv.maNhanVien,
      hoTen: nv.hoTen,
      maChamCong: cc ? cc.maChamCong : null,
      gioVao: cc ? cc.gioVao : null,
      gioRa: cc ? cc.gioRa : null,
      trangThai: cc ? cc.trangThai : 'Chưa có data'
    };
  });
});

// Thống kê nhanh
const countStatus = (status) => attendanceList.value.filter(item => item.trangThai === status).length;
const countLate = computed(() => attendanceList.value.filter(item => item.gioVao && isLate(item.gioVao)).length);

// --- METHODS ---
const formatDateVN = (dateStr) => {
  const parts = dateStr.split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const isLate = (gioVao) => {
  if (!gioVao) return false;
  return gioVao > STANDARD_START_TIME;
};

// Tính toán số giờ làm (soGioLam)
const calculateHours = (inTime, outTime) => {
  if (!inTime || !outTime) return '-';
  const [inH, inM] = inTime.split(':').map(Number);
  const [outH, outM] = outTime.split(':').map(Number);
  
  let diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
  // Trừ 1 tiếng nghỉ trưa nếu làm qua buổi trưa (Giả định nghỉ trưa 12h-13h)
  if (inH <= 12 && outH >= 13) diffMinutes -= 60;
  
  if (diffMinutes <= 0) return '0h';
  const hours = (diffMinutes / 60).toFixed(1);
  return `${hours}h`;
};

const getStatusType = (status) => {
  switch (status) {
    case 'Đi làm': return 'success';
    case 'Nghỉ phép': return 'warning';
    case 'Nghỉ ốm': return 'info';
    case 'Vắng mặt': return 'danger';
    default: return '';
  }
};

const openEditModal = (row) => {
  editingRecord.value = row;
  formTime.value = { 
    gioVao: row.gioVao || '', 
    gioRa: row.gioRa || '', 
    trangThai: row.trangThai !== 'Chưa có data' ? row.trangThai : 'Đi làm' 
  };
  dialogVisible.value = true;
};

const saveAttendance = () => {
  const index = dbChamCong.value.findIndex(c => c.maNhanVien === editingRecord.value.maNhanVien && c.ngayLamViec === selectedDate.value);
  
  if (index !== -1) {
    // Update
    dbChamCong.value[index].gioVao = formTime.value.gioVao || null;
    dbChamCong.value[index].gioRa = formTime.value.gioRa || null;
    dbChamCong.value[index].trangThai = formTime.value.trangThai;
  } else {
    // Insert mới nếu chưa có
    dbChamCong.value.push({
      maChamCong: Math.floor(Math.random() * 10000),
      maNhanVien: editingRecord.value.maNhanVien,
      ngayLamViec: selectedDate.value,
      gioVao: formTime.value.gioVao || null,
      gioRa: formTime.value.gioRa || null,
      trangThai: formTime.value.trangThai
    });
  }
  
  ElMessage.success('Cập nhật giờ công thành công!');
  dialogVisible.value = false;
};
</script>

<style scoped>
:deep(.custom-dialog) { border-radius: 16px; overflow: hidden; }
:deep(.custom-dialog .el-dialog__header) { background-color: #f8fafc; margin-right: 0; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
:deep(.custom-dialog .el-dialog__title) { font-weight: 800; color: #0f172a; }
</style>