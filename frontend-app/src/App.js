import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Cấu hình địa chỉ backend (sẽ đổi khi deploy Render)
const API_URL = 'http://localhost:5000/api/devices';

function App() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ deviceId: '', name: '', deviceType: '', room: '', quantity: 1, status: 'Đang sử dụng' });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // Lấy dữ liệu khi vừa mở trang
  useEffect(() => { fetchDevices(); }, []);

  const fetchDevices = async (keyword = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?search=${keyword}`);
      setDevices(res.data);
      setMsg('');
    } catch (err) { 
      setMsg('Lỗi tải dữ liệu từ server'); 
    }
    setLoading(false);
  };

  const handleSearch = (e) => { 
    e.preventDefault(); 
    fetchDevices(search); 
  };

  const handleChange = (e) => { 
    setForm({ ...form, [e.target.name]: e.target.value }); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`${API_URL}/${editId}`, form);
        setMsg('Cập nhật thiết bị thành công!');
      } else {
        await axios.post(API_URL, form);
        setMsg('Thêm thiết bị thành công!');
      }
      setForm({ deviceId: '', name: '', deviceType: '', room: '', quantity: 1, status: 'Đang sử dụng' });
      setIsEdit(false);
      fetchDevices();
    } catch (err) { 
      setMsg(err.response?.data?.error || 'Có lỗi xảy ra, vui lòng kiểm tra lại'); 
    }
  };

  const handleEdit = (d) => {
    setForm({ deviceId: d.deviceId, name: d.name, deviceType: d.deviceType, room: d.room, quantity: d.quantity, status: d.status });
    setIsEdit(true); 
    setEditId(d._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa thiết bị này?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMsg('Đã xóa thiết bị!'); 
      fetchDevices();
    } catch (err) { 
      setMsg('Lỗi khi xóa thiết bị'); 
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Hệ Thống Quản Lý Thiết Bị Phòng Học</h2>
      
      {msg && <p style={{ color: msg.includes('thành công') || msg.includes('Đã xóa') ? 'green' : 'red', fontWeight: 'bold' }}>{msg}</p>}
      {loading && <p>Đang tải dữ liệu...</p>}

      {/* Form Tìm kiếm */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <input 
          name="search" 
          placeholder="Nhập từ khóa (Tên, Mã, Phòng)..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          style={{ width: '300px', padding: '5px' }}
        />
        <button type="submit" style={{ padding: '5px 10px', marginLeft: '5px' }}>Tìm kiếm</button>
        <button type="button" onClick={() => {setSearch(''); fetchDevices('');}} style={{ padding: '5px 10px', marginLeft: '5px' }}>Xem Tất Cả</button>
      </form>

      {/* Form Thêm/Sửa */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', backgroundColor: '#f9f9f9' }}>
        <h3>{isEdit ? 'Sửa thông tin thiết bị' : 'Thêm thiết bị mới'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input name="deviceId" placeholder="Mã thiết bị (VD: PRJ01)" value={form.deviceId} onChange={handleChange} required disabled={isEdit} />
          <input name="name" placeholder="Tên thiết bị (VD: Máy chiếu Sony)" value={form.name} onChange={handleChange} required />
          <input name="deviceType" placeholder="Loại (VD: Máy chiếu)" value={form.deviceType} onChange={handleChange} required />
          <input name="room" placeholder="Phòng học (VD: A101)" value={form.room} onChange={handleChange} required />
          <input name="quantity" type="number" min="1" placeholder="Số lượng" value={form.quantity} onChange={handleChange} required />
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Đang sử dụng">Đang sử dụng</option>
            <option value="Hư hỏng">Hư hỏng</option>
            <option value="Đang sửa chữa">Đang sửa chữa</option>
            <option value="Ngừng sử dụng">Ngừng sử dụng</option>
          </select>
        </div>
        <br/>
        <button type="submit" style={{ padding: '8px 15px', cursor: 'pointer' }}>{isEdit ? 'Lưu Cập Nhật' : 'Thêm Thiết Bị'}</button>
        {isEdit && <button type="button" onClick={() => { setIsEdit(false); setForm({ deviceId: '', name: '', deviceType: '', room: '', quantity: 1, status: 'Đang sử dụng' }); }} style={{ padding: '8px 15px', marginLeft: '10px' }}>Hủy</button>}
      </form>

      {/* Bảng Hiển thị Danh sách */}
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ backgroundColor: '#eeeeee' }}>
          <tr>
            <th>Mã TB</th>
            <th>Tên Thiết Bị</th>
            <th>Loại</th>
            <th>Phòng</th>
            <th>SL</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {devices.length > 0 ? devices.map(d => (
            <tr key={d._id}>
              <td>{d.deviceId}</td>
              <td>{d.name}</td>
              <td>{d.deviceType}</td>
              <td>{d.room}</td>
              <td>{d.quantity}</td>
              <td style={{ color: d.status === 'Hư hỏng' ? 'red' : (d.status === 'Ngừng sử dụng' ? 'gray' : 'green'), fontWeight: 'bold' }}>{d.status}</td>
              <td>
                <button onClick={() => handleEdit(d)} style={{ marginRight: '5px' }}>Sửa</button>
                <button onClick={() => handleDelete(d._id)}>Xóa</button>
              </td>
            </tr>
          )) : <tr><td colSpan="7" style={{ textAlign: 'center' }}>Không có dữ liệu</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default App;