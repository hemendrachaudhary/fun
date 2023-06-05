var jwt = require("jsonwebtoken");
var connection = require("../../config/db");
var constants = require("../../config/constants");
var helper,
  { findByIdAndUpdate, save } = require("../../Helpers/helper");
var multer = require("multer");
const path = require("path");
const fs = require("fs");
const async = require("async");
const {
  errResponse,
  commonResponse,
  successResponse,
  randomNumberGenerate,
  encryptPassword,
  checkPassword,
  token,
  statusChange,
} = require("../../config/custom");

//get profile icon

exports.getProfileInfo = function (req, res) {
  var sql =
    "SELECT users.first_name,users.last_name,influencer.* FROM `users` LEFT JOIN influencer ON users.id = influencer.funfluential_id WHERE users.id = " +
    req.query.user_id;
  connection.query(sql, function (err, user) {
    if (user.length > 0) {
      return res.json({
        success: true,
        message: "User Information.",
        response: user[0],
      });
    } else {
      return res.json({
        success: true,
        message: "User Information.",
        response: {},
      });
    }
  });
};

exports.createMailTemplate = function (req, res) {
  var sql =
    'SELECT * FROM mail_templates WHERE template_name ="' +
    req.body.template_name +
    '" AND created_by="' +
    req.body.created_by +
    '"';
  connection.query(sql, function (err, user) {
    if (user.length > 0) {
      return res.json({
        success: false,
        message: "Template name already exist",
      });
    } else {
      var mailData = {
        template_name: req.body.template_name,
        subject: req.body.subject,
        message: req.body.message,
        created_by: req.body.created_by,
      };

      connection.query(
        "INSERT INTO mail_templates SET ?",
        mailData,
        function (err, mailData) {
          if (err) {
          } else {
            return res.json({
              success: true,
              message: "Mail template saved successful.",
            });
          }
        }
      );
    }
  });
};
exports.updateMailTemplate = function (req, res) {
  var sql =
    'SELECT * FROM mail_templates WHERE template_name ="' +
    req.body.template_name +
    '" AND id !="' +
    req.body.mail_id +
    '" AND created_by="' +
    req.body.created_by +
    '"';
  connection.query(sql, function (err, mail_templates) {
    if (mail_templates.length > 0) {
      return res.json({
        success: false,
        message: "Template name already exist",
      });
    } else {
      var mailData = {
        template_name: req.body.template_name,
        subject: req.body.subject,
        message: req.body.message,
        created_by: req.body.created_by,
      };

      connection.query(
        "UPDATE `mail_templates` SET ? WHERE `id` = " + req.body.mail_id,
        mailData,
        function (err, mailDataUpdate) {
          if (err) {
          }
          return res.json({
            success: true,
            message: "Updated mail template successful.",
          });
        }
      );
    }
  });
};

exports.getMailTemplateByCompany = function (req, res) {
  var page = 0;
  if (
    req.query.page != undefined &&
    req.query.page != null &&
    req.query.page != "" &&
    req.query.page > 0
  ) {
    page = req.query.page * 1 - 1;
  }

  var sql =
    "SELECT * FROM mail_templates WHERE created_by= " +
    req.query.company_id +
    " LIMIT " +
    page +
    ",10";
  connection.query(sql, function (err, mailtemplates) {
    var sqlCount =
      "SELECT COUNT(*) AS total_count FROM mail_templates WHERE created_by= " +
      req.query.company_id +
      "";
    connection.query(sqlCount, function (err, counts) {
      if (err) {
      }

      if (mailtemplates.length > 0) {
        return res.json({
          success: true,
          message: "Mail template List.",
          response: mailtemplates,
          total_count: counts[0].total_count,
        });
      } else {
        return res.json({
          success: true,
          message: "Mail template List.",
          response: [],
          total_count: counts[0].total_count,
        });
      }
    });
  });
};

exports.getMailTemplate = function (req, res) {
  // var page = (!req.query.page)?0:req.query.page;
  //  page = page*10;
  //  var condition = '1 '

  var sql =
    "SELECT * FROM mail_templates WHERE id= " + req.query.mailtemplate_id;
  connection.query(sql, function (err, mailtemplates) {
    if (mailtemplates.length > 0) {
      return res.json({
        success: true,
        message: "Mail template List.",
        response: mailtemplates,
      });
    } else {
      return res.json({
        success: true,
        message: "Mail template List.",
        response: [],
      });
    }
  });
};

