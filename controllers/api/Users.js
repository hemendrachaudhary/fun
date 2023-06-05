var jwt = require("jsonwebtoken");
var connection = require("../../config/db");
var constants = require("../../config/constants");
var { findByIdAndUpdate } = require("../../Helpers/helper");
var multer = require("multer");
const path = require("path");
const fs = require("fs");
const async = require("async");

//update customer
exports.updateUser = function (req, res) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      fs.mkdir("public/uploads/users/", (err) => {
        cb(null, path.join(__dirname, "../../public/uploads/users/"));
      });
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  var upload = multer({
    storage: storage,
    limits: { fileSize: constants.MAX_IMAGE_SIZE },
  });
  var uploadDemo = upload.single("profile_picture");
  uploadDemo(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      uploadError = true;
      if (err.code == "LIMIT_FILE_SIZE") {
        return res.json({
          success: false,
          message: "File Size is too large. Allowed file size is 10MB",
        });
      }
    } else if (err) {
      // An unknown error occurred when uploading.
      uploadError = true;
      return res.json(err);
    } else {
      if (!req.body.name || !req.body.email || !req.body.userid || !req.body) {
        res.json({
          success: false,
          message: "Please enter required profile detail.",
        });
      } else {
        connection.query(
          "SELECT * FROM users WHERE id = ?",
          req.body.userid,
          function (err, users) {
            if (users.length > 0) {
              connection.query(
                "SELECT id FROM users WHERE id != " +
                  req.body.userid +
                  ' AND contact= "' +
                  req.body.contact +
                  '"',
                function (err, usersId) {
                  if (usersId.length > 0) {
                    return res.json({
                      success: false,
                      message: "Mobile Number already exists.",
                    });
                  } else {
                    var sql =
                      "UPDATE users SET first_name	 = '" +
                      req.body.name +
                      "', contact = '" +
                      req.body.contact +
                      "',instagram_url = '" +
                      req.body.instagram_url +
                      "',facebook_url = '" +
                      req.body.facebook_url +
                      "',tiktok_url = '" +
                      req.body.tiktok_url +
                      "',twitter_url	 = '" +
                      req.body.twitter_url +
                      "',youtube_url = '" +
                      req.body.youtube_url +
                      "'	 WHERE id = " +
                      req.body.userid +
                      "";
                    if (req.file != undefined) {
                      var sql =
                        "UPDATE users SET first_name	 = '" +
                        req.body.name +
                        "', contact = '" +
                        req.body.contact +
                        "',instagram_url = '" +
                        req.body.instagram_url +
                        "',facebook_url = '" +
                        req.body.facebook_url +
                        "',tiktok_url = '" +
                        req.body.tiktok_url +
                        "',twitter_url	 = '" +
                        req.body.twitter_url +
                        "',youtube_url = '" +
                        req.body.youtube_url +
                        "', profile_picture = '" +
                        req.file.filename +
                        "'  WHERE id = " +
                        req.body.userid +
                        "";

                      if (
                        users[0].profile_picture != undefined &&
                        users[0].profile_picture != ""
                      ) {
                        fs.unlink(
                          "./public/uploads/users/" + users[0].profile_picture,
                          function (err) {}
                        );
                      }
                    }
                    connection.query(sql, function (err, result) {
                      if (err) throw err;
                      return res.json({
                        success: true,
                        message: "Profile updated successful.",
                      });
                    });
                  }
                }
              );
            } else {
              return res.json({ success: false, message: "User not found." });
            }
          }
        );
      }
    }
  });
};

