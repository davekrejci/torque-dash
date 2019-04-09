const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const SessionController = require('../controllers/SessionController');
const UploadController = require('../controllers/UploadController');
const UserController = require('../controllers/UserController');

// Torque sends data through GET request rather than post
router.get('/upload', UploadController.processUpload );

router.post('/users/register', UserController.register);
router.post('/users/login', UserController.login);
router.get('/users/logout', UserController.logout);

router.get('/sessions', authenticate, SessionController.getAll);
router.get('/sessions/:sessionId', authenticate, SessionController.getOne);
router.delete('/sessions/:sessionId', authenticate, SessionController.delete);

module.exports = router;