exports.getMailTemplateList = function (req, res) {
  // var page = (!req.query.page)?0:req.query.page;
  //  page = page*10;
  var condition = "1 ";
  var page = 0;
  if (
    req.query.page != undefined &&
    req.query.page != null &&
    req.query.page != "" &&
    req.query.page > 0
  ) {
    page = req.query.page * 1 - 1;
  }

  var sql = "SELECT * FROM mail_templates LIMIT " + page * 10 + ",10";
  connection.query(sql, function (err, mailtemplates) {
    var sqlCount =
      "SELECT COUNT(*) AS total_count FROM mail_templates WHERE " +
      condition +
      " ";
    connection.query(sqlCount, function (err, counts) {
      if (err) {
      }

      if (mailtemplates.length > 0) {
        return res.json({
          success: true,
          message: "Mail template List.",
          response: mailtemplates,
          total_count: counts[0].total_count,
        });
      } else {
        return res.json({
          success: true,
          message: "Mail template List.",
          response: [],
          total_count: counts[0].total_count,
        });
      }
    });
  });
};

exports.getCompanyList = function async(req, res) {
  var condition = " WHERE users.role_id=2 AND users.soft_delete=0  ";
  var order_by = "  ORDER BY users.id DESC";
  if (req.query.sort_by == 0) {
    order_by = " ORDER BY users.first_name DESC";
  }
  if (req.query.sort_by == 1) {
    order_by = " ORDER BY users.first_name ASC";
  }

  if (req.query.status >= 0 && req.query.status != "") {
    condition += " AND users.status=" + req.query.status + "  ";
  }
  if (req.query.platform == "instagram") {
    condition += " AND users.instagram_url IS NOT NULL ";
  }
  if (req.query.platform == "tiktok") {
    condition += " AND users.tiktok_url IS NOT NULL ";
  }
  if (req.query.platform == "youtube") {
    condition += " AND users.youtube_url IS NOT NULL ";
  }
  if (req.query.platform == "twitter") {
    condition += " AND users.twitter_url IS NOT NULL ";
  }
  if (req.query.platform == "facebook") {
    condition += " AND users.facebook_url IS NOT NULL ";
  }
  // if(req.query.company_id=='' || req.query.company_id==undefined || req.query.company_id==null ){
  //  condition=" WHERE parent_id IS NOT NULL "
  // } else {
  //   condition=" WHERE  parent_id="+req.query.company_id+" ";
  // }

  var page = 0;
  if (
    req.query.page != undefined &&
    req.query.page != null &&
    req.query.page != "" &&
    req.query.page > 0
  ) {
    page = req.query.page * 1 - 1;
  }

  var sql = "";
  sql =
    "SELECT users.*,CONCAT('" +
    constants.BASE_URL +  
    "uploads/profiles/',users.profile_picture) AS profile_picture  FROM users " +
    condition +
    order_by +
    " LIMIT " +
    page * 10 +
    ",10";
console.log("ddddddddddd==",sql);
  connection.query(
    sql,

    function (err, users) {
      if (err) {
        return res.json({
          success: false,
          message: "Something went wrong.",
        });
      } else {
        var sqlCount = "";
        sqlCount =
          "SELECT COUNT(*) AS total_count  FROM users" + condition + " ";
        connection.query(sqlCount, function (err, counts) {
          if (err) {
          }

          if (users.length > 0) {
            return res.json({
              success: true,
              total_count: counts[0].total_count,
              response: users,

              message: "Company list",
            });
          } else {
            return res.json({
              success: true,
              total_count: counts[0].total_count,
              response: [],
              message: "Company list",
            });
          }
        });
      }
    }
  );
};

exports.getCompanyDetails = function async(req, res) {
  //

  var sql =
    "SELECT users.*,company_profiles.*,CONCAT('" +
    constants.BASE_URL +
    "uploads/profiles/',users.profile_picture) AS profile_picture  FROM users LEFT JOIN  company_profiles ON company_profiles.company_id=users.id WHERE users.id=" +
    req.query.company_id;

  connection.query(
    sql,

    function (err, user) {
      if (err) {
        return res.json({
          success: false,
          message: "Something went wrong.",
        });
      } else {
        if (user.length > 0) {
          return res.json({
            success: true,
            response: user,

            message: "Company details",
          });
        } else {
          return res.json({
            success: true,
            response: [],
            message: "Company details",
          });
        }
      }
    }
  );
  //           const http = require('http'); // or 'https' for https:// URLs
  // const fs = require('fs');

  // const file = fs.createWriteStream("file.jpg");
  // const request = http.get("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg", function(response) {
  //    response.pipe(file);

  //    // after download completed close filestream
  //    file.on("finish", () => {
  //        file.close();

  //    });
  // });
};

