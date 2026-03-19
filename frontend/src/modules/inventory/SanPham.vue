<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Danh mục Sản phẩm</h2>
        <p class="text-slate-500">Quản lý thông tin máy tính, cấu hình và giá bán</p>
      </div>
      <el-button type="primary" size="large" @click="openAddModal" class="font-bold shadow-lg shadow-blue-500/30">
        <el-icon class="mr-2"><Plus /></el-icon> THÊM SẢN PHẨM MỚI
      </el-button>
    </div>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4">
      <el-input 
        v-model="searchQuery" 
        placeholder="Tìm theo Mã hoặc Tên sản phẩm..." 
        :prefix-icon="Search"
        class="!w-80"
        clearable
      />
      <el-select v-model="filterHang" placeholder="Lọc theo Hãng" clearable class="!w-48">
        <el-option v-for="hang in dbHangSP" :key="hang.maHang" :label="hang.tenHang" :value="hang.maHang" />
      </el-select>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <el-table :data="filteredProducts" style="width: 100%" size="large" v-loading="loading">
        
        <el-table-column label="Hình ảnh" width="90" align="center">
          <template #default="scope">
            <el-avatar shape="square" :size="50" :src="scope.row.hinhAnh" class="bg-slate-100 border border-slate-200">
              <el-icon :size="20" class="text-slate-300"><Monitor /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>

        <el-table-column prop="maSP" label="Mã SP" width="140">
          <template #default="scope">
            <span class="font-bold text-slate-700 font-mono text-xs bg-slate-100 px-2 py-1 rounded">{{ scope.row.maSP }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="tenSP" label="Tên Sản Phẩm" min-width="250">
          <template #default="scope">
            <p class="font-bold text-slate-800 line-clamp-1">{{ scope.row.tenSP }}</p>
            <p class="text-xs text-slate-500 mt-1 line-clamp-1">{{ scope.row.cauHinhSP }}</p>
          </template>
        </el-table-column>

        <el-table-column prop="maHang" label="Hãng" width="120">
          <template #default="scope">
            <el-tag type="info" effect="plain" class="font-bold">{{ getTenHang(scope.row.maHang) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Giá bán" width="150" align="right">
          <template #default="scope">
            <span class="font-bold text-blue-600">{{ formatPrice(scope.row.giaBan) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="soLuongTon" label="Tồn kho" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.soLuongTon > 0 ? 'success' : 'danger'" effect="dark" class="font-bold">
              {{ scope.row.soLuongTon }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="trangThai" label="Trạng thái" width="140" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.trangThai"
              :active-value="1"
              :inactive-value="0"
              active-text="Bán"
              inactive-text="Ngừng"
              inline-prompt
              style="--el-switch-on-color: #10b981; --el-switch-off-color: #ef4444"
              @change="toggleStatus(scope.row)"
            />
          </template>
        </el-table-column>

        <el-table-column label="Thao tác" width="100" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="openEditModal(scope.row)">
              <el-icon class="text-xl"><Edit /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog 
      v-model="dialogVisible" 
      :title="isEditMode ? 'CẬP NHẬT SẢN PHẨM' : 'THÊM SẢN PHẨM MỚI'" 
      width="700px"
      destroy-on-close
      class="custom-dialog"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-position="top" class="mt-2">
        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
          
          <el-form-item v-if="isEditMode" label="Mã Sản Phẩm (ID)" prop="maSP">
            <el-input-number v-model="formData.maSP" disabled class="!w-full" controls-position="right" />
          </el-form-item>
          
          <el-form-item label="Hãng Sản Xuất (maHang)" prop="maHang" :class="!isEditMode ? 'col-span-2' : ''">
            <el-select v-model="formData.maHang" placeholder="Chọn hãng" class="w-full">
              <el-option v-for="hang in dbHangSP" :key="hang.maHang" :label="hang.tenHang" :value="hang.maHang" />
            </el-select>
          </el-form-item>

          <el-form-item label="Tên Sản Phẩm" prop="tenSP" class="col-span-2">
            <el-input v-model="formData.tenSP" placeholder="VD: Dell XPS 13 Plus 9320" />
          </el-form-item>

          <el-form-item label="Cấu hình (CPU/RAM/SSD)" prop="cauHinhSP" class="col-span-2">
            <el-input v-model="formData.cauHinhSP" placeholder="VD: Core i7 12th / 16GB RAM / 512GB SSD" />
          </el-form-item>

          <el-form-item label="Giá Nhập (VND)" prop="giaNhap">
            <el-input-number v-model="formData.giaNhap" :min="0" :step="1000000" class="!w-full" controls-position="right" />
          </el-form-item>

          <el-form-item label="Giá Bán (VND)" prop="giaBan">
            <el-input-number v-model="formData.giaBan" :min="0" :step="1000000" class="!w-full" controls-position="right" />
          </el-form-item>

          <el-form-item label="Số Lượng Tồn Kho" prop="soLuongTon">
            <el-input-number v-model="formData.soLuongTon" class="!w-full" disabled />
            <span class="text-xs text-slate-400 mt-1 block">Tồn kho được cập nhật tự động qua phân hệ Nhập Kho/POS.</span>
          </el-form-item>

          <el-form-item label="Trạng Thái Kinh Doanh" prop="trangThai">
            <el-radio-group v-model="formData.trangThai">
              <el-radio :label="1" border>Đang kinh doanh</el-radio>
              <el-radio :label="0" border>Ngừng kinh doanh</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="Link Hình Ảnh (URL)" prop="hinhAnh" class="col-span-2">
            <el-input v-model="formData.hinhAnh" placeholder="https://..." clearable>
              <template #prefix><el-icon><Picture /></el-icon></template>
            </el-input>
          </el-form-item>

          <el-form-item label="Mô tả chi tiết" prop="moTa" class="col-span-2">
            <el-input v-model="formData.moTa" type="textarea" :rows="3" placeholder="Nhập mô tả sản phẩm..." />
          </el-form-item>

        </div>
      </el-form>
      
      <template #footer>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <el-button @click="dialogVisible = false" size="large">Hủy bỏ</el-button>
          <el-button type="primary" size="large" @click="saveProduct" :loading="saving" class="px-8 font-bold">
            {{ isEditMode ? 'LƯU THAY ĐỔI' : 'TẠO SẢN PHẨM' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Search, Plus, Edit, Monitor, Picture } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// --- MOCK DATABASE ---
const dbHangSP = ref([
  { maHang: 1, tenHang: 'Apple' },
  { maHang: 2, tenHang: 'Dell' },
  { maHang: 3, tenHang: 'Asus' },
  { maHang: 4, tenHang: 'HP' },
]);

const dbSanPham = ref([
  { 
    maSP: 1, maHang: 1, tenSP: 'MacBook Air M2 13 inch', 
    cauHinhSP: 'Apple M2 / 8GB / 256GB', moTa: 'Laptop mỏng nhẹ...', hinhAnh: '',
    soLuongTon: 15, giaNhap: 22000000, giaBan: 26490000, trangThai: 1 
  },
  { 
    maSP: 3, maHang: 2, tenSP: 'Dell XPS 13 Plus 9320',
    cauHinhSP: 'Core i7 / 16GB / 512GB', moTa: 'Laptop doanh nhân...', hinhAnh: '',
    soLuongTon: 3, giaNhap: 38000000, giaBan: 45000000, trangThai: 1 
  },
  { 
    maSP: 2, maHang: 3, tenSP: 'Asus ROG Strix G15', 
    cauHinhSP: 'Ryzen 7 / 16GB / RTX 3060', moTa: 'Laptop Gaming...', hinhAnh: '',
    soLuongTon: 0, giaNhap: 28000000, giaBan: 32990000, trangThai: 0 
  },
]);

// --- STATE ---
const loading = ref(false);
const saving = ref(false);
const searchQuery = ref('');
const filterHang = ref('');
const dialogVisible = ref(false);
const isEditMode = ref(false);
const formRef = ref(null);

// Khởi tạo Form theo đúng Schema DB
const initialForm = {
  maSP: '', maHang: null, tenSP: '', moTa: '', cauHinhSP: '', 
  hinhAnh: '', soLuongTon: 0, giaNhap: 0, giaBan: 0, trangThai: 1
};
const formData = ref({ ...initialForm });

// Validate Form
const rules = {
  maSP: [{ required: true, message: 'Vui lòng nhập Mã Sản Phẩm', trigger: 'blur' }],
  maHang: [{ required: true, message: 'Vui lòng chọn Hãng', trigger: 'change' }],
  tenSP: [{ required: true, message: 'Vui lòng nhập Tên SP', trigger: 'blur' }],
  giaBan: [{ required: true, message: 'Vui lòng nhập Giá Bán', trigger: 'blur' }],
};

// --- COMPUTED ---
const filteredProducts = computed(() => {
  return dbSanPham.value.filter(sp => {
    const matchQuery = sp.tenSP.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                       sp.maSP.toString().includes(searchQuery.value); // Thêm .toString()
    const matchHang = filterHang.value ? sp.maHang === filterHang.value : true;
    return matchQuery && matchHang;
  });
});

// --- METHODS ---
const formatPrice = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const getTenHang = (maHang) => {
  const hang = dbHangSP.value.find(h => h.maHang === maHang);
  return hang ? hang.tenHang : 'Khác';
};

const openAddModal = () => {
  isEditMode.value = false;
  formData.value = { ...initialForm };
  if (formRef.value) formRef.value.clearValidate();
  dialogVisible.value = true;
};

const openEditModal = (row) => {
  isEditMode.value = true;
  formData.value = { ...row }; // Copy dữ liệu dòng hiện tại vào Form
  if (formRef.value) formRef.value.clearValidate();
  dialogVisible.value = true;
};

// Bật/Tắt trạng thái kinh doanh nhanh ngay trên bảng
const toggleStatus = (row) => {
  const statusText = row.trangThai === 1 ? 'Đang kinh doanh' : 'Ngừng kinh doanh';
  ElMessage.success(`Đã chuyển trạng thái mã ${row.maSP} thành: ${statusText}`);
  // Trong thực tế sẽ gọi API: service.updateStatus(row.maSP, row.trangThai)
};

const saveProduct = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true;
      setTimeout(() => {
        if (isEditMode.value) {
          // UPDATE
          const index = dbSanPham.value.findIndex(sp => sp.maSP === formData.value.maSP);
          if (index !== -1) dbSanPham.value[index] = { ...formData.value };
          ElMessage.success('Cập nhật thành công!');
        } else {
          // INSERT - Tạo ID giả lập tự tăng (VD: 3, 4, 5...)
          const newId = Math.max(...dbSanPham.value.map(s => s.maSP), 0) + 1;
          formData.value.maSP = newId;
          
          dbSanPham.value.unshift({ ...formData.value });
          ElMessage.success('Tạo sản phẩm mới thành công!');
        }
        saving.value = false;
        dialogVisible.value = false;
      }, 600);
    }
  });
};
</script>

<style scoped>
:deep(.custom-dialog) { border-radius: 16px; overflow: hidden; }
:deep(.custom-dialog .el-dialog__header) { background-color: #f8fafc; margin-right: 0; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
:deep(.custom-dialog .el-dialog__title) { font-weight: 800; color: #0f172a; }
</style>