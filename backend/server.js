const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Device = require('./models/Device');

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Đã kết nối MongoDB Atlas'))
  .catch(err => console.error('Lỗi kết nối cơ sở dữ liệu:', err));

// API Kiểm tra sức khỏe
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Backend đang hoạt động tốt' });
});

// Lấy danh sách thiết bị & Tìm kiếm
app.get('/api/devices', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { deviceId: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } },
                    { deviceType: { $regex: search, $options: 'i' } },
                    { room: { $regex: search, $options: 'i' } }
                ]
            };
        }
        const devices = await Device.find(query);
        res.json(devices);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Lấy chi tiết 1 thiết bị
app.get('/api/devices/:id', async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);
        if (!device) return res.status(404).json({ error: 'Không tìm thấy thiết bị' });
        res.json(device);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Thêm thiết bị mới
app.post('/api/devices', async (req, res) => {
    try {
        const existingDevice = await Device.findOne({ deviceId: req.body.deviceId });
        if (existingDevice) return res.status(400).json({ error: 'Mã thiết bị đã tồn tại' });
        
        const newDevice = new Device(req.body);
        const savedDevice = await newDevice.save();
        res.status(201).json(savedDevice);
    } catch (err) {
        res.status(400).json({ error: 'Dữ liệu không hợp lệ', details: err.message });
    }
});

// Cập nhật thiết bị
app.put('/api/devices/:id', async (req, res) => {
    try {
        const updatedDevice = await Device.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedDevice) return res.status(404).json({ error: 'Không tìm thấy thiết bị' });
        res.json(updatedDevice);
    } catch (err) {
        res.status(400).json({ error: 'Lỗi khi cập nhật' });
    }
});

// Xóa thiết bị
app.delete('/api/devices/:id', async (req, res) => {
    try {
        const deletedDevice = await Device.findByIdAndDelete(req.params.id);
        if (!deletedDevice) return res.status(404).json({ error: 'Không tìm thấy thiết bị' });
        res.json({ message: 'Đã xóa thiết bị thành công' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server chạy tại cổng ${PORT}`));