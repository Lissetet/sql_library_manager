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
  res.json(books);
}));

  // res.render('index', { title: 'Express' });

module.exports = router;
