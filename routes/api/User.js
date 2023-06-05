var express = require('express');
var router = express.Router();
var user = require('../../controllers/api/Users')
var companyController = require('../../controllers/api/company');
var compaignController = require('../../controllers/api/compaign')

/* User */
router.put('/api/updateUser', user.updateUser);
router.get('/api/getInfluencers', user.getInfluencers);
router.get('/api/getSocialIcon', user.getSocialIcon);
router.get('/api/getCountry', user.getCountry);
router.get('/api/getState', user.getState);
router.get('/api/getCity', user.getCity);
router.get('/api/getProfile', user.getProfile);
router.get('/api/getCompanyUsers', user.getCompanyUsers);
router.get('/api/getRoleForCompany', user.getRoleForCompany);
router.put('/api/companyUserActive',user.companyUserActive);

router.get('/api/getProfileCommon', user.getProfileCommon);

/* Compaign */

router.post("/api/addCompaign", compaignController.uploadFiles('public/uploads/compaign').array("video"),compaignController.addCompaign);
router.post("/api/durgesh", compaignController.uploadFiles('public/uploads/compaign').array("video"),compaignController.durgesh);
router.post('/api/addList', compaignController.addList);
router.post('/api/removeList', compaignController.removeList);
router.get('/api/getList', compaignController.getList);

router.get('/api/getCompaign', compaignController.getCompaign);

router.get('/api/getCompaignView', compaignController.getCompaignView);
router.post('/api/editCompaign', compaignController.uploadFiles('public/uploads/compaign').array("video"),compaignController.editCompaign)
router.delete('/api/deleteCompaignImage', compaignController.deleteCompaignImage)
router.post('/api/sendInvitation',compaignController.sendInvitation)
router.post('/api/selectInfluenceForCompaign',compaignController.selectInfluenceForCompaign);
router.get('/api/manageCompaignInfluentialList',compaignController.manageCompaignInfluentialList);
router.get('/api/getCompaignByInfluencer', compaignController.getCompaignByInfluencer);

router.get('/api/getLatestCompaignByInfluencer', compaignController.getLatestCompaignByInfluencer);
router.put('/api/acceptCompaignByInfluencer',compaignController.acceptCompaignByInfluencer);
router.put('/api/submitCompaignByInfluencer',compaignController.submitCompaignByInfluencer);

router.put('/api/RejectedCompaignByInfluencer',compaignController.RejectedCompaignByInfluencer);
router.get('/api/getLatestCompaign', compaignController.getLatestCompaign);
router.post('/api/giveReviewInfluencerByBrand',compaignController.giveReviewInfluencerByBrand)

router.get('/api/getCompaignListByInfluencer', compaignController.getCompaignListByInfluencer);
router.get('/api/getCompaignListByCompany', compaignController.getCompaignListByCompany);
router.post('/api/addInfluancerInCampaign', compaignController.addInfluancerInCampaign);

router.post('/api/isRead',companyController.isRead);
router.get('/api/unReadCount',companyController.unReadCount);
router.get('/api/mailDraftCount',companyController.mailDraftCount);
router.get('/api/mailInboxView', companyController.mailInboxView);








module.exports = router;
