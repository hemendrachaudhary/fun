var express = require('express');
var router = express.Router();

var companyController = require('../../controllers/api/company');




router.get('/mailInbox', companyController.mailInbox);


router.get('/sentMail', companyController.sentMail);
router.post('/saveMailAsDraft',companyController.saveMailAsDraft);
router.get('/getMailFromSaveAsDraft', companyController.getMailFromSaveAsDraft);
router.put('/editMailAsDraft',companyController.editMailAsDraft);
// router.post('/mailReply', companyController.mailReply);

router.get('/mailDraftCountCompany', companyController.mailDraftCountCompany);
router.post('/composetMail',companyController.composetMail);
router.post('/replyMail',companyController.replyMail);

module.exports = router;
