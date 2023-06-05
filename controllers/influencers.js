var connection = require("../config/db");
var constants = require("../config/constants");

const { saveAsdraft, sendMail, save,findByIdAndUpdate} = require("../Helpers/helper");
const {
  errResponse,
  commonResponse,
  successResponse,
  randomNumberGenerate,
  encryptPassword,
  checkPassword,
  token,
  statusChange,
} = require("../config/custom");

exports.createInfuancer = async function (req, res) {
  var accounts = require("../account.json");
  for await (let ac of accounts) {
    var sql =
      "INSERT INTO `influencer`(`user_id`, `username`, `url`, `picture`, `fullname`, `account_type`, `followers`, `engagements`, `engagement_rate`, `country`, `country_code`, `lat`, `lon`) VALUES ('" +
      ac.account.user_profile.user_id +
      "','" +
      ac.account.user_profile.username +
      "','" +
      ac.account.user_profile.url +
      "','" +
      ac.account.user_profile.picture +
      "','" +
      ac.account.user_profile.fullname +
      "','1','" +
      ac.account.user_profile.followers +
      "','" +
      ac.account.user_profile.engagements +
      "','" +
      ac.account.user_profile.engagement_rate +
      "','" +
      ac.match.user_profile.geo.country.name +
      "','" +
      ac.match.user_profile.geo.country.code +
      "','" +
      ac.match.user_profile.geo.country.coords.lat +
      "','" +
      ac.match.user_profile.geo.country.coords.lon +
      "')";
    console.error(sql, "sql", ac.match.user_profile.geo.name);
    connection.query(sql, (err, data) => {
      if (err) {
        console.error(err);
        return;
      } else {
        console.log("done:--", ac.account.user_profile.user_id);
      }
    });
  }
  return;
};
exports.getInfluencerProfileDetails = function (req, res) {
  var sql =
    "SELECT users.*,influencer.* FROM `users` LEFT JOIN influencer ON users.id = influencer.funfluential_id WHERE users.id = " +
    req.query.user_id;
  connection.query(sql, function (err, user) {
    console.log(err, "fff");
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
exports.updateInfluencerProfileDetails = function (req, res) {
  console.log(req.body, req.file);
  if (req.body.first_name == "" || req.body.email.toLowerCase() == "") {
    return res.json({ success: false, message: "All fields are required." });
  } else {
    var profile_picture = "";
    if (req.file != undefined || req.file != null) {
      profile_picture = req.file.filename;
    }
    var save_draft = {};
    connection.query(
      'SELECT id FROM users WHERE email = "' +
        req.body.email +
        '" AND id!="' +
        req.body.influencer_id +
        '"',
      async function (err, users) {
        if (users.length > 0) {
          return res.json({
            success: false,
            message: "Email id already exists.",
          });
        } else {
          var user_data = {
            first_name: req.body.first_name,
            last_name: req.body.last_name ? req.body.last_name : "",
            email: req.body.email.toLowerCase(),
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            confirm_mailing: req.body.confirm_mailing
              ? req.body.confirm_mailing
              : 0,
            profile_step: 1,
          };
          if (req.body.password) {
            let password = await encryptPassword(req.body.password);
            user_data.password = password;
          }
          if (
            req.body.monetary_payment != "" &&
            req.body.monetary_payment != undefined
          ) {
            user_data.monetary_payment = req.body.monetary_payment;
          }

          if (
            req.body.company_name != "" &&
            req.body.company_name != undefined
          ) {
            user_data.company_name = req.body.company_name;
          }
          if (req.body.contact != "" && req.body.contact != undefined) {
            user_data.contact = req.body.contact;
          }
          if (req.body.address != "" && req.body.address != undefined) {
            user_data.address = req.body.address;
          }

          if (
            req.body.type_of_product_you_promoted != "" &&
            req.body.type_of_product_you_promoted != undefined
          ) {
            user_data.type_of_product_you_promoted =
              "" + req.body.type_of_product_you_promoted + "";
          }
          //

          if (
            req.body.instagram_url != "" &&
            req.body.instagram_url != undefined
          ) {
            user_data.instagram_url = req.body.instagram_url;
          }
          if (
            req.body.facebook_url != "" &&
            req.body.facebook_url != undefined
          ) {
            user_data.facebook_url = req.body.facebook_url;
          }
          if (req.body.tiktok_url != "" && req.body.tiktok_url != undefined) {
            user_data.tiktok_url = req.body.tiktok_url;
          }
          if (req.body.twitter_url != "" && req.body.twitter_url != undefined) {
            user_data.twitter_url = req.body.twitter_url;
          }
          if (req.body.youtube_url != "" && req.body.youtube_url != undefined) {
            user_data.youtube_url = req.body.youtube_url;
          }

          if (req.body.zip_code != "" && req.body.zip_code != undefined) {
            user_data.zip_code = req.body.zip_code;
          }

          if (profile_picture != "" && profile_picture != undefined) {
            user_data.profile_picture = profile_picture;
          }
          if (req.body.account_type != "" && req.body.account_type != undefined && req.body.account_type.length>0) {
            user_data.account_type = JSON.stringify(req.body.account_type);
          }
          connection.query(
            "UPDATE users SET ? WHERE id=" + req.body.influencer_id,
            user_data,
            async function (err, user) {
              if (err) {
                console.log(
                  "err update user table in influence profile udate details===",
                  err
                );
              }
              if (user) {
                connection.query(
                  "SELECT id FROM about_influencer WHERE  influencer_id=" +
                    req.body.influencer_id,
                  async function (err, about_influencerdata) {
                    var about_influencer = {
                      influencer_id: req.body.influencer_id,
                      my_gender: req.body.my_gender,
                      my_kids_gender: req.body.my_kids_gender,
                      my_kids: req.body.my_kids,
                      street_address_m: req.body.street_address_m,
                      city_m: req.body.city_m,
                      state_m: req.body.state_m,
                      zip_m: req.body.country_m,
                      about_me: req.body.about_me,
                    };

                    if (err) {
                      console.log("err============", err);
                    } else if (about_influencerdata.length <= 0) {
                      // About detail of influen

                      connection.query(
                        "INSERT INTO about_influencer SET ?",
                        about_influencer,
                        async function (err, about_influencerI) {
                          if (err) {
                            console.log("err==========", err);
                          }
                          if (user) {
                          }
                        }
                      );
                    } else {
                      connection.query(
                        "UPDATE about_influencer SET ? WHERE id=" +
                          about_influencerdata[0].id,
                        about_influencer,
                        async function (err, user) {
                          if (err) {
                            console.log(
                              "err=============================",
                              err
                            );
                          }
                          if (user) {
                          }
                        }
                      );
                    }
                  }
                );

                // About manager of influencer

                if (
                  req.body.manager_company_name != "" &&
                  req.body.manager_company_name != undefined
                ) {
                  connection.query(
                    "SELECT id FROM manager WHERE  influencer_id=" +
                      req.body.influencer_id,
                    async function (err, managerData) {
                      var manager = {
                        influencer_id: req.body.influencer_id,
                        manager_first_name: req.body.manager_first_name,
                        manager_last_name: req.body.manager_last_name,
                        manager_company_name: req.body.manager_company_name,
                        manager_email: req.body.manager_email,
                      };

                      if (managerData.length <= 0) {
                        connection.query(
                          "INSERT INTO manager SET ?",
                          manager,
                          async function (err, managerI) {
                            if (err) {
                              console.log("err==========", err);
                            }
                            if (user) {
                            }
                          }
                        );
                      } else {
                        connection.query(
                          "UPDATE manager SET ? WHERE id=" + managerData[0].id,
                          manager,
                          async function (err, managerU) {
                            if (err) {
                              console.log(
                                "err=============================",
                                err
                              );
                            }
                            if (user) {
                            }
                          }
                        );
                      }
                    }
                  );
                }
                saveAsdraft(req.body, profile_picture);

                return res.json({
                  success: true,
                  message: "Profile Updated succefully",
                });
              }
            }
          );
        }
      }
    );
  }
};

exports.getInfluencerProfileSaveAsDraft = function (req, res) {
  var sql =
    'SELECT draft_save.*,CONCAT("' +
    constants.BASE_URL +
    '"uploads/profiles/", draft_save.profile_picture) AS profile_picture FROM draft_save WHERE influencer_id=' +
    req.query.influencer_id;
  console.log(sql, "sql");
  connection.query(sql, function (err, users) {
    if (err) {
      console.log("======", err);
    }
    if (users.length > 0) {
      return res.json({
        success: true,
        message: "Influencer Profile.",
        response: users[0],
      });
    } else {
      return res.json({
        success: true,
        message: "Influencer not found.",
        response: users,
      });
    }
  });
};
exports.saveAsDraft = async function (req, res) {
  if (req.body.influencer_id == undefined || req.body.influencer_id == "") {
    return res.json({ success: true, message: "Influencer not found." });
  } else {
    var profile_picture = "";
    if (req.file.filename != "" && req.file.filename != undefined) {
      profile_picture = req.file.filename;
    }
    var re = await saveAsdraft(req.body, profile_picture);
    if (re == true) {
      return res.json({
        success: true,
        message: "Influencer Profile Save as draft succefully.",
      });
    } else {
      console.log("====Problem==");
      return res.json({
        success: true,
        message: "Influencer Profile Save as draft succefully.",
      });
    }
  }
};

exports.forgotPassword = async function (req, res) {
  if (req.body.email == undefined || req.body.email == "") {
    return res.json({ success: true, message: "Please enter email id" });
  } else {
    var sql =
      'SELECT id,email,contact FROM users WHERE role_id!=2 AND email="' +
      req.body.email +
      '"';
    console.log(sql, "sql");
    connection.query(sql, function (err, users) {
      if (err) {
        console.log("======", err);
      } else if (users.length > 0) {
        var otp = Math.floor(1000 + Math.random() * 9000);

        connection.query(
          "UPDATE users SET otp='" + otp + "'  WHERE id= " + users[0].id,
          function (err, campaign) {
            console.log(err, "err");
            if (!err) {
              return res.json({
                success: true,
                message: "Otp sent successful",
                otp: otp,
                response: users[0],
              });
            }
          }
        );
      } else {
        return res.json({ success: true, message: "Email Id not exist" });
      }
    });
  }
};

exports.OtpVerify = async function (req, res) {
  if (req.body.influencer_id == undefined || req.body.influencer_id == "") {
    return res.json({ success: true, message: "Influencer not found." });
  } else {
    var sql =
      'SELECT id,email,contact FROM users WHERE id="' +
      req.body.influencer_id +
      '" AND otp="' +
      req.body.otp +
      '"';
    console.log(sql, "sql");
    connection.query(sql, function (err, users) {
      if (err) {
        console.log("======", err);
      } else if (users.length > 0) {
        return res.json({ success: true, message: "Otp verified." });
      } else {
        console.log("====Problem==");
        return res.json({ success: true, message: "Otp not not correct" });
      }
    });
  }
};
exports.resetPassword = async function (req, res) {
  if (
    req.body.influencer_id == undefined ||
    req.body.influencer_id == "" ||
    req.body.password == ""
  ) {
    return res.json({ success: false, message: "Please Enter Valid" });
  } else {
    let password = await encryptPassword(req.body.password);

    sql =
      "UPDATE users SET password = '" +
      password +
      "'  WHERE id = '" +
      req.body.influencer_id +
      "'";

    connection.query(sql, function (err, result) {
      if (err) {
        console.log("error-=======", err);
      } else {
        return res.json({ success: true, message: "Password changed." });
      }
    });
  }
};

exports.sendEmail = async function (req, res) {
  sendMail(req.body);
};

exports.manageInfluencers = function (req, res) {
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
  var condition = " ";

  var sql =
    "SELECT influencer.* FROM influencer LEFT JOIN master_influencer_list ON master_influencer_list.influencer_id=influencer.id    WHERE master_influencer_list.brand_id = " +
    req.query.brand_id +
    " AND master_influencer_list.compaign_id = " +
    req.query.compaign_id +
    " ";

  // var sql="SELECT users.*,CONCAT('" + constants.BASE_URL +  "','uploads/profiles/',users.profile_picture) AS profile_picture,countries.name AS country_name,states.name AS state_name,influencer.funfluential_id FROM users LEFT JOIN compaign_participants ON compaign_participants.brand_id=users.id LEFT JOIN influencer ON influencer.funfluential_id=compaign_participants.accepted_by  LEFT JOIN countries ON countries.id=users.country LEFT JOIN states ON states.id=users.state WHERE users.id="+req.query.brand_id + " "+condition+limit
  console.log(sql, "sql");
  connection.query(sql, function (err, users) {
    if (err) {
      console.log("======", err);
    }
    if (users.length > 0) {
      return res.json({
        success: true,
        message: "Influencer list.",
        page: req.query.page,
        response: users,
      });
    } else {
      return res.json({
        success: true,
        message: "Influencer not found.",
        response: users,
      });
    }
  });
};



exports.InfluencersMailInbox = function (req, res) {
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
    " WHERE mail_Inbox.send_to=" +
    req.query.user_id +
     "  AND mail_Inbox.reply_by IS NULL";

  if (req.query.compaign_id) {
    condition += "  AND compaign_id = " + req.query.compaign_id + " ";
  }

  var sql =
    "SELECT mail_Inbox.id,mail_Inbox.message,users.user_name,users.first_name,mail_Inbox.created_datetime FROM mail_Inbox LEFT JOIN users ON users.id=mail_Inbox.send_by " +
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
exports.InfluencersSentMail = function (req, res) {
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
    " WHERE send_to=" +
    req.query.user_id +
    " AND reply_by=  " +
    req.query.user_id +
    " ";
  if (req.query.compaign_id) {
    condition += "  AND compaign_id = " + req.query.compaign_id + " ";
  }

  var sql =
    "SELECT mail_Inbox.id,mail_Inbox.message,users.user_name,users.first_name,mail_Inbox.created_datetime  FROM mail_Inbox LEFT JOIN users ON users.id=mail_Inbox.send_by " +
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

exports.saveMailAsDraftByInfluencer = async function (req, res) {
  console.log(req.body, "dddddddddddd");
  var obj = {
    user_id: req.body.user_id,
  };
  
 
  if (req.body.message) {
    obj.message = req.body.message;
  }
  if (req.body.mail_id) {
    obj.mail_id = req.body.mail_id;
  }else{
    return res.json({
      success: false,
      message: "Please select mail.",
    });
  }

 
  var id = await save("mail_save_as_draft", obj);
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



exports.getMailFromSaveAsDraftI = function (req, res) {
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
    "SELECT mail_save_as_draft.message AS draft_message ,mail_Inbox.message AS reply_on_message,mail_Inbox.id  FROM mail_save_as_draft  LEFT JOIN  mail_Inbox ON mail_Inbox.id=mail_save_as_draft.mail_id " +
    condition +
    "  ORDER BY mail_save_as_draft.created_datetime DESC" +
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
exports.editMailAsDraftI = async function (req, res) {
  console.log(req.body, "dddddddddddd");
  var obj ={} ;
 
  if (req.body.message) {
    obj.message = req.body.message;
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
  var data=findByIdAndUpdate("mail_save_as_draft",obj,con)
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


exports.mailReplyByInfluencers= async function (req, res) {
  console.log(req.body, "dddddddddddd");
  var obj = {
    user_id: req.body.user_id,
  };
  if (req.body.message) {
    obj.message = req.body.message;
  }
  if (req.body.mail_id) {

    obj.mail_id = req.body.mail_id;

    var sql =
    "SELECT mail_Inbox.message,users.user_name,users.first_name,mail_Inbox.created_datetime  FROM mail_Inbox LEFT JOIN users ON users.id=mail_Inbox.send_by   mail_Inbox.id"+ req.body.mail_id
    

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




    var id = await save("mail_save_as_draft", obj);
  if (id) {
    return res.json({
      success: true,
      message: "Replied .",
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
      message: "Please select mail.",
    });
  }

 
  
};


// exports.saveMailAsDraft = async function (req, res) {
//   console.log(req.body, "dddddddddddd");
//   var obj = {
//     user_id: req.body.login_user_id,
//   };
//   if (req.body.sent_to) {
//     obj.sent_to = req.body.sent_to;
//   }
//   if (req.body.email) {
//     obj.email = req.body.email;
//   }
//   if (req.body.message) {
//     obj.message = req.body.message;
//   }
//   if (req.body.subject) {
//     obj.subject = req.body.subject;
//   }
//   var id = await save("mail_save_as_draft", obj);
//   if (id) {
//     return res.json({
//       success: true,
//       message: "Save as draft.",
//     });
//   } else {
//     return res.json({
//       success: false,
//       message: "Some thing went wrong.",
//     });
//   }
// };