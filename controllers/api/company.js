var connection = require("../../config/db");
var constants = require("../../config/constants");

const { saveAsdraft, sendMail,sendMail2, save,findByIdAndUpdate,sendReplyMail2} = require("../../Helpers/helper");

exports.mailInbox = function (req, res) {
    var page = 0;
    if (
      req.query.page != undefined &&
      req.query.page != null &&
      req.query.page != "" &&
      req.query.page > 0
    ) {
      page = req.query.page * 1 - 1;
    }
    var limit = "";
    if (req.query.page != "all") {
      limit = " LIMIT " + page + ", 10 ";
    }
    var condition =
      " WHERE mail_Inbox.send_by=" +
      req.query.user_id +
      " AND mail_Inbox.reply_by IS NULL AND M2.message IS NOT NULL ";
  
    if (req.query.compaign_id) {
      condition += "  AND mail_Inbox.compaign_id = " + req.query.compaign_id + " ";
    }
  
    var sql =
      "SELECT mail_Inbox.message,M2.message AS M2message,mail_Inbox.subject,users.email,users.user_name,users.first_name,users.last_name,mail_Inbox.created_datetime FROM mail_Inbox LEFT JOIN mail_Inbox AS M2 ON M2.tril_id=mail_Inbox.id LEFT JOIN users ON users.id=mail_Inbox.send_to " +
      condition +
      "  ORDER BY mail_Inbox.created_datetime DESC";
  
    console.log(sql, "sql");
    connection.query(sql, function (err, Inbox) {
      if (err) {
        console.log("======", err);
      }
      if (Inbox.length > 0) {
        return res.json({
          success: true,
          message: "Inbox list.",
          page: req.query.page,
          response: Inbox,
        });
      } else {
        return res.json({
          success: true,
          message: "Inbox not found.",
          response: Inbox,
        });
      }
    });
  };
  exports.mailInboxView = function (req, res) {
    var page = 0;
    if (
      req.query.page != undefined &&
      req.query.page != null &&
      req.query.page != "" &&
      req.query.page > 0
    ) {
      page = req.query.page * 1 - 1;
    }
    var limit = "";
    if (req.query.page != "all") {
      limit = " LIMIT " + page + ", 10 ";
    }
    var condition =
      " WHERE mail_Inbox.mail_id=" +
      req.query.mail_id +
      " OR mail_Inbox.id= "+req.query.mail_id +" ";
  
   
  
    var sql =
      "SELECT mail_Inbox.email,mail_Inbox.message,mail_Inbox.subject,users.email,users.user_name,users.first_name,users.last_name,mail_Inbox.created_datetime FROM mail_Inbox  LEFT JOIN users ON users.id=mail_Inbox.send_to " +
      condition +
      "  ORDER BY mail_Inbox.created_datetime DESC";
  
    console.log(sql, "sql");
    connection.query(sql, function (err, Inbox) {
      if (err) {
        console.log("======", err);
      }
      if (Inbox.length > 0) {
        return res.json({
          success: true,
          message: "Inbox list.",
          page: req.query.page,
          response: Inbox,
        });
      } else {
        return res.json({
          success: true,
          message: "Inbox not found.",
          response: Inbox,
        });
      }
    });
  };
  exports.sentMail = function (req, res) {
    var page = 0;
    if (
      req.query.page != undefined &&
      req.query.page != null &&
      req.query.page != "" &&
      req.query.page > 0
    ) {
      page = req.query.page * 1 - 1;
    }
    var limit = "";
    if (req.query.page != "all") {
      limit = " LIMIT " + page + ", 10 ";
    }
    var condition =
      " WHERE mail_Inbox.send_by=" +
      req.query.user_id +
      " AND mail_Inbox.reply_by!=  " +
      req.query.user_id +
      " ";
    if (req.query.compaign_id) {
      condition += "  AND mail_Inbox.compaign_id = " + req.query.compaign_id + " ";
    }
  
    var sql =
      "SELECT mail_Inbox.message,mail_Inbox.subject,users.email,users.user_name,users.first_name,users.last_name,mail_Inbox.created_datetime FROM mail_Inbox LEFT JOIN users ON users.id=mail_Inbox.send_to " +
      condition +
      "  ORDER BY mail_Inbox.created_datetime DESC";
  
    console.log(sql, "sql");
    connection.query(sql, function (err, Inbox) {
      if (err) {
        console.log("======", err);
      }
      if (Inbox.length > 0) {
        return res.json({
          success: true,
          message: "Sent mail list.",
          page: req.query.page,
          response: Inbox,
        });
      } else {
        return res.json({
          success: true,
          message: "Sent mail not found.",
          response: Inbox,
        });
      }
    });
  };
  



  exports.saveMailAsDraft = async function (req, res) {
    console.log(req.body, "dddddddddddd");
    var obj = {
        user_id: req.body.login_user_id,
      };
      if (req.body.sent_to) {
        obj.sent_to = req.body.sent_to;
      }
      if (req.body.email) {
        obj.email = req.body.email;
      }
      if (req.body.message) {
        obj.message = req.body.message;
      }
      if (req.body.subject) {
        obj.subject = req.body.subject;
      }  
      if (req.body.mail_id) {
      obj.mail_id = req.body.mail_id;
    }else{
      return res.json({
        success: false,
        message: "Please select mail.",
      });
    }
  
   
    var id = await save("mail_save_as_company", obj);
    if (id) {
      return res.json({
        success: true,
        message: "Save as draft.",
      });
    } else {
      return res.json({
        success: false,
        message: "Some thing went wrong.",
      });
    }
  };
  exports.getMailFromSaveAsDraft = function (req, res) {
    var page = 0;
    if (
      req.query.page != undefined &&
      req.query.page != null &&
      req.query.page != "" &&
      req.query.page > 0
    ) {
      page = req.query.page * 1 - 1;
    }
    var limit = "";
    if (req.query.page != "all") {
      limit = " LIMIT " + page + ", 10 ";
    }
    var condition = " WHERE user_id=" + req.query.user_id + " ";
    // if(req.query.compaign_id){
    //   condition+=  "  AND compaign_id = "+req.query.compaign_id+" ";
    // }
  
    var sql =
      "SELECT mail_save_as_company.message AS draft_message ,mail_Inbox.message AS reply_on_message,mail_Inbox.id  FROM mail_save_as_company  LEFT JOIN  mail_Inbox ON mail_Inbox.id=mail_save_as_company.mail_id " +
      condition +
      "  ORDER BY mail_save_as_company.created_datetime DESC" +
      limit;
  
    console.log(sql, "sql");
    connection.query(sql, function (err, Inbox) {
      if (err) {
        console.log("======", err);
      }
      if (Inbox.length > 0) {
        return res.json({
          success: true,
          message: "Mail list.",
          page: req.query.page,
          response: Inbox,
        });
      } else {
        return res.json({
          success: true,
          message: "Mail not Present.",
          response: Inbox,
        });
      }
    });
  };
  exports.editMailAsDraft = async function (req, res) {
    console.log(req.body, "dddddddddddd");
    var obj ={} ;
   
    if(req.body.sent_to) {
      obj.sent_to = req.body.sent_to;
    }
    if (req.body.email) {
      obj.email = req.body.email;
    }
    if (req.body.message) {
      obj.message = req.body.message;
    }
    if (req.body.subject) {
      obj.subject = req.body.subject;
    }  
    if (req.body.reply_mail_id) {
    obj.mail_id = req.body.reply_mail_id;
  }
   
    var con='';
    if(req.body.mail_id){
    con="id="+req.body.mail_id
    }else{
      return res.json({
        success: false,
        message: "please enter mail_id"
      });
    }
    // var id = await save("mail_save_as_draft", obj);
    var data=findByIdAndUpdate("mail_save_as_company",obj,con)
    if (data) {
      return res.json({
        success: true,
        message: "Save as draft.",
      });
    } else {
      return res.json({
        success: false,
        message: "Some thing went wrong.",
      });
    }
  };
  exports.isRead=async function (req, res) {

    if(req.body.mail_id){
      var obj={is_read:1}
      var con =" id="+ req.body.mail_id;
    var data=findByIdAndUpdate("mail_Inbox",obj,con)
    if (data) {
      return res.json({
        success: true,
        message: "Readed.",
      });
    } else {
      return res.json({
        success: false,
        message: "Some thing went wrong.",
      });
    }
  }else{
    return res.json({
      success: false,
      message: "Not select mail id.",
    });
  }
  
  }
  exports.unReadCount=async function (req, res) {
    var sql=" ";
    if(req.query.login_user_id){
      if(req.query.user_type==1){      
        // is_read=0 AND reply_by!=2 AND send_by=2 AND reply_by IS NOT NULL"
       sql="SELECT COUNT(*) AS counts FROM `mail_Inbox` WHERE is_read=0 AND reply_by!="+req.query.login_user_id+" AND send_by="+ req.query.login_user_id+" AND reply_by IS NOT NULL"
      }else{
         sql="SELECT COUNT(*) AS counts FROM `mail_Inbox` WHERE is_read=0 AND ( reply_by!="+req.query.login_user_id+" OR reply_by IS NULL) AND send_to="+ req.query.login_user_id+" "
      }
      
      connection.query(sql, function (err, unReadCount) {
        if (err) {
          console.log("======", err);
        }else   if (unReadCount) {
      return res.json({
        success: true,
         count:unReadCount[0].counts
      });
    } else {
      return res.json({
        success: false,
        count:0
      });
    }
  })}else{
    return res.json({
      success: false,
      message: "Not select mail id.",
    });
  
  }

  
  }

  exports.mailDraftCount=async function (req, res) {
    if(req.query.login_user_id){
      
      var sql="SELECT COUNT(*) AS counts FROM `mail_save_as_draft` WHERE user_id="+req.query.login_user_id
      
      connection.query(sql, function (err, draftCount) {
        if (err) {
          console.log("======", err);
        }else 
      if (draftCount) {
        return res.json({
          success: true,
          count:draftCount[0].counts
        });
      } else {
        return res.json({
          success: false,
          count:0

        });
      }
    })}else{
      return res.json({
        success: false,
        message: "Not select user_id.",
      });
    }
  }
  exports.mailDraftCountCompany=async function (req, res) {
    if(req.query.login_user_id){
      
      var sql="SELECT COUNT(*) AS counts FROM `mail_save_as_company` WHERE user_id="+req.query.login_user_id
      
      connection.query(sql, function (err, draftCount) {
        if (err) {
          console.log("======", err);
        }else 
      if (draftCount) {
        return res.json({
          success: true,
          count:draftCount[0].counts
        });
      } else {
        return res.json({
          success: false,
          count:0

        });
      }
    })}else{
      return res.json({
        success: false,
        message: "Not select user_id.",
      });
    }
  }
  exports.composetMail = async function (req, res) {
    console.log(req.body, "dddddddddddd");
    
    var obj = {
            };
            
     if (req.body.send_by) {
           obj.send_by = req.body.send_by;
          }
                
         if (req.body.send_to) {
            obj.send_to = req.body.send_to;
          }        
         if (req.body.email) {
        obj.email = req.body.email;
      }
      if (req.body.message) {
        obj.message = req.body.message;
      }
      if (req.body.subject) {
        obj.subject = req.body.subject;
      } 
      if (req.body.compaign_id) {
        obj.compaign_id = req.body.compaign_id;
      }   
      obj.by_portal=1
      var id = await sendMail(obj)
    if (req.body.sender_email!='' && req.body.sender_email!=null && req.body.sender_email!=undefined) {
      obj.email=req.body.sender_email
      obj.message=req.body.message +"  Send by you"
      console.log("dddd ==",obj);
      var id = await sendMail2(obj)
    } 
    if (id) {
      return res.json({
        success: true,
        message: "Mail Sent.",
      });
    } else {
      return res.json({
        success: false,
        message: "Some thing went wrong.",
      });
    }
  };
  exports.replyMail = async function (req, res) {
    var sql =
    "SELECT mail_Inbox.*,Brand.email AS brand_email ,Influencer.email AS influencer_email FROM mail_Inbox LEFT JOIN users AS Brand ON Brand.id=mail_Inbox.send_by LEFT JOIN users AS Influencer ON Influencer.id=mail_Inbox.send_to WHERE mail_Inbox.id = '" +
    req.body.mail_id +
    "' "
    connection.query(sql, async function (err, mail) {
      var data={};
      if(mail[0].send_by==req.body.login_user_id ){
        data.email=mail[0].influencer_email
        }else if(mail[0].send_to==req.body.login_user_id ){
        data.email=mail[0].brand_email    
      }
      
      data.subject=mail[0].subject
      data.inReplyTo=mail[0].messageId
      data.message=req.body.message
      data.reply_by=req.body.login_user_id

      if(mail[0].mail_id==null || mail[0].mail_id==undefined || mail[0].mail_id=='' ){
      data.mail_id=req.body.mail_id
      }else{
        data.mail_id=mail[0].mail_id
      }
      data.tril_id=mail[0].id
      
        data.send_by = mail[0].send_by;
      
             
      
         data.send_to = mail[0].send_to;
      

    await  sendReplyMail2(data);
    
      return res.json({
        success: true,
        message: "Replied.",
      });
    
    

    })
  }
