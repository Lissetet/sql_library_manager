var express = require('express');
var router = express.Router();
const { Book } = require('../models');

const asyncHandler = cb => {
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      next(error);
    }
  }
}

/* GET home page - redirects to /books */
router.get('/', (req, res)=>(res.redirect('/books')));

/* GET book listing. */
router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  res.render('all-books', { books });
}));

/* GET Create new book form. */
router.get('/books/new', asyncHandler(async (req, res) => {
  res.render('new-book');
}));

/* POST create book. */
router.post('/books/new', asyncHandler(async (req, res) => {
  const book = await Book.create(req.body);
  res.redirect('/books');
}));

/* GET Update book by id form */
router.get('/books/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  res.render('update-book', { ...book.dataValues });
}));

/* PUT update book. */
router.post('/books/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  await book.update(req.body);
  res.redirect('/books');
}));

/* DELETE delete book. */
router.post('/books/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  res.redirect('/books');
}));



module.exports = router;
