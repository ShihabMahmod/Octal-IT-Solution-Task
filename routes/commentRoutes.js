const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validation');
const { createCommentValidation } = require('../validations/blogValidation');

router.use(protect);

router.get('/user/me', commentController.getUserComments);
router.patch('/:id', createCommentValidation, validate, commentController.updateComment);
router.delete('/:id', commentController.deleteComment);
router.post('/:id/like', commentController.toggleLike);

module.exports = router;