exports.getInfluencersList = function (req, res) {
  var page = 0;
  if (
    req.query.page != undefined &&
    req.query.page != null &&
    req.query.page != "" &&
    req.query.page > 0
  ) {
    page = req.query.page * 1 - 1;
  }
  var condition =
    "users.role_id=3 AND users.soft_delete=0 AND users.profile_step=1 ";
  var order_by = " ORDER BY users.id DESC";
  if (req.query.sort_by == 0) {
    order_by = " ORDER BY users.first_name DESC";
  }
  if (req.query.sort_by == 1) {
    order_by = " ORDER BY users.first_name ASC";
  }

  if (req.query.status >= 0 && req.query.status != "") {
    condition += " AND users.status=" + req.query.status + "  ";
  }
  if (req.query.platform == "instagram") {
    condition += " AND users.instagram_url IS NOT NULL ";
  }
  if (req.query.platform == "tiktok") {
    condition += " AND users.tiktok_url IS NOT NULL ";
  }
  if (req.query.platform == "youtube") {
    condition += " AND users.youtube_url IS NOT NULL ";
  }
  if (req.query.platform == "twitter") {
    condition += " AND users.twitter_url IS NOT NULL ";
  }
  if (req.query.platform == "facebook") {
    condition += " AND users.facebook_url IS NOT NULL ";
  }

  var sql =
    'SELECT users.*,CONCAT("' +
    constants.BASE_URL +
    '","uploads/profiles/",users.profile_picture) AS profile_picture FROM users  WHERE ' +
    condition +
    " " +
    order_by +
    " LIMIT " +
    page +
    ", 10";

  connection.query(sql, function (err, users) {
    if (err) {
    }
    var sqlCount =
      "SELECT COUNT(*) AS total_count FROM users WHERE " + condition + " ";
    connection.query(sqlCount, function (err, counts) {
      if (err) {
      }

      if (users.length > 0) {
        return res.json({
          success: true,
          message: "Influencer list.",
          page: req.query.page,
          total_count: counts[0].total_count,
          response: users,
        });
      } else {
        return res.json({
          success: true,
          message: "Influencer not found.",
          total_count: counts[0].total_count,
          response: users,
        });
      }
    });
  });
};
exports.moveToArchieved = async function (req, res) {
  var data = { archived: 1 };
  var condition =
    " accepted_by=" +
    req.body.influencer_id +
    " AND compaign_id=" +
    req.body.compaign_id +
    "";
  var a = await findByIdAndUpdate("compaign_participants", data, condition);

  return res.json({
    success: true,
    message: "Archieved successful.",
  });
};

exports.changeStatus = async function (req, res) {
  var data = {};
  if (req.body.status == 1) {
    data.is_verify = 1;
    data.status = 1;
  } else {
    data.status = req.body.status;
    data.is_verify = 0;
  }
  var condition = " id=" + req.body.user_id + "";
  var a = await findByIdAndUpdate("users", data, condition);

  return res.json({
    success: true,
    message: "Status changed.",
  });
};
exports.deleteUser = async function (req, res) {
  var data = { soft_delete: 1 };
  var condition = " id=" + req.body.user_id + "";
  var a = await findByIdAndUpdate("users", data, condition);

  return res.json({
    success: true,
    response: req.body.user_id,
    message: "deleted changed.",
  });
};

exports.viewInfluencer = function (req, res) {
  var sql =
    "SELECT users.*,manager.*,about_influencer.*,cities.name AS city_name , states.name AS state_name,countries.name AS country_name FROM `users` LEFT JOIN about_influencer ON about_influencer.influencer_id=users.id LEFT JOIN manager ON manager.influencer_id=users.id LEFT JOIN countries ON countries.id=users.country LEFT JOIN states ON states.id=users.state LEFT JOIN cities ON cities.id=users.city WHERE users.id= " +
    req.query.user_id;
  connection.query(sql, function (err, user) {
    if (user.length > 0) {
      return res.json({
        success: true,
        message: "User Information.",
        response: user[0],
      });
    } else {
      return res.json({
        success: true,
        message: "User Information.",
        response: {},
      });
    }
  });
};
exports.activeCampaign = async function (req, res) {
  var data = { status: req.body.status };
  var condition = " id=" + req.body.compaign_id + "";
  var a = await findByIdAndUpdate("compaigns", data, condition);

  if (req.body.status == "1") {
    return res.json({
      success: true,
      message: "Active.",
    });
  } else {
    return res.json({
      success: true,
      message: "Deactive",
    });
  }
};

