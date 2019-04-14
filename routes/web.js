const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const PageController = require('../controllers/PageController');

router.get('/', (req, res) => { res.redirect('/overview') });
router.get('/login', PageController.renderLogin );
router.get('/register', PageController.renderRegister );
router.get('/overview', authenticate, PageController.renderOverview );
router.get('/mapview', authenticate, PageController.renderMapview );
router.get('/edit/:sessionId', authenticate, PageController.renderEdit );

module.exports = router;