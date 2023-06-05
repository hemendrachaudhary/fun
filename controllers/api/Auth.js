var jwt = require("jsonwebtoken");
var connection = require("../../config/db");
var constants = require("../../config/constants");
var {
  findByIdAndUpdate,
  saveAsdraft,
  sendMail,
} = require("../../Helpers/helper");
var multer = require("multer");
const path = require("path");
const fs = require("fs");
const async = require("async");
const { encryptPassword, checkPassword } = require("../../config/custom");
const { response } = require("express");

//User signup
exports.signupCompany = function (req, res) {
    if (req.body.first_name == "" || req.body.email.toLowerCase() == "") {
    return res.json({ success: false, message: "All fields are required." });
  } else {
    connection.query(
      "SELECT id FROM users WHERE email = ?",
      req.body.email,
      async function (err, users) {
        if (users.length > 0) {
          return res.json({
            success: false,
            message: "Email id already exists.",
          });
        } else {
          var newUser = {
            first_name: req.body.first_name,
            role_id: req.body.role_id,
            email: req.body.email.toLowerCase(),
            contact:req.body.contact,
            status: true,
            subscription_start_date: req.body.subscription_start_date,
            subscription_end_date: req.body.subscription_end_date,
            company_name: req.body.company_name,
          };

          if (req.body.password) {
            let password = await encryptPassword(req.body.password);
            newUser.password = password;
          }

          if (req.body.last_name) {
            newUser.last_name = req.body.last_name;
          }
          connection.query(
            "INSERT INTO users SET ?",
            newUser,
            async function (err, user) {
              if (err) throw err;
              if (user) {
                var userProfile = {
                  company_id: user.insertId,
                  sales_person_name: req.body.sales_person_name,
                  sales_person_email: req.body.sales_person_email,
                };
                connection.query(
                  "INSERT INTO company_profiles SET ?",
                  userProfile,
                  async function (err, user) {
                    if (err) throw err;
                    if (user) {
                      return res.json({
                        success: true,
                        message: "Company created successful.",
                      });
                    }
                  }
                );
                var data = {};
                // if(req.body.subject=='' || req.body.subject==undefined || req.body.subject==null ){
                data.global = 1;
                data.subject = "you signup as company  ";

                data.message = `  <h3 style="posistion : center"> Dear ${req.body.email}, </h3><p>You are receiving this email to notify you signup as company ${req.body.company_name} has been want to you account:</p>
            <p style="margin: 0; margin-top: 27px;">
            <br>
            <button type="button" > <a href= "https://funfluential.codingserver.com/brand-brand-profile">Accept</a> </button>        <br>
            
            <br><br>
            Thank you, <br>
            funfluential Team <br>`;
                // data.email=req.body.email;
                // data.send_to=user.insertId;

                // data.email=req.body.email;
                // data.email=req.body.email;

                // }else{

                // }
                // working to mail here on company email
                // <button type="button" > <a href= "https://funfluential.codingserver.com/brand-brand-profile">View details of Compaign</a> </button>
                sendMail(data);

                // return res.json({success: true, message: 'Signup successful.'});
              } else {
                return res.json({
                  success: false,
                  message: "Something went wrong.",
                });
              }
            }
          );
        }
      }
    );
  }
};

exports.signupInfuencer = function (req, res) {
  // Everything went fine.
  try {
    if (
      req.body.first_name == "" ||
      req.body.email == "" ||
      req.body.password == "" ||
      req.body.postal_code == "" ||
      req.body.contact == "" ||
      req.body.city == "" ||
      req.body.state == "" ||
      req.body.last_name == ""
    ) {
      return res.json({ success: false, message: "All fields are required." });
    } else {
      connection.query(
        "SELECT id FROM users WHERE email = ?",
        req.body.email,
        async function (err, users) {
          if (users.length > 0) {
            return res.json({
              success: false,
              message: "Email id already exists.",
            });
          } else {
            let password = await encryptPassword(req.body.password);
            var newUser = {
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              role_id: req.body.role_id,
              country: req.body.country,
              state: req.body.state,
              city: req.body.city,
              email: req.body.email.toLowerCase(),
              password: password,
              status: true,
              contact: req.body.contact,
              zip_code: req.body.zip_code,
            };
            connection.query(
              "INSERT INTO users SET ?",
              newUser,
              async function (err, user) {
                if (err) throw err;
                if (user) {
                  newUser.influencer_id = user.insertId;
                  saveAsdraft(newUser);

                  var sql = "";
                  if (
                    (req.body.unique_token != "" &&
                      req.body.unique_token != null) ||
                    req.body.unique_token != undefined
                  ) {
                    sql =
                      "UPDATE influencer SET funfluential_id = '" +
                      user.insertId +
                      "' ,email='" +
                      req.body.email +
                      "' WHERE unique_token = '" +
                      req.body.unique_token +
                      "'";
                  } else {
                    sql =
                      "UPDATE influencer SET funfluential_id = '" +
                      user.insertId +
                      "'  WHERE email = '" +
                      req.body.email +
                      "'";
                  }
                  connection.query(sql, function (err, result) {
                    if (err) throw err;
                  });
                  return res.json({
                    success: true,
                    message: "Signup successful.",
                  });
                } else {
                  return res.json({
                    success: false,
                    message: "Something went wrong.",
                  });
                }
              }
            );
          }
        }
      );
    }
  } catch (error) {}
};