//get influencers
exports.getInfluencers = function (req, res) {
    var page = 0,
    limit = " ";
  if (
    req.query.page != undefined &&
    req.query.page != null &&
    req.query.page != "" &&
    req.query.page > 0
  ) {
    page = req.query.page * 1 - 1;
    limit = " LIMIT " + (page*10) + ", 10";
  }
  var condition = "1 ";
  if (req.query.account_type >= 1) {
    // condition += '  AND users.account_type = '+req.query.account_type;
    condition +=
      " AND FIND_IN_SET(" + req.query.account_type + ",influencer.account_type)";
  }

  if (req.query.ff_influencer == 1) {
        condition += "  AND influencer.funfluential_id IS NOT NULL ";
  }else if (req.query.ff_influencer == 0) {
        condition += "  AND influencer.funfluential_id IS  NULL ";
  }

  if (
    req.query.followers != undefined &&
    req.query.followers != null &&
    req.query.followers != "" &&
    req.query.followers > 0
  ) {
    condition += "  AND influencer.followers > " + req.query.followers;
  }
  if (
    req.query.gender != undefined &&
    req.query.gender != null &&
    req.query.gender != ""
  ) {
    condition +=
      "  AND (about_influencer.my_gender = " + req.query.gender + "  )";
    // condition += '  AND (about_influencer.my_gender = '+req.query.gender+' OR about_influencer.my_gender IS NULL )';
  }

  if (
    req.query.kids_gender != undefined &&
    req.query.kids_gender != null &&
    req.query.kids_gender != ""
  ) {
    condition +=
      "  AND (about_influencer.my_kids_gender = " + req.query.gender + "  )";
    // condition += '  AND (about_influencer.my_kids_gender = '+req.query.gender+' OR about_influencer.my_kids_gender IS NULL )';
  }
  if (
    req.query.kids_age != undefined &&
    req.query.kids_age != null &&
    req.query.kids_age != ""
  ) {
    condition += "  AND (about_influencer.my_kids = " + req.query.gender + " )";
    // condition += '  AND (about_influencer.my_kids = '+req.query.gender+' OR about_influencer.my_kids IS NULL )';
  }

  if (
    req.query.state_id != undefined &&
    req.query.state_id != null &&
    req.query.state_id != "" &&
    req.query.state_id > 0
  ) {
    condition += "  AND users.state = " + req.query.state_id;
  }

  if (req.query.search != "" && req.query.search != undefined) {
    condition +=
      ' AND (influencer.user_name LIKE "%' +
      req.query.search +
      '%" OR users.email LIKE "%' +
      req.query.search +
      '%" OR influencer.fullname LIKE "%' +
      req.query.search +
      '%" OR users.first_name LIKE "%' +
      req.query.search +
      '%" OR users.contact LIKE "%' +
      req.query.search +
      '%" OR users.last_name LIKE ")';
  }

  // type_of_product_you_promoted
  if (
    req.query.product_type != undefined &&
    req.query.product_type != null &&
    req.query.product_type.length > 0
  ) {
    var con = " ";
    var k = 0;
    var array = req.query.product_type.split(",");
    
    array.forEach((element) => {
      k++;

      if (k == 1) {
        con += "  FIND_IN_SET(" + element + ",users.type_of_product_you_promoted) ";
      } else {
        con += "OR FIND_IN_SET(" + element + ",users.type_of_product_you_promoted)";
      }
    });
    condition += " AND (" + con + " ) ";
  }

  // ar sql = 'SELECT influencer.*,master_list.brand_id FROM `influencer` LEFT JOIN master_list ON master_list.influencer_id=influencer.id  WHERE '+condition+'  LIMIT '+page+', 10';
// CONCAT('" +    constants.BASE_URL +    "uploads/profiles/',users.profile_picture) AS profile_picture ,
  
  var sql =
    "SELECT influencer.*,countries.name AS country_name FROM influencer LEFT JOIN users ON users.id= influencer.funfluential_id LEFT JOIN about_influencer ON about_influencer.influencer_id=users.id LEFT JOIN countries ON countries.id=users.country WHERE " +
    condition +
    limit;

console.log("sql==========getInfluencers=======",sql);
  connection.query(sql, function (err, users) {
    if (err) {
    }
    var sqlCount =
      "SELECT COUNT(*) AS counts FROM  influencer LEFT JOIN users ON users.id= influencer.funfluential_id  LEFT JOIN about_influencer ON about_influencer.influencer_id=users.id LEFT JOIN countries ON countries.id=users.country  WHERE " +
      condition;

    connection.query(sqlCount, function (err, usersCount) {
      if (users.length > 0) {
        return res.json({
          success: true,
          message: "Influencer list.",
          page: req.query.page,
          response: users,
          total_count: usersCount[0].counts,
        });
      } else {
        return res.json({
          success: true,
          message: "Influencer not found.",
          response: users,
          total_count: usersCount[0].counts,
        });
      }
    });
  });
};


exports.getCountry = function (req, res) {
  var sql =
    "SELECT countries.* FROM countries WHERE countries.status = 1 ORDER BY id DESC";
  connection.query(sql, function (err, countries) {
    if (err) {
      return res.json({
        success: true,
        message: "Countries not found.",
        response: countries,
      });
    }

    if (countries.length > 0) {
      return res.json({
        success: true,
        message: "Countries list.",
        response: countries,
      });
    } else {
      return res.json({
        success: true,
        message: "Countries not found.",
        response: countries,
      });
    }
  });
};


