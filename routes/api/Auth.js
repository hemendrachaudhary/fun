var express = require('express');
var router = express.Router();
var auth = require('../../controllers/api/Auth')
var compaignController = require('../../controllers/api/compaign')

/* Auth */
router.post('/api/signupCompany', auth.signupCompany);
router.post('/api/signin', auth.signin);
router.post('/api/signupInfuencer', auth.signupInfuencer);

router.put('/api/updateCompany', compaignController.uploadFiles('public/uploads/profiles').single("profile_picture"),auth.updateCompany);

router.post('/api/createCompanyUsers', auth.createCompanyUsers);
router.put('/api/updateCompanyUsers', auth.updateCompanyUsers);
router.put('/api/verifiedInfluencer', auth.verifiedInfluencer);




module.exports = router;
