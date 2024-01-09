const multer = require('multer');
const router = require("express").Router();
const controller = require("../controllers/user");
const { hasAuth: auth } = require('../middleware/validators')

const upload = multer()


router.post("/register", controller.register)
router.post("/login", controller.login)
router.post('/logout', auth, controller.logout)


// Get user's data
router.get('/', auth, controller.getUser)

// add avatar route 
router.post('/avatar', auth, upload.single('avatar'), controller.addAvatar)
router.get('/avatar/:id', controller.getAvatar) // get avatar image


module.exports = router;