//User login
exports.signin = async function (req, res) {
  if (!req.body.email) {
    res.json({ success: false, message: "Email id is required." });
  } else if (!req.body.password) {
    res.json({ success: false, message: "Password is required." });
  } else {
    connection.query(
      'SELECT users.* FROM users WHERE users.email = "' +
        req.body.email +
        '" AND users.soft_delete=0 ',
      async function (err, users) {
        if (users.length > 0) {
          const Password = await checkPassword(
            req.body.password,
            users[0].password
          );
          if (Password) {
            if (users[0].status == 1) {
              var token = jwt.sign({ id: users[0].id }, constants.SECRET, {
                expiresIn: "7d", // expires in 24 hours
              });
              // return the information including message as JSON
              return res.json({
                success: true,
                token: "JWT " + token,
                response: users[0],
                message: "Login successful.",
              });
            } else {
              return res.json({
                success: false,
                message: "Your account is inactive.",
              });
            }
          } else {
            return res.json({ success: false, message: "Password not match." });
          }
        } else {
          return res.json({ success: false, message: "Email id not match." });
        }
      }
    );
  }
};

exports.updateCompany = function (req, res) {
  // Everything went fine.
  // if (!req.body.name || !req.body.email.toLowerCase() || !req.body.password) {
  console.log("=================",req.body)

  if (
    req.body.first_name == "" ||
    req.body.email.toLowerCase() == "" ||
    req.body.password == ""
  ) {
    return res.json({ success: false, message: "All fields are required." });
  } else {
    connection.query(
      'SELECT id FROM users WHERE email = "' +
        req.body.email +
        '" AND id!="' +
        req.body.company_id +
        '"',
      async function (err, users) {
        if (users.length > 0) {
          return res.json({
            success: false,
            message: "Email id already exists.",
          });
        } else {
          let password = await encryptPassword(req.body.password);
// var v ={...req.body,e}
          var newUser = {
            
            email: req.body.email.toLowerCase(),
            password: password,
            contact: req.body.contact,
            secondary_email_permission: req.body.secondary_email_permission,
            additional_email_permission: req.body.additional_email_permission,
            subscription_start_date: req.body.subscription_start_date,
            subscription_end_date: req.body.subscription_end_date,
            company_name: req.body.company_name,
            contact:req.body.contact,
            
          };
          if(req.body.first_name!=null && req.body.first_name!='null'){
          newUser.first_name= req.body.first_name
        }
          if(req.body.instagram_url!=null && req.body.instagram_url!='null'){
          newUser.instagram_url= req.body.instagram_url
        }
        if(req.body.facebook_url!=null && req.body.facebook_url!='null'){
            newUser.facebook_url= req.body.facebook_url
          }
          if(req.body.tiktok_url!=null && req.body.tiktok_url!='null'){
            newUser.tiktok_url= req.body.tiktok_url
          }
          if(req.body.twitter_url!=null && req.body.twitter_url!='null'){
            newUser.twitter_url= req.body.twitter_url
          }
          if(req.body.youtube_url!=null && req.body.twitter_url!='null'){
            newUser.youtube_url= req.body.youtube_url
          }

          if(req.file!=undefined && req.file!=null && req.file!=''  ){
            console.log("req.file==",req.file);
            newUser.profile_picture=req.file.filename
          }
          console.log("newUser========",newUser);
          connection.query(
            "UPDATE users SET ? WHERE id=" + req.body.company_id,
            newUser,
            async function (err, user) {
              console.log("err",err);
              if (err) throw err;
              
              if (user) {
               
              if(req.body.name2!=null && req.body.name3!=null && req.body.name2!='' && req.body.name3!='' ){
                var userProfile = {      
                                
                               };


                 if(req.body.password2!=null && req.body.password2!='' ){
                 userProfile.password2 = await encryptPassword(req.body.password2);

              }
               if(req.body.password3!=null && req.body.password3!='' ){
                userProfile.password3 = await encryptPassword(req.body.password3);
              }


                if(req.body.name2!=null &&  req.body.name2!='' ){
                  userProfile.name2=req.body.name2
                }
                if(req.body.name3!=null && req.body.name3!=''){
                userProfile.name3=req.body.name3
              }


                if(req.body.email2!=null &&  req.body.email2!='' ){
                  userProfile.email2=req.body.email2
                }
               
               if(req.body.email3!=null &&  req.body.email3!='' ){
                  userProfile.email3=req.body.email3
                }

                if(req.body.phone2!=null && req.body.phone2!=''){
                userProfile.phone2=req.body.phone2
              }
          if(req.body.phone3!=null && req.body.phone3!=''){
                userProfile.phone3=req.body.phone3
              }



               if(req.body.brand_description!=null && req.body.brand_description!=''){
                userProfile.brand_description=req.body.brand_description
              }
              if(req.body.type_of_products!=null && req.body.type_of_products!=''){
                userProfile.type_of_products=req.body.type_of_products
              }


                connection.query(
                  "SELECT id FROM company_profiles WHERE company_id = " +
                    req.body.company_id,
                  async function (err, userprofile) {
                    if (userprofile.length > 0) {
                      connection.query(
                        "UPDATE company_profiles SET ? WHERE id=" +
                          userprofile[0].id,
                        userProfile,
                        async function (err, user) {
                          if (err) throw err;
                          if (user) {
                            return res.json({
                              success: true,
                              message: "Update profile successful.",
                            });
                          }
                        }
                      );
                    } else {
                      userProfile.company_id = req.body.company_id;
                      connection.query(
                        "INSERT INTO company_profiles SET ?",
                        userProfile,
                        async function (err, user) {
                          if (err) throw err;
                          if (user) {
                            return res.json({
                              success: true,
                              message: "Update profile successful.",
                            });
                          }
                        }
                      );
                    }
                  }
                );
              }else{
                 return res.json({
                              success: true,
                              message: "Update profile successful.",
                            });
              } }else {
                return res.json({
                  success: false,
                  message: "Something went wrong.",
                });
              }
            }
          );
        }
      }
    );
  }
};