async function data365() {
  // if(req.query.page)
  var page = 0;
  var limit = " LIMIT  " + page * 10 + ",146";
  sql =
    "SELECT * FROM `influencer` WHERE account_type=1 AND username!='undefined' ORDER BY id DESC" +
    limit;

  connection.query(sql, function (err, users) {
    if (err) {
    }
    if (users.length > 0) {
      users.forEach((element) => {
        var obj = {};

        var options = {
          method: "GET",
          url:
            "https://api.data365.co/v1.1/instagram/profile/" +
            element.username +
            "?access_token=ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6STFOaUo5LmV5SnpkV0lpT2lKQ1pXVm9hWFpsVTI5bWRIZGhjbVVpTENKcFlYUWlPakUyT0RJNU5qYzBOalV1TlRrMU9UWTBmUS5Bc25IQnRUSFRDZy1jWDhLVFZza3laemJPLUJLMG1RWElMcU9yemtNYlFZ",
          headers: {},
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);

          var data = JSON.parse(response.body).data;
          if (data != null && data != undefined) {
            obj.email = data.public_email;
            obj.picture = data.profile_photo_url;
            obj.biography = JSON.stringify(data.biography);
            obj.business_category = JSON.stringify(data.business_category);
            obj.followers = data.followers_count;
            obj.followings_count = data.followings_count;
            obj.posts_count = data.posts_count;
            obj.is_private = data.is_private;
            obj.is_joined_recently = data.is_joined_recently;
            obj.is_business_account = data.is_business_account;
            obj.highlight_reels_count = data.highlight_reels_count;
            obj.fullname = data.fullname;

            var sql_update =
              "UPDATE influencer SET  ? WHERE  id= " + element.id;

            connection.query(sql_update, obj, function (err, result) {
              if (err) {
              } else {
                obj = {};
              }
            });
          }
        });
      });
    }
  });
}
// data365();

exports.insertInfluencerInUserTable = async function (req, res) {
  var page = 0;
  var limit = " LIMIT  " + page * 10 + ",146";
  sql =
    "SELECT * FROM `influencer` WHERE account_type=1 AND user_name!='undefined' ORDER BY id DESC" +
    limit;

  connection.query(sql, async function (err, users) {
    if (err) {
    }
    if (users.length > 0) {
      var i = 0;

      users.forEach(async (data) => {
        var obj = {
          
          email: "",
          picture: "",
          biography: "",
          business_category: "",
          followers: "",
          followings_count: "",
          posts_count: "",
          is_private: "",
          is_joined_recently: "",
          is_business_account: "",
          highlight_reels_count: "",
          fullname: "",
          account_type: "",
          engagement_rate: "",
          country_code: "",
          engagements: "",
          user_name: "",
        
        };
       
        obj.email = data.public_email;
        obj.picture = data.picture;
        obj.biography = JSON.stringify(data.biography);
        obj.business_category = JSON.stringify(data.business_category);
        obj.followers = data.followers;
        obj.followings_count = data.followings_count;
        obj.posts_count = data.posts_count;
        obj.is_private = data.is_private;
        obj.is_joined_recently = data.is_joined_recently;
        obj.is_business_account = data.is_business_account;
        obj.highlight_reels_count = data.highlight_reels_count;
        obj.fullname = data.fullname;
        obj.account_type = data.account_type;
        obj.engagement_rate = data.engagement_rate;
        obj.country_code = data.country_code;
        obj.engagements = data.engagements;
        obj.user_name = data.user_name;

      
con="id= "+data.id;
        var o = await findByIdAndUpdate("influencer", obj,con);

        obj = {
          email: "",
          picture: "",
          biography: "",
          business_category: "",
          followers: "",
          followings_count: "",
          posts_count: "",
          is_private: "",
          is_joined_recently: "",
          is_business_account: "",
          highlight_reels_count: "",
          fullname: "",
          account_type: "",
          engagement_rate: "",
          country_code: "",
          engagements: "",
          user_name: "",
          
        };
      });
    }
  });
};
