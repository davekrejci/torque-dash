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
router.get('/users/shareid', authenticate, UserController.getShareId);
router.get('/users/forwardurls', authenticate, UserController.getForwardUrls);
router.put('/users/forwardurls', authenticate, UserController.updateForwardUrls);
router.patch('/users/shareid', authenticate, UserController.toggleShareId);

router.get('/sessions', authenticate, SessionController.getAll);
router.get('/sessions/shared/:shareId', SessionController.getAllShared);
router.get('/sessions/shared/:shareId/:sessionId', SessionController.getOneShared);
router.get('/sessions/:sessionId', authenticate, SessionController.getOne);
router.delete('/sessions/:sessionId', authenticate, SessionController.delete);

router.patch('/sessions/rename/:sessionId', authenticate, SessionController.rename);
router.patch('/sessions/addlocation/:sessionId', authenticate, SessionController.addLocation);
router.patch('/sessions/filter/:sessionId', authenticate, SessionController.filter);
router.patch('/sessions/cut/:sessionId', authenticate, SessionController.cut);
router.post('/sessions/copy/:sessionId', authenticate, SessionController.copy);
router.post('/sessions/join/:sessionId', authenticate, SessionController.join);


module.exports = router;