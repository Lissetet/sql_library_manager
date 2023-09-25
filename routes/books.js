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

/* GET book listing. */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  res.render('index', { books, title: 'Books' });
}));

/* GET Create new book form. */
router.get('/new', asyncHandler(async (req, res) => {
  res.render('new-book', { book: {}, title: 'Create New Book' });
}));

/* POST create book. */
router.post('/new', asyncHandler(async (req, res) => {
  let book; 
  try {
    book = await Book.create(req.body);
    res.redirect('/');
  } catch (error) {
    if(error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      res.render('new-book', { book, errors: error.errors })
    } else {
      throw error;
    }
  }
}));

/* GET Update book by id form */
router.get('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render('update-book', { book, title: book.title });
  } else {
    const err = new Error();
    err.message = "Sorry! We couldn't find the book you were looking for."
    err.status = 404;
    res.render('page-not-found', { title: 'Book Not Found', err })
  }
}));

/* PUT update book. */
router.post('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  await book.update(req.body);
  res.redirect('/');
}));

/* DELETE delete book. */
router.post('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  res.redirect('/');
}));



module.exports = router;