exports.createCompanyUsers = function (req, res) {
  if (
    req.body.first_name == "" ||
    req.body.email.toLowerCase() == "" ||
    req.body.password == ""
  ) {
    return res.json({ success: false, message: "All fields are required." });
  } else {
    connection.query(
      "SELECT id FROM users WHERE email = ?",
      req.body.email,
      async function (err, users) {
        if (users.length > 0) {
          return res.json({
            success: false,
            message: "Email id already exists.",
          });
        } else {
          let password = await encryptPassword(req.body.password);

          var newUser = {
            first_name: req.body.first_name,
            role_id: req.body.role_id,
            email: req.body.email.toLowerCase(),
            password: password,
            parent_id: req.body.company_id,
          };
          connection.query(
            "INSERT INTO users SET ?",
            newUser,
            function (err, user) {
              if (user) {
                return res.json({
                  success: true,
                  message: "Create user successful.",
                });
              } else {
                return res.json({
                  success: false,
                  message: "Something went wrong.",
                });
              }
            }
          );
        }
      }
    );
  }
};
exports.updateCompanyUsers = function (req, res) {
  // Everything went fine.
  // if (!req.body.name || !req.body.email.toLowerCase() || !req.body.password) {

  if (
    req.body.first_name == "" ||
    req.body.email.toLowerCase() == "" ||
    req.body.password == ""
  ) {
    return res.json({ success: false, message: "All fields are required." });
  } else {
    connection.query(
      'SELECT id FROM users WHERE email ="' +
        req.body.email +
        '" AND id!="' +
        req.body.user_id +
        '" ',
      async function (err, users) {
        if (users.length > 0) {
          return res.json({
            success: false,
            message: "Email id already exists.",
          });
        } else {
          let password = await encryptPassword(req.body.password);

          var newUser = {
            first_name: req.body.first_name,
            email: req.body.email.toLowerCase(),
            password: password,
            role_id: req.body.role_id,
            parent_id: req.body.company_id,
          };
          connection.query(
            "UPDATE users SET ? WHERE id=" + req.body.user_id,
            newUser,
            async function (err, user) {
              if (err) throw err;
              if (user) {
                return res.json({
                  success: true,
                  message: "Update user successful.",
                });
              } else {
                return res.json({
                  success: false,
                  message: "Something went wrong.",
                });
              }
            }
          );
        }
      }
    );
  }
};

exports.verifiedInfluencer = async function (req, res) {
  var data = { is_verify: 1 };
  var condition = " id=" + req.body.influencer_id + "";
  var a = await findByIdAndUpdate("users", data, condition);

  return res.json({
    success: true,
    message: "Verified successful.",
  });
};
