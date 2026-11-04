import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    bookId: '', title: '', author: '', category: '', publisher: '', publishYear: '', isbn: '', quantity: '', description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  // Sử dụng đúng đường dẫn tuyệt đối port 5000 trên Codespaces của bạn
  const API_URL = 'https://paranormal-spooky-gravestone-77wqx64xxw97crw-5000.app.github.dev/api/books';
  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${API_URL}?search=${search}`);
      setBooks(res.data);
      setMessage(''); // Xóa thông báo lỗi nếu tải thành công
    } catch (err) {
      console.error('Lỗi khi tải danh sách sách:', err);
      setMessage('Có lỗi xảy ra khi kết nối tới Server!');
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
        setMessage('Cập nhật sách thành công!');
      } else {
        await axios.post(API_URL, form);
        setMessage('Thêm sách thành công!');
      }
      setForm({ bookId: '', title: '', author: '', category: '', publisher: '', publishYear: '', isbn: '', quantity: '', description: '' });
      setEditingId(null);
      fetchBooks();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Có lỗi xảy ra khi lưu sách');
    }
  };

  const handleEdit = (book) => {
    setForm(book);
    setEditingId(book._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sách này?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setMessage('Xóa sách thành công!');
        fetchBooks();
      } catch (err) {
        setMessage('Lỗi khi xóa sách');
      }
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>QUẢN LÝ THƯ VIỆN SÁCH - MSSV: 234945 - Nguyễn Chí Công</h2>
      {message && <p style={{ color: message.includes('thành công') ? 'green' : 'red', fontWeight: 'bold' }}>{message}</p>}

      {/* Form thêm/sửa sách */}
      <form onSubmit={handleSubmit} style={{ background: '#f4f4f4', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
        <h3>{editingId ? 'Cập nhật thông tin sách' : 'Thêm sách mới'}</h3>
        <input placeholder="Mã sách (bookId)" value={form.bookId} onChange={e => setForm({...form, bookId: e.target.value})} required disabled={editingId} style={{margin: '5px', padding: '8px'}} />
        <input placeholder="Tên sách" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required style={{margin: '5px', padding: '8px'}} />
        <input placeholder="Tác giả" value={form.author} onChange={e => setForm({...form, author: e.target.value})} required style={{margin: '5px', padding: '8px'}} />
        <input placeholder="Thể loại" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required style={{margin: '5px', padding: '8px'}} />
        <input placeholder="Nhà xuất bản" value={form.publisher} onChange={e => setForm({...form, publisher: e.target.value})} style={{margin: '5px', padding: '8px'}} />
        <input placeholder="Năm xuất bản" type="number" value={form.publishYear} onChange={e => setForm({...form, publishYear: e.target.value})} style={{margin: '5px', padding: '8px'}} />
        <input placeholder="ISBN" value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})} style={{margin: '5px', padding: '8px'}} />
        <input placeholder="Số lượng" type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} style={{margin: '5px', padding: '8px'}} />
        <br />
        <textarea placeholder="Mô tả" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{margin: '5px', padding: '8px', width: '90%'}} />
        <br />
        <button type="submit" style={{padding: '10px 20px', background: 'blue', color: 'white', border: 'none', cursor: 'pointer'}}>
          {editingId ? 'Lưu thay đổi' : 'Thêm sách'}
        </button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ bookId: '', title: '', author: '', category: '', publisher: '', publishYear: '', isbn: '', quantity: '', description: '' }); }} style={{marginLeft: '10px', padding: '10px 20px'}}>Hủy</button>}
      </form>

      {/* Tìm kiếm */}
      <div style={{ marginBottom: '20px' }}>
        <input placeholder="Tìm kiếm theo tên, tác giả, thể loại..." value={search} onChange={e => setSearch(e.target.value)} style={{padding: '8px', width: '300px'}} />
      </div>

      {/* Bảng danh sách sách */}
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#ddd' }}>
            <th>Mã sách</th>
            <th>Tên sách</th>
            <th>Tác giả</th>
            <th>Thể loại</th>
            <th>NXB</th>
            <th>Năm</th>
            <th>SL</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book._id}>
              <td>{book.bookId}</td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.category}</td>
              <td>{book.publisher}</td>
              <td>{book.publishYear}</td>
              <td>{book.quantity}</td>
              <td>
                <button onClick={() => handleEdit(book)} style={{marginRight: '5px', background: 'orange', border: 'none', padding: '5px 10px', cursor: 'pointer'}}>Sửa</button>
                <button onClick={() => handleDelete(book._id)} style={{background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer'}}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
