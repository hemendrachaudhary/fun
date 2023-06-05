var express = require('express');
var router = express.Router();
var user = require('../../controllers/api/Users')
var admin = require('../../controllers/api/Admin')
var compaignController = require('../../controllers/api/compaign')

/* */
router.get('/getInfluencersList', admin.getInfluencersList);
router.post('/createMailTemplate', admin.createMailTemplate);
router.put('/updateMailTemplate', admin.updateMailTemplate);
router.get('/getMailTemplate', admin.getMailTemplate);
router.get('/getMailTemplateList', admin.getMailTemplateList);


router.get('/getMailTemplateByCompany', admin.getMailTemplateByCompany);

router.get('/getCompanyList', admin.getCompanyList);
router.get('/getCompanyDetails', admin.getCompanyDetails);

router.put('/moveToArchieved', admin.moveToArchieved);
router.put('/changeStatus', admin.changeStatus);
router.delete('/deleteUser', admin.deleteUser);
router.get('/viewInfluencer', admin.viewInfluencer);

router.put('/activeCampaign', admin.activeCampaign);

router.post('/insertInfluencerInUserTable', admin.insertInfluencerInUserTable);





module.exports = router;
