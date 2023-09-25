var express = require('express');
var router = express.Router();
const { Op } = require('sequelize');
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
  let books;
  const search = req.query.search || null;

  const pagination = {}
  pagination.page = +req.query.page || 1;
  pagination.limit = +req.query.limit || 5;
  pagination.offset = (pagination.page - 1) * pagination.limit;

  if(search) {
    const queries = [
      { title: { [Op.like]: `%${search}%` } },
      { author: { [Op.like]: `%${search}%` } },
      { genre: { [Op.like]: `%${search}%` } },
      { year: { [Op.like]: `%${search}%` } }
    ]
    books = await Book.findAll({ 
      offset: pagination.offset, 
      limit: pagination.limit, 
      where: { [Op.or]: queries }
    })
    pagination.count = await Book.count({ where: { [Op.or]: queries } });
  } else {
    books = await Book.findAll({ offset: pagination.offset, limit: pagination.limit });
    pagination.count = await Book.count();
  }

  pagination.pages = Math.ceil(pagination.count / pagination.limit);
  const pageNotInRange = pagination.page > pagination.pages || pagination.page < 1;

  pagination.prevLink = pagination.page <= 1 ? null : 
    `/books?page=${pagination.page - 1}&limit=${pagination.limit}${search? `&search=${search}` : ''}`;

  pagination.nextLink = pagination.page >= pagination.pages ? null :
    `/books?page=${pagination.page + 1}&limit=${pagination.limit}${search? `&search=${search}` : ''}`;

  pageNotInRange ? res.redirect(`/`) : res.render('index', { books, title: 'Books', ...pagination, search });
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
      res.render('new-book', { book, errors: error.errors, title: 'Create New Book' })
    } else {
      throw error;
    }
  }
}));

/* GET Update book by id form */
router.get('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render('update-book', { book, title: "Update Book" });
  } else {
    const err = new Error();
    err.message = "Sorry! We couldn't find the book you were looking for."
    err.status = 404;
    res.render('page-not-found', { title: 'Book Not Found', err })
  }
}));

/* PUT update book. */
router.post('/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    await book.update(req.body);
    res.redirect('/');
  } catch (err) {
    if(err.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('update-book', { book, errors: err.errors, title: 'Update Book' })
    } else {
      throw err;
    }
  }
}));

/* DELETE delete book. */
router.post('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  res.redirect('/');
}));



module.exports = router;
