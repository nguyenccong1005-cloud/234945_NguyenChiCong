const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

router.get('/books', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { author: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } }
                ]
            };
        }
        const books = await Book.find(query);
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Không tìm thấy sách' });
        res.json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/books', async (req, res) => {
    try {
        const { bookId, title, author } = req.body;
        if (!bookId || !title || !author) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }
        const existing = await Book.findOne({ bookId });
        if (existing) {
            return res.status(400).json({ message: 'Mã sách (bookId) đã tồn tại' });
        }
        const newBook = new Book(req.body);
        await newBook.save();
        res.status(201).json(newBook);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/books/:id', async (req, res) => {
    try {
        const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedBook) return res.status(404).json({ message: 'Không tìm thấy sách' });
        res.json(updatedBook);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/books/:id', async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id);
        if (!deletedBook) return res.status(404).json({ message: 'Không tìm thấy sách' });
        res.json({ message: 'Xóa sách thành công' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;