var express = require('express');
var router = express.Router();

/* GET home page - redirects to /books */
router.get('/', (req, res)=>(res.redirect('/books')));

module.exports = router;
