const HrModel = require('./hr.model');

const HrController = {
    // Lay danh sach nhan vien
    getAll: async (req, res) => {
        try {
            const { keyword, maChucVu, page, limit } = req.query;
            const result = await HrModel.getAllNhanVien({ keyword, maChucVu, page, limit });
            res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi lấy danh sách nhân viên'
            });
        }
    },

    // Lay chi tiet 1 nhan vien
    getOne: async (req, res) => {
        try {
            const { id } = req.params;
            const nhanVien = await HrModel.getNhanVienById(id);
            if (!nhanVien) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy nhân viên'
                });
            }
            res.status(200).json({
                success: true,
                data: nhanVien
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Lỗi máy chủ khi lấy chi tiết nhân viên'
            });
        }
    },

    // Thêm mới nhân viên
    create: async (req, res) => {
        try {
            const newId = await HrModel.createNhanVien(req.body);
            res.status(201).json({ success: true, message: 'Thêm nhân viên thành công', id: newId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi khi thêm nhân viên' });
        }
    },

    // Cập nhật thông tin nhân viên
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const affetedRows = await HrModel.updateNhanVien(id, req.body);
            if (affetedRows === 0) {
                return res.status(404).json({ success: false, message: 'Nhân viên không tồn tại' });
            }
            res.status(200).json({ success: true, message: 'Cập nhật nhân viên thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi khi cập nhật nhân viên' });
        }
    },

    // Xóa nhân viên
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const affetedRows = await HrModel.deleteNhanVien(id);
            if (affetedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Nhân viên không tồn tại'
                });
            }
            res.status(200).json({
                success: true,
                message: 'Đã xóa nhân viên'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa nhân viên'
            });
        }
    },
    // Xử lý API Thăng/giang chức
    changeChucVu: async (req, res) => {
        try {
            const { id } = req.params;
            const { maChucVuMoi, ngayHieuLuc } = req.body;
            if (!maChucVuMoi || !ngayHieuLuc) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp mã chức vụ mới và ngày bắt đầu'
                });
            }
            await HrModel.thangChuc(id, maChucVuMoi, ngayHieuLuc);
            res.status(200).json({
                success: true,
                message: 'Đã cập nhật chức vụ và lưu lịch sử thành công!'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Lỗi máy chủ khi cập nhật chức vụ'
            });
        }
    },

    // Lay danh sach chuc vu
    getAllChucVu: async (req, res) => {
        try {
            const chucVuList = await HrModel.getAllChucVu();
            res.status(200).json({ success: true, data: chucVuList });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Lỗi máy chủ khi lấy danh sách chức vụ'
            });
        }
    },

    // Cham cong - Nhân viên tự chấm công cho mình
    ghiNhanChamCong: async (req, res) => {
        try {
            const maNhanVien = req.user.maNhanVien;
            // Lấy ngày và giờ thực tế từ Server
            const now = new Date();
            const ngayHienTai = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            const gioHienTai = now.toTimeString().split(' ')[0]; // Format: HH:MM:SS
            // Quy định giờ làm việc chuẩn
            const GIO_VAO_CHUAN = '08:00:00';
            const GIO_RA_CHUAN = '17:00:00';
            const chamCongHomNay = await HrModel.getChamCongNgayHienTai(maNhanVien, ngayHienTai);
            // chua cham cong
            if (!chamCongHomNay) {
                // =============== XỬ LÝ CHECK-IN ===============
                let trangThaiChot = (gioHienTai > GIO_VAO_CHUAN) ? 'Đi trễ' : 'Đúng giờ';
                await HrModel.checkIn(maNhanVien, ngayHienTai, gioHienTai, trangThaiChot);
                return res.status(200).json({
                    success: true,
                    message: `Check-in thành công lúc ${gioHienTai}`,
                    trangThai: trangThaiChot
                });
            } else {
                // =============== XỬ LÝ CHECK-OUT ===============
                if (chamCongHomNay.gioRa) {
                    return res.status(400).json({ success: false, message: 'Bạn đã hoàn tất chấm công ra về cho ngày hôm nay rồi!' });
                }
                if (gioHienTai > GIO_RA_CHUAN) {
                    trangThaiChot += 'và Tăng ca';
                }
                await HrModel.checkOut(maNhanVien, ngayHienTai, gioHienTai, trangThaiChot);

                return res.status(200).json({
                    success: true,
                    message: `Check-out thành công lúc ${gioHienTai}. Trạng thái ngày: ${trangThaiChot}`
                });
            }

        } catch (error) {
            console.error("Lỗi API Chấm Công:", error);
            res.status(500).json({ success: false, message: 'Lỗi hệ thống khi chấm công' });
        }
    },

    // Tính lương
    TinhLuong: async (req, res) => {
        try {
            const { thang, nam } = req.body;
            const cauhinh = await HrModel.getCauHinh();
            const dsNhanVien = await HrModel.chotBangLuongThang(thang, nam, cauhinh);
            if (dsNhanVien === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không có nhân viên nào được tính lương'
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: 'Đã tính lương cho ' + dsNhanVien + ' nhân viên!'
                });
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi tính lương nhân viên'
            })
        }
    },
    
    // Cap nhat bảng lương: thuong/phat (Admin)
    updateBangLuong: async (req, res) => {
        try {
            const { thang, nam, dsNhanVien, thuong, phat } = req.body;
            if (!thang || !nam || (thuong === 0 && phat === 0)) {
                return res.status(400).json({
                    success: false,
                    massage: 'Dữ liệu không hợp lệ, vui lòng nhập lại!'
                });
            }
            if (!dsNhanVien) {
                return res.status(400).json({
                    success: false,
                    massage: 'Không hợp lệ, vui lòng chọn nhân viên!'
                });
            }

            const affectedRow = await HrModel.updateBangLuong(thang, nam, dsNhanVien, thuong, phat)
            if (affectedRow === 0) return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhân viên hợp lệ!'
            });

            return res.status(200).json({
                success: true,
                message: 'Đã thêm tiền thưởng/phạt thành công!'
            });
        } catch(error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống khi cập nhật lương'
            });
        }
    },

};

module.exports = HrController;