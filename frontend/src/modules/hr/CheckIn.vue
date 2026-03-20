<template>
  <div class="flex items-center justify-center min-h-[80vh]">
    <div class="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md text-center relative overflow-hidden">
      
      <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-emerald-400"></div>

      <div class="mb-8 mt-4">
        <h1 class="text-6xl font-black text-slate-800 font-mono tracking-tighter mb-2">
          {{ currentTime }}
        </h1>
        <p class="text-lg text-slate-500 font-medium">{{ currentDate }}</p>
      </div>

      <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
        <el-avatar :size="70" class="mb-3 bg-blue-100 text-blue-600 font-bold text-xl">NV</el-avatar>
        <h2 class="text-2xl font-bold text-slate-800">Nguyễn Văn Admin</h2>
        <p class="text-sm text-slate-500 font-mono mt-1">Mã NV: 1 • Ca Hành Chính</p>
      </div>

      <div class="space-y-4">
        
        <el-button 
          v-if="!attendanceData.gioVao" 
          type="primary" 
          class="w-full !h-16 text-xl font-bold !rounded-xl shadow-lg shadow-blue-500/30"
          @click="handleCheckIn"
          :loading="loading"
        >
          <el-icon class="mr-2 text-2xl"><Location /></el-icon> CHECK IN (VÀO CA)
        </el-button>

        <el-button 
          v-else-if="!attendanceData.gioRa" 
          type="warning" 
          class="w-full !h-16 text-xl font-bold !rounded-xl shadow-lg shadow-amber-500/30"
          @click="handleCheckOut"
          :loading="loading"
        >
          <el-icon class="mr-2 text-2xl"><Timer /></el-icon> CHECK OUT (KẾT THÚC)
        </el-button>

        <div v-else class="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-200 font-bold flex items-center justify-center gap-2">
          <el-icon class="text-xl"><CircleCheckFilled /></el-icon>
          ĐÃ HOÀN THÀNH CA LÀM VIỆC
        </div>

      </div>

      <div class="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100">
        <div>
          <p class="text-xs text-slate-400 font-bold uppercase mb-1">Giờ vào</p>
          <p class="text-lg font-mono font-bold" :class="attendanceData.gioVao ? 'text-blue-600' : 'text-slate-300'">
            {{ attendanceData.gioVao || '--:--:--' }}
          </p>
        </div>
        <div>
          <p class="text-xs text-slate-400 font-bold uppercase mb-1">Giờ ra</p>
          <p class="text-lg font-mono font-bold" :class="attendanceData.gioRa ? 'text-amber-600' : 'text-slate-300'">
            {{ attendanceData.gioRa || '--:--:--' }}
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Location, Timer, CircleCheckFilled } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// --- STATE ---
const currentTime = ref('');
const currentDate = ref('');
const loading = ref(false);
let timer = null;

// Mock Dữ liệu chấm công hôm nay của Nhân viên này
const attendanceData = ref({
  gioVao: null, // VD: '07:55:00'
  gioRa: null   // VD: '17:05:00'
});

// --- CLOCK LOGIC ---
const updateClock = () => {
  const now = new Date();
  
  // Format Giờ:Phút:Giây (07:05:09)
  currentTime.value = now.toLocaleTimeString('vi-VN', { hour12: false });
  
  // Format Ngày tháng năm
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDate.value = now.toLocaleDateString('vi-VN', options);
};

// --- LIFECYCLE ---
onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000); // Cập nhật mỗi 1 giây
});

onUnmounted(() => {
  clearInterval(timer); // Xóa bộ đếm khi rời khỏi trang
});

// --- METHODS ---
const handleCheckIn = () => {
  ElMessageBox.confirm(
    `Xác nhận Check-in vào lúc <b>${currentTime.value}</b>?`,
    'Xác nhận vào ca',
    { confirmButtonText: 'Đồng ý', cancelButtonText: 'Hủy', dangerouslyUseHTMLString: true, type: 'info' }
  ).then(() => {
    loading.value = true;
    setTimeout(() => {
      // Lưu lại đúng cái giờ phút giây hiện tại lúc bấm nút
      attendanceData.value.gioVao = currentTime.value;
      
      // Ở DB thực tế: Sẽ gọi API truyền maNhanVien và currentTime lên Backend
      
      loading.value = false;
      ElMessage.success('\ Bắt đầu tính giờ VÀO CA thành công! Chúc bạn ngày mới năng lượng.');
    }, 800);
  }).catch(() => {});
};

const handleCheckOut = () => {
  ElMessageBox.confirm(
    `Xác nhận Check-out kết thúc ca lúc <b>${currentTime.value}</b>?`,
    'Xác nhận ra về',
    { confirmButtonText: 'Đồng ý', cancelButtonText: 'Hủy', dangerouslyUseHTMLString: true, type: 'warning' }
  ).then(() => {
    loading.value = true;
    setTimeout(() => {
      attendanceData.value.gioRa = currentTime.value;
      loading.value = false;
      ElMessage.success('Giờ làm KẾT THÚC thành công! Cảm ơn bạn đã vất vả.');
    }, 800);
  }).catch(() => {});
};
</script>