exports.getState = function (req, res) {
  if (req.query.country_id == "" || req.query.country_id == undefined) {
    return res.json({ success: false, message: "Country id is required." });
  }
  var sql =
    "SELECT states.* FROM states WHERE status = 1 AND country_id = " +
    req.query.country_id;
  connection.query(sql, function (err, states) {
    if (err) {
      return res.json({ success: false, message: "Country not seleceted." });
    }
    if (states.length > 0) {
      return res.json({
        success: true,
        message: "States list.",
        response: states,
      });
    } else {
      return res.json({
        success: true,
        message: "States not found.",
        response: states,
      });
    }
  });
};


exports.getCity = function (req, res) {
  if (req.query.state_id == "" || req.query.state_id == undefined) {
    return res.json({ success: false, message: "State id is required." });
  }
  var sql =
    "SELECT cities.* FROM cities WHERE status = 1 AND state_id = " +
    req.query.state_id;
  connection.query(sql, function (err, cities) {
    if (err) {
      return res.json({ success: true, message: "states is not selected." });
    }
    if (cities.length > 0) {
      return res.json({
        success: true,
        message: "Cities list.",
        response: cities,
      });
    } else {
      return res.json({
        success: true,
        message: "Cities not found.",
        response: cities,
      });
    }
  });
};


exports.getSocialIcon = function (req, res) {
  var sql =
    "SELECT social_icon.* FROM social_icon WHERE social_icon.status = 1";
  connection.query(sql, function (err, icons) {
    if (icons.length > 0) {
      return res.json({
        success: true,
        message: "Social media list.",
        response: icons,
      });
    } else {
      return res.json({
        success: true,
        message: "Social media not found.",
        response: countries,
      });
    }
  });
};

//get profile icon
exports.getProfile = function (req, res) {
  var sql =
    "SELECT users.*,influencer.* FROM `users` LEFT JOIN influencer ON users.id = influencer.funfluential_id WHERE users.id = " +
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

exports.getCompanyUsers = function async(req, res) {
  var condition = "  ";
  if (
    req.query.company_id == "" ||
    req.query.company_id == undefined ||
    req.query.company_id == null
  ) {
    condition = " WHERE parent_id IS NOT NULL ";
  } else {
    condition = " WHERE  parent_id=" + req.query.company_id + " ";
  }

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
  sql = "SELECT * FROM users" + condition + " LIMIT " + page * 10 + ",10";

  connection.query(
    sql,

    function (err, users) {
      if (err) {
        return res.json({
          success: false,
          message: "Something went wrong.",
        });
      } else {
        var sql = "";
        sqlCount = "SELECT COUNT(*) AS total_count FROM users" + condition;
        connection.query(sqlCount, function (err, counts) {
          if (err) {
          }

          if (users.length > 0) {
            return res.json({
              success: true,
              response: users,
              total_count: counts[0].total_count,
              message: "Users list",
            });
          } else {
            return res.json({
              success: true,
              response: [],
              message: "Users list",
              total_count: counts[0].total_count,
            });
          }
        });
      }
    }
  );
};

exports.getRoleForCompany = function (req, res) {
  var sql = "SELECT * FROM `roles` WHERE `role_for` = 2";
  connection.query(sql, function (err, roles) {
    if (roles.length > 0) {
      return res.json({ success: true, message: "Roles.", response: roles });
    } else {
      return res.json({ success: true, message: "Roles.", response: {} });
    }
  });
};

exports.companyUserActive = async function (req, res) {
  var data = { status: req.body.status };

  // if(req.body.status==1){
  //   //  data.is_verify=1;

  //   }
  var condition =
    " id=" + req.body.user_id + " AND parent_id=" + req.body.company_id;
  var sql = "SELECT * FROM  users WHERE " + condition;
  connection.query(sql, async function (err, users) {
    if (users.length > 0) {
      var a = await findByIdAndUpdate("users", data, condition);

      if (req.body.status == 0) {
        return res.json({
          success: true,
          message: "User deactive successful",
        });
      } else {
        return res.json({
          success: true,
          message: "User active successful.",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "User not found .",
      });
    }
  });
};

exports.getProfileCommon = function (req, res) {
  var sql =
    'SELECT users.*,CASE WHEN (users.profile_picture IS NOT NULL AND users.profile_picture!="") THEN CONCAT("' +
    constants.BASE_URL +
    'uploads/profiles/", users.profile_picture) ELSE "" END AS profile_picture,about_influencer.my_gender,about_influencer.my_kids_gender,about_influencer.my_kids,about_me,about_influencer.street_address_m FROM users LEFT JOIN about_influencer ON users.id = about_influencer.influencer_id  WHERE users.id = ' +
    req.query.user_id;
  connection.query(sql, function (err, user) {
    if (user.length > 0) {
      return res.json({ success: true, message: "user.", response: user[0] });
    } else {
      return res.json({ success: true, message: "user.", response: {} });
    }
  });
};
