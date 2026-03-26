<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Quản lý Tài khoản & Phân quyền</h2>
        <p class="text-slate-500">Cấp quyền truy cập hệ thống và thiết lập vai trò (Role) cho nhân viên</p>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 custom-tabs">
      
      <el-tab-pane label="TÀI KHOẢN NHÂN VIÊN" name="accounts">
        <div class="p-4">
          <div class="flex justify-between mb-4">
            <el-input v-model="searchAccount" placeholder="Tìm Username hoặc Tên NV..." class="!w-80" clearable>
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-button type="primary" @click="openAddAccount"><el-icon class="mr-2"><Plus /></el-icon> Cấp Tài Khoản Mới</el-button>
          </div>

          <el-table :data="filteredAccounts" style="width: 100%" size="large" border stripe>
            <el-table-column label="Nhân viên" min-width="200">
              <template #default="scope">
                <div class="flex items-center gap-3">
                  <el-avatar :size="40" class="bg-blue-100 text-blue-600 font-bold">NV</el-avatar>
                  <div>
                    <p class="font-bold text-slate-800">{{ getTenNhanVien(scope.row.maNhanVien) }}</p>
                    <p class="text-xs text-slate-500">Mã NV: {{ scope.row.maNhanVien }}</p>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="username" label="Username (Đăng nhập)" width="180">
              <template #default="scope">
                <span class="font-bold text-slate-700 font-mono bg-slate-100 px-2 py-1 rounded">{{ scope.row.username }}</span>
              </template>
            </el-table-column>

            <el-table-column label="Nhóm Quyền (Role)" width="180" align="center">
              <template #default="scope">
                <el-tag :type="getRoleColor(scope.row.maNhomQuyen)" effect="dark" class="font-bold">
                  {{ getTenNhomQuyen(scope.row.maNhomQuyen) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="trangThai" label="Trạng thái" width="120" align="center">
              <template #default="scope">
                <el-switch 
                  v-model="scope.row.trangThai" 
                  :active-value="1" 
                  :inactive-value="0"
                  style="--el-switch-on-color: #10b981; --el-switch-off-color: #ef4444"
                  @change="toggleStatus(scope.row)"
                />
              </template>
            </el-table-column>

            <el-table-column label="Thao tác" width="150" align="center" fixed="right">
              <template #default="scope">
                <el-button type="primary" link @click="openEditAccount(scope.row)" title="Đổi Quyền">
                  <el-icon class="text-xl"><EditPen /></el-icon>
                </el-button>
                <el-button type="warning" link @click="resetPassword(scope.row)" title="Reset Mật khẩu">
                  <el-icon class="text-xl"><Key /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="MA TRẬN PHÂN QUYỀN (ROLES)" name="roles">
        <div class="flex flex-col md:flex-row gap-6 p-4">
          
          <div class="w-full md:w-1/3 space-y-4">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-slate-800">Danh sách Vai trò</h3>
              <el-button type="primary" link size="small" @click="openAddRole">
                <el-icon><Plus /></el-icon> Thêm Role
              </el-button>
            </div>
            
            <div 
              v-for="role in dbNhomQuyen" :key="role.maNhomQuyen"
              @click="selectRole(role)"
              class="p-4 rounded-xl border-2 cursor-pointer transition-all duration-200"
              :class="selectedRole?.maNhomQuyen === role.maNhomQuyen ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-blue-300'"
            >
              <h4 class="font-bold text-slate-800 flex items-center gap-2">
                <el-icon :class="getRoleColorText(role.maNhomQuyen)"><User /></el-icon> {{ role.tenNhomQuyen }}
              </h4>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">{{ role.moTa }}</p>
            </div>
          </div>

          <div class="w-full md:w-2/3 bg-slate-50 p-6 rounded-2xl border border-slate-200" v-if="selectedRole">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h3 class="font-bold text-lg text-slate-800">Chi tiết quyền: <span class="text-blue-600">{{ selectedRole.tenNhomQuyen }}</span></h3>
                <p class="text-sm text-slate-500">Tích chọn các hành động được phép thực hiện.</p>
              </div>
              <el-button type="primary" @click="savePermissions"><el-icon class="mr-2"><Check /></el-icon> LƯU PHÂN QUYỀN</el-button>
            </div>

            <el-table :data="permissionMatrix" style="width: 100%" border size="small">
              <el-table-column prop="tenChucNang" label="Module (Chức năng)" min-width="180">
                <template #default="scope">
                  <span class="font-bold text-slate-700">{{ scope.row.tenChucNang }}</span>
                  <span class="block text-xs text-slate-400 font-mono">{{ scope.row.maChucNang }}</span>
                </template>
              </el-table-column>
              
              <el-table-column label="Xem (View)" width="90" align="center">
                <template #default="scope"><el-checkbox v-model="scope.row.actions.View" /></template>
              </el-table-column>
              <el-table-column label="Thêm (Add)" width="90" align="center">
                <template #default="scope"><el-checkbox v-model="scope.row.actions.Add" /></template>
              </el-table-column>
              <el-table-column label="Sửa (Edit)" width="90" align="center">
                <template #default="scope"><el-checkbox v-model="scope.row.actions.Edit" /></template>
              </el-table-column>
              <el-table-column label="Xóa (Delete)" width="90" align="center">
                <template #default="scope"><el-checkbox v-model="scope.row.actions.Delete" /></template>
              </el-table-column>
            </el-table>
          </div>
          
          <div v-else class="w-full md:w-2/3 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
            <p class="text-slate-400 font-semibold">Vui lòng chọn một Nhóm Quyền bên trái để xem chi tiết.</p>
          </div>

        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="dialogAccountVisible" :title="isEditAccount ? 'CẬP NHẬT TÀI KHOẢN' : 'CẤP TÀI KHOẢN MỚI'" width="500px" class="custom-dialog">
      <el-form label-position="top">
        <el-form-item label="Chọn Nhân viên" v-if="!isEditAccount">
          <el-select v-model="formAccount.maNhanVien" class="w-full" filterable placeholder="Gõ tên hoặc mã NV...">
            <el-option v-for="nv in dbNhanVien" :key="nv.maNhanVien" :label="`${nv.hoTen} (NV${nv.maNhanVien})`" :value="nv.maNhanVien" />
          </el-select>
        </el-form-item>

        <el-form-item label="Tên đăng nhập (Username)">
          <el-input v-model="formAccount.username" :disabled="isEditAccount" placeholder="VD: nguyenvan_admin" />
          <span v-if="!isEditAccount" class="text-xs text-slate-400 mt-1">Mật khẩu mặc định sẽ là: <b>123456</b> (Yêu cầu đổi khi đăng nhập)</span>
        </el-form-item>

        <el-form-item label="Nhóm Quyền (Role)">
          <el-select v-model="formAccount.maNhomQuyen" class="w-full">
            <el-option v-for="role in dbNhomQuyen" :key="role.maNhomQuyen" :label="role.tenNhomQuyen" :value="role.maNhomQuyen" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogAccountVisible = false">Hủy</el-button>
        <el-button type="primary" @click="saveAccount" class="font-bold">LƯU TÀI KHOẢN</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogRoleVisible" title="THÊM NHÓM QUYỀN MỚI" width="450px" class="custom-dialog">
      <el-form label-position="top">
        <el-form-item label="Tên Nhóm Quyền (Role)">
          <el-input v-model="formRole.tenNhomQuyen" placeholder="VD: Thực tập sinh Kho" />
        </el-form-item>
        <el-form-item label="Mô tả chi tiết">
          <el-input v-model="formRole.moTa" type="textarea" :rows="3" placeholder="Mô tả ngắn gọn về quyền hạn của nhóm này..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogRoleVisible = false">Hủy</el-button>
        <el-button type="primary" @click="saveRole" class="font-bold">TẠO NHÓM QUYỀN</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Search, Plus, EditPen, Key, User, Check } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// --- MOCK DATABASE ---
const dbNhanVien = ref([
  { maNhanVien: 1, hoTen: 'Nguyễn Văn Admin' },
  { maNhanVien: 2, hoTen: 'Trần Thị Sales' },
  { maNhanVien: 3, hoTen: 'Lê Văn Kho' },
]);

const dbNhomQuyen = ref([
  { maNhomQuyen: 1, tenNhomQuyen: 'Administrator', moTa: 'Toàn quyền quản trị hệ thống' },
  { maNhomQuyen: 2, tenNhomQuyen: 'Thu ngân (POS)', moTa: 'Quyền bán hàng, xuất hóa đơn' },
  { maNhomQuyen: 3, tenNhomQuyen: 'Quản lý Kho', moTa: 'Quyền nhập hàng, xuất kho, serial' },
]);

const dbChucNang = ref([
  { maChucNang: 'QL_BANHANG', tenChucNang: 'Phân hệ Bán Hàng (POS)' },
  { maChucNang: 'QL_KHO', tenChucNang: 'Phân hệ Kho hàng' },
  { maChucNang: 'QL_NHANSU', tenChucNang: 'Phân hệ Nhân sự & Lương' },
  { maChucNang: 'QL_HETHONG', tenChucNang: 'Cấu hình & Tài khoản' },
]);

const dbPhanQuyen = ref([
  { maNhomQuyen: 2, maChucNang: 'QL_BANHANG', actions: { View: true, Add: true, Edit: true, Delete: false } },
  { maNhomQuyen: 2, maChucNang: 'QL_KHO', actions: { View: true, Add: false, Edit: false, Delete: false } },
]);

const dbTaiKhoan = ref([
  { maNhanVien: 1, username: 'admin', maNhomQuyen: 1, trangThai: 1 },
  { maNhanVien: 2, username: 'thungan_tran', maNhomQuyen: 2, trangThai: 1 },
  { maNhanVien: 3, username: 'thukho_le', maNhomQuyen: 3, trangThai: 0 },
]);

// --- STATE ---
const activeTab = ref('accounts');

// State cho Tab 1 (Tài khoản)
const searchAccount = ref('');
const dialogAccountVisible = ref(false);
const isEditAccount = ref(false);
const formAccount = ref({ maNhanVien: null, username: '', maNhomQuyen: null });

// State cho Tab 2 (Nhóm quyền)
const selectedRole = ref(null);
const permissionMatrix = ref([]);
const dialogRoleVisible = ref(false);
const formRole = ref({ tenNhomQuyen: '', moTa: '' });

// --- COMPUTED (TAB 1) ---
const filteredAccounts = computed(() => {
  return dbTaiKhoan.value.filter(tk => {
    const nv = dbNhanVien.value.find(n => n.maNhanVien === tk.maNhanVien);
    const tenNV = nv ? nv.hoTen.toLowerCase() : '';
    const query = searchAccount.value.toLowerCase();
    return tk.username.toLowerCase().includes(query) || tenNV.includes(query);
  });
});

// --- METHODS (TAB 1: TÀI KHOẢN) ---
const getTenNhanVien = (id) => dbNhanVien.value.find(nv => nv.maNhanVien === id)?.hoTen || 'Unknown';
const getTenNhomQuyen = (id) => dbNhomQuyen.value.find(q => q.maNhomQuyen === id)?.tenNhomQuyen || 'Trống';

const getRoleColor = (id) => {
  if (id === 1) return 'danger';
  if (id === 2) return 'success';
  if (id === 3) return 'warning';
  return 'info';
};
const getRoleColorText = (id) => `text-${getRoleColor(id)}-600`;

const toggleStatus = (row) => {
  const stt = row.trangThai === 1 ? 'MỞ KHÓA' : 'KHÓA';
  ElMessage.success(`Đã ${stt} tài khoản ${row.username}`);
};

const openAddAccount = () => {
  isEditAccount.value = false;
  formAccount.value = { maNhanVien: null, username: '', maNhomQuyen: null };
  dialogAccountVisible.value = true;
};

const openEditAccount = (row) => {
  isEditAccount.value = true;
  formAccount.value = { ...row };
  dialogAccountVisible.value = true;
};

const saveAccount = () => {
  dialogAccountVisible.value = false;
  ElMessage.success(isEditAccount.value ? 'Cập nhật quyền thành công!' : 'Cấp tài khoản mới thành công!');
};

const resetPassword = (row) => {
  ElMessageBox.confirm(`Đưa mật khẩu của ${row.username} về mặc định (123456)?`, 'Reset Mật Khẩu', {
    confirmButtonText: 'Đồng ý', cancelButtonText: 'Hủy', type: 'warning'
  }).then(() => {
    ElMessage.success(`Đã reset mật khẩu cho ${row.username}`);
  }).catch(() => {});
};

// --- METHODS (TAB 2: THÊM ROLE & MATRIX) ---
const openAddRole = () => {
  formRole.value = { tenNhomQuyen: '', moTa: '' };
  dialogRoleVisible.value = true;
};

const saveRole = () => {
  if (!formRole.value.tenNhomQuyen.trim()) {
    ElMessage.error('Vui lòng nhập tên Nhóm Quyền!');
    return;
  }
  
  // Tự động sinh ID mới
  const newId = dbNhomQuyen.value.length > 0 ? Math.max(...dbNhomQuyen.value.map(r => r.maNhomQuyen)) + 1 : 1;
  
  dbNhomQuyen.value.push({
    maNhomQuyen: newId,
    tenNhomQuyen: formRole.value.tenNhomQuyen,
    moTa: formRole.value.moTa
  });
  
  dialogRoleVisible.value = false;
  ElMessage.success('Tạo Nhóm Quyền mới thành công!');
};

const selectRole = (role) => {
  selectedRole.value = role;
  
  permissionMatrix.value = dbChucNang.value.map(cn => {
    const existRule = dbPhanQuyen.value.find(pq => pq.maNhomQuyen === role.maNhomQuyen && pq.maChucNang === cn.maChucNang);
    const isAdmin = role.maNhomQuyen === 1;
    
    return {
      maChucNang: cn.maChucNang,
      tenChucNang: cn.tenChucNang,
      actions: {
        View: isAdmin ? true : (existRule?.actions.View || false),
        Add: isAdmin ? true : (existRule?.actions.Add || false),
        Edit: isAdmin ? true : (existRule?.actions.Edit || false),
        Delete: isAdmin ? true : (existRule?.actions.Delete || false),
      }
    };
  });
};

const savePermissions = () => {
  ElMessage.success(`Đã lưu phân quyền cho nhóm: ${selectedRole.value.tenNhomQuyen}`);
};
</script>

<style scoped>
:deep(.custom-dialog) { border-radius: 16px; overflow: hidden; }
:deep(.custom-dialog .el-dialog__header) { background-color: #f8fafc; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
:deep(.custom-dialog .el-dialog__title) { font-weight: 800; color: #0f172a; }

/* Tùy chỉnh thanh Tabs */
:deep(.custom-tabs .el-tabs__nav-wrap::after) { background-color: transparent; }
:deep(.custom-tabs .el-tabs__item) { font-weight: 600; font-size: 15px; color: #64748b; padding: 0 24px; }
:deep(.custom-tabs .el-tabs__item.is-active) { color: #2563eb; }
:deep(.custom-tabs .el-tabs__active-bar) { background-color: #2563eb; height: 3px; border-radius: 3px; }
</style>