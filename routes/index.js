var express = require('express');
var router = express.Router();

var influencersController = require('../controllers/influencers');
var compaignController = require('../controllers/api/compaign');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/createInfuancer', influencersController.createInfuancer);
router.put('/api/updateInfluencerProfileDetails',compaignController.uploadFiles('public/uploads/profiles').single("profile_picture"), influencersController.updateInfluencerProfileDetails);
router.get('/api/getInfluencerProfileDetails', influencersController.getInfluencerProfileDetails);

router.get('/api/getInfluencerProfileSaveAsDraft', influencersController.getInfluencerProfileSaveAsDraft);

router.put('/api/saveAsDraft',compaignController.uploadFiles('public/uploads/profiles').single("profile_picture"),influencersController.saveAsDraft);
router.post('/api/forgotPassword',influencersController.forgotPassword);
router.post('/api/OtpVerify',influencersController.OtpVerify);
router.post('/api/resetPassword',influencersController.resetPassword);

router.get('/api/manageInfluencers', influencersController.manageInfluencers);
router.get('/api/InfluencersMailInbox', influencersController.InfluencersMailInbox);
router.get('/api/InfluencersSentMail', influencersController.InfluencersSentMail);
router.post('/api/mailReplyByInfluencers', influencersController.mailReplyByInfluencers);

router.post('/api/saveMailAsDraftByInfluencer',influencersController.saveMailAsDraftByInfluencer);
router.get('/api/getMailFromSaveAsDraftI', influencersController.getMailFromSaveAsDraftI);

router.put('/api/editMailAsDraftI',influencersController.editMailAsDraftI);



module.exports = router;
