var multer = require("multer");
const path = require("path");
const fs = require("fs");
var constants = require("../../config/constants");
const moment = require("moment");
var connection = require("../../config/db");
const e = require("cors");
const { save } = require("../../Helpers/helper");

const Imap = require("imap");
const { simpleParser } = require("mailparser");
const imapConfig = {
  user: "vastram823@gmail.com",
  password: "zydrbnnikwjzwkgt",
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
};

const { sendMail } = require("../../Helpers/helper");
const { count } = require("console");
const { platform } = require("os");
const { json } = require("body-parser");
exports.uploadFiles = function (folder) {
  const Storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, folder);
    },

    filename: (req, file, cb) => {
      const fileNameCheck = file.originalname.replace(
        /[-&\/\\#.,+()$~%'":*?<>{} ]/g,
        ""
      );
      cb(
        null,
        `${fileNameCheck}-${Date.now()}${path.extname(file.originalname)}`
      );
    },
  });
  return multer({ storage: Storage });
};

exports.durgesh = function async(req, res) {
  var images = [];

  if (req.files.length > 0) {
    //   for await (const image of req.files){
    //  images.push(image.filename);
    // }
    for (let i = 0; i < req.files.length; i++) {
      images.push(req.files[i].filename);
    }
  }
  return res.json({ success: true, message: "jay shree ram" });
};

exports.addCompaign = function async(req, res) {
  var images = [];
  var obj = {};

  if (req.files.length > 0) {
    //   for await (const image of req.files){
    //  images.push(image.filename);
    // }

    for (let i = 0; i < req.files.length; i++) {
      if (
        req.files[i].mimetype.split("/")[0] == "video" ||
        req.files[i].mimetype.split("/")[0] == "audio"
      ) {
        obj.compaignImages = req.files[i].filename;
        obj.type = "video";
      } else {
        obj.compaignImages = req.files[i].filename;

        obj.type = "image";
      }

      images.push(obj);
      obj = {};
    }
  }
  images = JSON.stringify(images);

  var campaign = {
    user_id: req.body.user_id,
    campaign_name: req.body.campaign_name,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    instagram_post: req.body.instagram_post,
    tiktot_post: req.body.tiktot_post ? req.body.tiktot_post : 0,
    youtube_post: req.body.youtube_post ? req.body.youtube_post : 0,
    facebook_post: req.body.facebook_post ? req.body.facebook_post : 0,
    twitter_post: req.body.twitter_post ? req.body.twitter_post : 0,
    description: req.body.description,
    others: req.body.others,
    about_campaigns: req.body.about_campaigns,
    requirements_of_camp: req.body.requirements_of_camp,
    hashtag: req.body.hashtag,
    campaign_do: req.body.campaign_do,
    campaign_dont: req.body.campaign_dont,
    participation: req.body.participation ? req.body.participation : 0,
    approve_required: req.body.approve_required,
    budget_for: req.body.budget_for,
    total_budget: req.body.total_budget,
    emv_calculation: req.body.emv_calculation,
    images: images.toString(),
  };
  var platform = [];
  if (req.body.tiktot_post) {
    platform.push("tiktok");
  }
  if (req.body.youtube_post) {
    platform.push("youtube");
  }
  if (req.body.facebook_post) {
    platform.push("facebook");
  }
  if (req.body.twitter_post) {
    platform.push("twitter");
  }
  campaign.platform = platform.toString();

  if (
    req.body.payment_type == undefined ||
    req.body.payment_type == "" ||
    req.body.payment_type == null
  ) {
    campaign.other_payment_type = req.body.other_payment_type;
  } else {
    campaign.payment_type = req.body.payment_type;
  }

  if (
    req.body.cpm_instagram != undefined &&
    req.body.cpm_instagram != "" &&
    req.body.cpm_instagram != null
  ) {
    campaign.cpm_instagram = req.body.cpm_instagram;
  }
  if (
    req.body.cpm_tiktok != undefined &&
    req.body.cpm_tiktok != "" &&
    req.body.cpm_tiktok != null
  ) {
    campaign.cpm_tiktok = req.body.cpm_tiktok;
  }

  if (
    req.body.cpm_facebook != undefined &&
    req.body.cpm_facebook != "" &&
    req.body.cpm_facebook != null
  ) {
    campaign.cpm_facebook = req.body.cpm_facebook;
  }

  if (
    req.body.cpm_youtube != undefined &&
    req.body.cpm_youtube != "" &&
    req.body.cpm_youtube != null
  ) {
    campaign.cpm_youtube = req.body.cpm_youtube;
  }
  if (
    req.body.cpm_twitter != undefined &&
    req.body.cpm_twitter != "" &&
    req.body.cpm_twitter != null
  ) {
    campaign.cpm_twitter = req.body.cpm_twitter;
  }

  connection.query(
    "INSERT INTO compaigns SET ?",
    campaign,
    function (err, campaign) {
      if (err) {
        return res.json({
          success: false,
          message: "Something went wrong.",
        });
      } else {
        return res.json({
          success: true,
          message: "campaign add successful",
        });
      }
    }
  );
};

// Add influencer in master list

exports.addList = function async(req, res) {
  if (req.body.influencer_id == "" || req.body.brand_id == "") {
    return res.json({ success: false, message: "All fields are required." });
  } else {
    connection.query(
      "SELECT id FROM master_list WHERE influencer_id = " +
        req.body.influencer_id +
        " AND brand_id = " +
        req.body.brand_id +
        " ",
      async function (err, list) {
        if (list.length > 0) {
          return res.json({
            success: false,
            message: "Influencer already added in the list.",
          });
        } else {
          var masterList = {
            influencer_id: req.body.influencer_id,
            brand_id: req.body.brand_id,
          };
          connection.query(
            "INSERT INTO master_list SET ?",
            masterList,
            async function (err, master_list) {
              if (err) throw err;
              if (master_list) {
                return res.json({
                  success: true,
                  message: "Influencer added in the list.",
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

exports.addInfluancerInCampaign = function async(req, res) {
  if (req.body.influencer_id == "" || req.body.brand_id == "") {
    return res.json({ success: false, message: "All fields are required." });
  } else {
    connection.query(
      "SELECT id FROM master_influencer_list WHERE influencer_id = " +
        req.body.influencer_id +
        " AND brand_id = " +
        req.body.brand_id +
        " AND compaign_id = " +
        req.body.compaign_id +
        " ",
      async function (err, list) {
        if (list.length > 0) {
          return res.json({
            success: false,
            message: "Influencer already added in the list.",
          });
        } else {
          var masterList = {
            influencer_id: req.body.influencer_id,
            brand_id: req.body.brand_id,
            compaign_id: req.body.compaign_id,
          };
          connection.query(
            "INSERT INTO master_influencer_list SET ?",
            masterList,
            async function (err, master_influencer_list) {
              if (err) throw err;
              if (master_influencer_list) {
                return res.json({
                  success: true,
                  message: "Influencer added to compaign the list.",
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

exports.getList = function (req, res) {
  if (req.query.brand_id == "") {
    return res.json({ success: true, message: "Brand Id is required." });
  }
  var limit = "";
  var page = 0;
  if (
    req.query.page != undefined &&
    req.query.page != null &&
    req.query.page != "" &&
    req.query.page > 0
  ) {
    page = req.query.page * 1 - 1;
  }
  if (req.query.page != "all") {
    limit = " LIMIT " + page * 10 + ",10";
  }
  var sql =
    "SELECT users.*,case WHEN (users.is_signup=0) THEN users.country_code ELSE countries.name END AS country_name  FROM master_list LEFT JOIN users ON master_list.influencer_id = users.id LEFT JOIN countries ON countries.id  = users.country WHERE master_list.brand_id=" +
    req.query.brand_id +
    limit;

  console.log("dddd", sql);
  connection.query(sql, function (err, user) {
    var sqlCount =
      "SELECT COUNT(*) AS total_count FROM master_list LEFT JOIN users ON master_list.influencer_id = users.id WHERE master_list.brand_id= " +
      req.query.brand_id;
    connection.query(sqlCount, function (err, counts) {
      if (user.length > 0) {
        return res.json({
          success: true,
          message: "User Information.",
          response: user,
          total_count: counts[0].total_count,
        });
      } else {
        return res.json({
          success: true,
          message: "User Information.",
          response: [],
          total_count: counts[0].total_count,
        });
      }
    });
  });
};

exports.removeList = function async(req, res) {
  if (req.body.influencer_id == "" || req.body.brand_id == "") {
    return res.json({ success: false, message: "All fields are required." });
  } else {
    connection.query(
      "SELECT id FROM master_list WHERE influencer_id = " +
        req.body.influencer_id +
        " AND brand_id = " +
        req.body.brand_id +
        " ",
      async function (err, list) {
        if (list.length > 0) {
          connection.query(
            "DELETE FROM master_list WHERE influencer_id = " +
              req.body.influencer_id +
              " AND brand_id = " +
              req.body.brand_id +
              "",
            async function (err, master_list) {
              if (err) throw err;
              if (master_list) {
                return res.json({
                  success: true,
                  message: "Influencer deleted from list.",
                  id: req.body.influencer_id,
                });
              } else {
                return res.json({
                  success: false,
                  message: "Influencer deleted from list.",
                  id: req.body.influencer_id,
                });
              }
            }
          );
        } else {
          return res.json({
            success: false,
            message: "Influencer not found in the list.",
          });
        }
      }
    );
  }
};

exports.getCompaign = function async(req, res) {
  var condition = " 1  ";
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
  var date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  var currentdate = year + "-" + month + "-" + date;

  var order_by = " ORDER BY compaigns.id DESC";
  if (req.query.sort_by == 0) {
    order_by = " ORDER BY compaigns.campaign_name DESC";
  }
  if (req.query.sort_by == 1) {
    order_by = " ORDER BY compaigns.campaign_name ASC";
  }

  if (req.query.type == "past") {
    condition += "";
  } else if (req.query.type == "current") {
    condition +=
      " AND  start_date <= '" +
      currentdate +
      "' AND end_date >= '" +
      currentdate;
  }
  sql =
    "SELECT compaigns.platform,users.first_name,users.email,users.contact,compaigns.campaign_name,compaigns.status,compaigns.id,compaigns.start_date ,compaigns.end_date, CONCAT('" +
    constants.BASE_URL +
    "uploads/profiles/',users.profile_picture) AS profile_picture FROM compaigns LEFT JOIN users ON users.id = compaigns.user_id     WHERE  " +
    condition +
    order_by +
    " LIMIT " +
    page * 10 +
    ",10";

  connection.query(
    sql,

    function (err, compaign) {
      if (err) {
        return res.json({
          success: false,
          message: "Something went wrong.",
        });
      } else {
        var sqlCount =
          "SELECT COUNT(*) AS total_count FROM compaigns LEFT JOIN users ON users.id = compaigns.user_id     WHERE  " +
          condition;
        connection.query(
          sqlCount,

          function (err, counts) {
            if (compaign.length > 0) {
              return res.json({
                success: true,
                total_count: counts[0].total_count,
                response: compaign,

                message: "compaigns list",
              });
            } else {
              return res.json({
                success: true,
                total_count: counts[0].total_count,
                response: [],
                message: "compaigns list",
              });
            }
          }
        );
      }
    }
  );
};
exports.deleteCompaignImage = function async(req, res) {
  if (
    req.query.compaign_id == null ||
    req.query.compaign_id == "" ||
    req.query.compaign_id == undefined ||
    req.query.imageUrl == "" ||
    req.query.imageUrl == undefined
  ) {
    return res.json({
      success: false,
      message: "compaign not found",
    });
  } else {
    connection.query(
      "SELECT images  FROM compaigns WHERE user_id=" +
        req.query.user_id +
        " AND id=" +
        req.query.compaign_id,
      function (err, compaign) {
        if (err) {
          return res.json({
            success: false,
            message: "Something went wrong.",
          });
        } else {
          if (compaign.length > 0) {
            var finalimagearray = [];
            var imagearray = compaign[0].images.split(",");
            for (i = 0; i < imagearray.length; i++) {
              if (imagearray[i] == req.query.imageUrl) {
              } else {
                finalimagearray.push(imagearray[i]);
              }
            }

            connection.query(
              "UPDATE compaigns SET images='" +
                finalimagearray.toString() +
                "' WHERE id=" +
                req.query.compaign_id,
              function (err, campaign) {
                if (err) {
                  return res.json({
                    success: false,
                    message: "Something went wrong.",
                  });
                } else {
                  return res.json({
                    success: true,
                    message: "Image deleted successful",
                  });
                }
              }
            );
          } else {
            return res.json({
              success: false,
              message: "compaign not found",
            });
          }
        }
      }
    );
  }
};
exports.editCompaign = function async(req, res) {
  var images = [];

  connection.query(
    "SELECT images,id FROM compaigns WHERE id=" + req.body.compaign_id,
    function (err, compaignImages) {
      if (compaignImages.length > 0) {
        var campaign = {
          user_id: req.body.user_id,
          campaign_name: req.body.campaign_name,
          start_date: req.body.start_date,
          end_date: req.body.end_date,
          instagram_post: req.body.instagram_post,
          tiktot_post: req.body.tiktot_post,
          youtube_post: req.body.youtube_post,
          facebook_post: req.body.facebook_post,
          twitter_post: req.body.twitter_post,
          description: req.body.description,
          others: req.body.others,
          about_campaigns: req.body.about_campaigns,
          requirements_of_camp: req.body.requirements_of_camp,
          hashtag: req.body.hashtag,
          campaign_do: req.body.campaign_do,
          campaign_dont: req.body.campaign_dont,
          participation: req.body.participation,
          approve_required: req.body.approve_required,
          budget_for: req.body.budget_for,
          total_budget: req.body.total_budget,
          emv_calculation: req.body.emv_calculation,
        };

        if (req.files.length > 0) {
          for (let i = 0; i < req.files.length; i++) {
            images.push(req.files[i].filename);
          }
          campaign.images = images;

          var campaignImages = compaignImages[0].images.split(",");

          if (campaignImages.length > 0) {
          }
        }

        if (
          req.body.payment_type == undefined ||
          req.body.payment_type == "" ||
          req.body.payment_type == null
        ) {
          campaign.other_payment_type = req.body.other_payment_type;
        } else {
          campaign.payment_type = req.body.payment_type;
        }

        if (
          req.body.cpm_instagram != undefined &&
          req.body.cpm_instagram == "" &&
          req.body.cpm_instagram == null
        ) {
          campaign.cpm_instagram = req.body.cpm_instagram;
        }
        if (
          req.body.cpm_tiktok != undefined &&
          req.body.cpm_tiktok == "" &&
          req.body.cpm_tiktok == null
        ) {
          campaign.cpm_tiktok = req.body.cpm_tiktok;
        }

        if (
          req.body.cpm_facebook != undefined &&
          req.body.cpm_facebook == "" &&
          req.body.cpm_facebook == null
        ) {
          campaign.cpm_facebook = req.body.cpm_facebook;
        }

        if (
          req.body.cpm_youtube != undefined &&
          req.body.cpm_youtube == "" &&
          req.body.cpm_youtube == null
        ) {
          campaign.cpm_youtube = req.body.cpm_youtube;
        }
        if (
          req.body.cpm_twitter != undefined &&
          req.body.cpm_twitter == "" &&
          req.body.cpm_twitter == null
        ) {
          campaign.cpm_twitter = req.body.cpm_twitter;
        }
        var platform = [];
        if (req.body.tiktot_post) {
          platform.push("tiktok");
        }
        if (req.body.youtube_post) {
          platform.push("youtube");
        }
        if (req.body.facebook_post) {
          platform.push("facebook");
        }
        if (req.body.twitter_post) {
          platform.push("twitter");
        }
        campaign.platform = platform.toString();

        connection.query(
          "UPDATE compaigns SET ? WHERE id=" + req.body.compaign_id,
          campaign,
          function (err, campaign) {
            if (err) {
              return res.json({
                success: false,
                message: "Something went wrong.",
              });
            } else {
              return res.json({
                success: true,
                message: "Compaign update successful",
              });
            }
          }
        );
      } else {
        return res.json({
          success: false,
          message: "Compaign Not Found",
        });
      }
    }
  );
};
exports.sendInvitation = function async(req, res) {
  if (
    req.body.compaign_id == "" ||
    req.body.compaign_id == undefined ||
    req.body.compaign_id == null
  ) {
    return res.json({
      success: false,
      message: "Please select a  compaign id",
    });
  } else {
    connection.query(
      "SELECT * FROM compaigns WHERE id=" + req.body.compaign_id,
      async function (err, compaign) {
        if (err) {
          return res.json({
            success: false,
            message: "Something went wrong.",
          });
        } else {
          if (compaign.length > 0) {
            // req.body.email, subject, message
            var data = {};
            data.email = req.body.email;

            if (
              req.body.subject == undefined ||
              req.body.subject == "" ||
              req.body.subject == null
            ) {
              data.subject = "Invitation mail for Compaign";
            } else {
              data.subject = req.body.subject;
            }
            if (
              req.body.message == undefined ||
              req.body.message == "" ||
              req.body.message == null
            ) {
              data.message = `  <h3 style="posistion : center"> Dear ${req.body.email}, </h3><p>You are receiving this email to notify you that the following compaign ${req.body.campaign_name} has been want to you account:</p>
            <p style="margin: 0; margin-top: 27px;">
            <br>
            <button type="button" > <a href= "http://localhost:3000/influencer-campaign-view/${req.body.compaign_id}">Accept</a> </button>        <br>
            button type="button" > <a href= "http://localhost:3000/influencer-campaign-view/${req.body.compaign_id}">View details of Compaign</a> </button>   
            <br><br>
            Thank you, <br>
            funfluential Team <br>`;
            } else {
              data.message = req.body.message;
            }

            data.send_by = req.body.send_by;
            data.send_to = req.body.send_to;
            data.global = req.body.global;
            if (req.body.compaign_id) {
              data.compaign_id = req.body.compaign_id;
            }

            await sendMail(data);

            return res.json({
              success: true,

              message: "Invitation sent",
            });
          } else {
            return res.json({
              success: false,
              message: "Not Selected any type of compaign",
            });
          }
        }
      }
    );
  }
};

exports.selectInfluenceForCompaign = function async(req, res) {
  if (req.body.compaign_id && req.body.brand_id && req.body.influencer_id) {
    var compaign_participant = {
      compaign_id: req.body.compaign_id,
      brand_id: req.body.brand_id,
      accepted_by: req.body.influencer_id,
    };
    connection.query(
      "INSERT INTO compaign_participants SET ?",
      compaign_participant,
      function (err, compaign_participant) {
        if (err) {
          return res.json({
            success: false,
            message: "Something went wrong.",
          });
        } else {
          return res.json({
            success: true,
            message: "Influencer accepted successful",
          });
        }
      }
    );
  } else {
    return res.json({
      success: false,
      message: "required details not found",
    });
  }
};

const getEmails = () => {
  try {
    const imap = new Imap(imapConfig);
    imap.once("ready", () => {
      imap.openBox("INBOX", false, () => {
        imap.search(["UNSEEN", ["SINCE", new Date()]], (err, results) => {
          if (results.length > 0) {
            const f = imap.fetch(results, { bodies: "" });
            f.on("message", (msg) => {
              msg.on("body", (stream) => {
                simpleParser(stream, async (err, parsed) => {
                  // const {from, subject, textAsHtml, text} = parsed;
                  var data = {};
                  connection.query(
                    "SELECT * FROM temp_inbox  WHERE temp_messageId = '" +
                      parsed.inReplyTo +
                      "' ",
                    async function (err, temp_inbox) {
                      if (temp_inbox.length == 0) {
                        var sql1 =
                          "SELECT mail_Inbox.*,Brand.email AS brand_email ,Influencer.email AS influencer_email FROM mail_Inbox LEFT JOIN users AS Brand ON Brand.id=mail_Inbox.send_by LEFT JOIN users AS Influencer ON Influencer.id=mail_Inbox.send_to WHERE messageId = '" +
                          parsed.inReplyTo +
                          "' ";
                      } else {
                        var sql1 =
                          "SELECT mail_Inbox.*,Brand.email AS brand_email ,Influencer.email AS influencer_email FROM mail_Inbox LEFT JOIN users AS Brand ON Brand.id=mail_Inbox.send_by LEFT JOIN users AS Influencer ON Influencer.id=mail_Inbox.send_to WHERE messageId =  '" +
                          temp_inbox[0].temp_in_reply_to +
                          "' ";
                      }

                      data.messageId = parsed.messageId;
                      connection.query(sql1, async function (err, mail) {
                        var reply_by;

                        if (mail.length > 0) {
                          if (
                            mail[0].inReplyTo != null &&
                            mail[0].reply_by != null
                          ) {
                            if (mail[0].reply_by == mail[0].send_by) {
                              reply_by = mail[0].send_to;
                              data.email = mail[0].brand_email;
                            } else if (mail[0].reply_by == mail[0].send_to) {
                              reply_by = mail[0].send_by;
                              data.email = mail[0].influencer_email;
                            }
                          } else {
                            reply_by = mail[0].send_to;
                            data.email = mail[0].brand_email;
                          }
                          data.inReplyTo = parsed.inReplyTo;
                          data.subject = mail[0].subject;
                          data.send_to = mail[0].send_to;
                          data.send_by = mail[0].send_by;
                          data.reply_by = reply_by;

                          data.compaign_id = mail[0].compaign_id;
                          data.global = mail[0].global;
                          data.message = parsed.textAsHtml
                            .split("<p>On")[0]
                            .toString();
                          // data.email = to_email;

                          await save("mail_Inbox", data);

                          data.reply = 1;
                          data.message = mail[0].message;

                          data.subject = parsed.subject;
                          data.textAsHtml = parsed.textAsHtml
                            .split("<p>On")[0]
                            .toString();
                          data.messageId = parsed.messageId;

                          if (temp_inbox.length > 0) {
                            data.references = mail[0].inReplyTo;
                            data.inReplyTo = mail[0].inReplyTo;

                            // console.log(
                            //   "===data.message, data.email for replay by company when=================",
                            //   data.message,
                            //   data.email
                            // );
                            sendReplyMail(data);
                          } else {
                            data.message = data.textAsHtml;
                            sendMail(data);
                          }
                        }
                      });
                    }
                  );
                });
              });
              msg.once("attributes", (attrs) => {
                const { uid } = attrs;
                imap.addFlags(uid, ["\\Seen"], () => {
                  // Mark the email as read after reading it
                  console.log("Marked as read!");
                });
              });
            });

            f.once("error", (ex) => {
              return Promise.reject(ex);
            });
            f.once("end", () => {
              console.log("Done fetching all messages!");
              imap.end();
            });
          } else {
            console.log("handle error");
          }
        });
      });
    });

    imap.once("error", (err) => {});

    imap.once("end", () => {});

    imap.connect();
  } catch (ex) {}
};

// getEmails();

exports.manageCompaignInfluentialList = function async(req, res) {
  if (
    req.query.brand_id == "" ||
    req.query.brand_id == undefined ||
    req.query.brand_id == null
  ) {
    return res.json({
      success: false,
      message: "Please insert user id",
    });
  } else {
    var page = 0;
    if (
      req.query.page != undefined &&
      req.query.page != null &&
      req.query.page != "" &&
      req.query.page >= 0
    ) {
      page = req.query.page * 1 - 1;
    }

    connection.query(
      "SELECT influencer.*,master_list.* FROM influencer LEFT JOIN master_list ON influencer.id=master_list.influencer_id WHERE (master_list.brand_id=" +
        req.query.brand_id +
        " || master_list.brand_id is null) ORDER BY master_list.influencer_id DESC     LIMIT " +
        page * 10 +
        ",10",
      function (err, compaign) {
        if (err) {
          return res.json({
            success: false,
            message: "Something went wrong.",
          });
        } else {
          if (compaign.length > 0) {
            return res.json({
              success: true,
              response: compaign,

              message: "Influencer list",
            });
          } else {
            return res.json({
              success: true,
              response: [],
              message: "Influencer list",
            });
          }
        }
      }
    );
  }
};

getCompaignByInfluencer = async function (req, res) {
  if (req.query.influencer_id == "") {
    return res.json({ success: true, message: "influencer  Id is required." });
  }
  var date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  var currentdate = year + "-" + month + "-" + date;

  var condition = "  ";
  var limit = "";

  if (req.query.type == "new") {
    condition = " AND  compaign_participants.status=0 ";
    limit = " LIMIT 0,5";
  } else if (req.query.type == "current") {
    condition =
      " AND  compaign_participants.status= 1  AND compaigns.end_date>='" +
      currentdate +
      "' ";
    limit = " LIMIT 0,5";
  }
  if (req.query.type == "past") {
    condition =
      "   AND  compaign_participants.status= 2   AND compaigns.end_date<'" +
      currentdate +
      "'";
    limit = "  LIMIT 0,5";
  }
  var sql =
    'SELECT users.id AS company_id, compaigns.platform,users.first_name,users.company_name,CONCAT("' +
    constants.BASE_URL +
    '","uploads/profiles/",users.profile_picture) AS profile_picture,users.email,users.contact,compaigns.campaign_name,compaign_participants.status, compaign_participants.status as Influencer_accept, compaigns.id,compaigns.start_date,compaigns.end_date,compaigns.created_datetime, compaign_participants.archived,compaigns.images FROM influencer LEFT JOIN compaign_participants ON compaign_participants.accepted_by=influencer.id LEFT JOIN compaigns ON compaigns.id=compaign_participants.compaign_id LEFT JOIN   users ON users.id=compaign_participants.brand_id WHERE compaign_participants.accepted_by= ' +
    req.query.influencer_id +
    condition +
    limit;
  connection.query(sql, function (err, compaigns) {
    if (compaigns.length > 0) {
      var sqlcount =
        "SELECT COUNT(compaigns.id) AS count FROM influencer LEFT JOIN compaign_participants ON compaign_participants.accepted_by=influencer.id LEFT JOIN compaigns ON compaigns.id=compaign_participants.compaign_id LEFT JOIN   users ON users.id=compaign_participants.brand_id WHERE compaign_participants.accepted_by= " +
        req.query.influencer_id +
        condition;
      connection.query(sqlcount, function (err, compaignsCount) {
        var count = 0;
        if (compaignsCount.length > 0) {
          count = compaignsCount[0].count;
        }

        return res.json({
          success: true,
          message: "compaings list for influencer.",
          response: compaigns,
          total_count: count,
        });
      });
      // return compaigns;
    } else {
      return res.json({
        success: true,
        message: "No any compaign.",
        response: [],
        count: 0,
      });
    }
  });
};

exports.getCompaignByInfluencer = async function (req, res) {
  var compaigns = await getCompaignByInfluencer(req, res);
};

exports.getLatestCompaignByInfluencer = function (req, res) {
  getCompaignByInfluencer(req, res);
};

exports.acceptCompaignByInfluencer = function (req, res) {
  //  If when we want to confirmed signup user present in influencer table which we screper data
  // var sql="UPDATE compaign_participants LEFT JOIN influencer ON influencer.id=compaign_participants.accepted_by SET  compaign_participants.status=1 WHERE compaign_participants.compaign_id=" +
  // req.body.compaign_id +
  // " AND  influencer.funfluential_id=" +
  // req.body.influencer_id;

  var sql =
    "UPDATE compaign_participants LEFT JOIN users ON users.id=compaign_participants.accepted_by SET  compaign_participants.status=1 WHERE compaign_participants.compaign_id=" +
    req.body.compaign_id +
    " AND  users.id=" +
    req.body.influencer_id;

  connection.query(sql, function (err, campaign) {
    if (err) {
      return res.json({
        success: false,
        message: "Something went wrong.",
      });
    } else {
      return res.json({
        success: true,
        message: "Compaign accepted successful",
      });
    }
  });
};

exports.RejectedCompaignByInfluencer = function (req, res) {
  connection.query(
    "UPDATE compaign_participants LEFT JOIN influencer ON influencer.id=compaign_participants.accepted_by SET  rejected=1 WHERE compaign_participants.id=" +
      req.body.compaign_id +
      " AND  influencer.funfluential_id=" +
      req.body.influencer_id,
    function (err, campaign) {
      if (err) {
        return res.json({
          success: false,
          message: "Something went wrong.",
        });
      } else {
        return res.json({
          success: true,
          message: "Compaign Rejected successful",
        });
      }
    }
  );
};

exports.getLatestCompaign = function async(req, res) {
  if (
    req.query.user_id == "" ||
    req.query.user_id == undefined ||
    req.query.user_id == null
  ) {
    return res.json({
      success: false,
      message: "Please insert user id",
    });
  }

  var date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  var currentdate = year + "-" + month + "-" + date;

  connection.query(
    'SELECT users.first_name,CONCAT("' +
      constants.BASE_URL +
      '","uploads/profiles/",users.profile_picture) AS profile_picture,users.email,users.contact,compaigns.campaign_name,compaigns.status,compaigns.id,compaigns.start_date,compaigns.platform,compaigns.end_date FROM compaigns LEFT JOIN users ON users.id = compaigns.user_id WHERE compaigns.user_id=' +
      req.query.user_id +
      '  AND start_date <= "' +
      currentdate +
      '" AND end_date >= "' +
      currentdate +
      '" LIMIT 5',
    function (err, current_compaign) {
      if (err) {
        return res.json({
          success: false,
          message: "Something went wrong.",
        });
      } else {
        connection.query(
          'SELECT users.first_name,CONCAT("' +
            constants.BASE_URL +
            '","uploads/profiles/",users.profile_picture) AS profile_picture,users.email,users.contact,compaigns.campaign_name,compaigns.status,compaigns.id,compaigns.start_date,compaigns.platform,compaigns.end_date FROM compaigns LEFT JOIN users ON users.id = compaigns.user_id WHERE compaigns.user_id="' +
            req.query.user_id +
            '" AND end_date <= "' +
            currentdate +
            '" LIMIT 5',

          function (err, past_compaign) {
            if (err) {
            } else {
              return res.json({
                success: true,

                response: {
                  current_compaign: current_compaign,
                  past_compaign: past_compaign,
                },
                message: "compaign list",
              });
            }
          }
        );
      }
    }
  );
};

exports.giveReviewInfluencerByBrand = function async(req, res) {
  var reviewsData = {
    compaign_id: req.body.compaign_id,
    user_id: req.body.brand_id,

    created_by: req.body.influencer_id,
    comment: "",
    rating: req.body.rating,
  };

  connection.query(
    "INSERT INTO reviews SET ?",
    reviewsData,
    function (err, reviewsData) {
      if (err) {
        return res.json({ success: false, message: "Something went wrong." });
      } else {
        return res.json({
          success: true,
          message: "reviews gived successful",
        });
      }
    }
  );
};

exports.getCompaignView = function async(req, res) {
  var sql =
    "SELECT users.email,users.contact,compaigns.*,(SELECT COUNT(id) FROM  `compaign_participants` WHERE compaign_id = " +
    req.query.campaign_id +
    " AND status = 1 AND accepted_by = " +
    req.query.user_id +
    ") AS is_participate  FROM compaigns LEFT JOIN users ON users.id = compaigns.user_id WHERE compaigns.id=" +
    req.query.campaign_id;
  connection.query(
    sql,

    function (err, compaign) {
      if (err) {
        return res.json({
          success: false,
          message: "Something went wrong.",
        });
      } else {
        if (compaign.length > 0) {
          return res.json({
            success: true,
            response: compaign,

            message: "campaign",
          });
        } else {
          return res.json({
            success: true,
            response: [],
            message: "campaign ",
          });
        }
      }
    }
  );
};
exports.getCompaignListByInfluencer = async function (req, res) {
  if (req.query.influencer_id == "") {
    return res.json({ success: true, message: "influencer  Id is required." });
  }
  var date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  var currentdate = year + "-" + month + "-" + date;

  var condition = "  ";
  var limit = "";

  if (req.query.type == "pending") {
    condition = " AND  compaign_participants.status=0 ";
  } else if (req.query.type == "active") {
    condition =
      " AND  compaign_participants.status= 1  AND compaigns.end_date<='" +
      currentdate +
      "' ";
  }
  if (req.query.type == "ended") {
    condition =
      "   AND  compaign_participants.status= 2   AND compaigns.end_date<'" +
      currentdate +
      "'";
  }
  if (req.query.type == "archived") {
    condition = "   AND  compaign_participants.archived= 1 ";
  }
  if (req.query.search != "" && req.query.search != undefined) {
    param +=
      ' AND (compaigns.campaign_name LIKE "%' +
      req.query.search +
      '%" OR compaigns.hashtag LIKE "%' +
      req.query.search +
      '%" OR compaigns.platform LIKE "%' +
      req.query.search +
      '%" OR users.first_name LIKE "%' +
      req.query.search +
      '%" OR users.company_name LIKE "%' +
      req.query.search +
      '%")';
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
  var sql =
    'SELECT compaigns.instagram_post,compaigns.tiktot_post,compaigns.youtube_post,compaigns.facebook_post,compaigns.twitter_post,users.id AS company_id, users.first_name,users.company_name,compaigns.platform,CONCAT("' +
    constants.BASE_URL +
    '","uploads/profiles/",users.profile_picture) AS profile_picture,users.email,users.contact,compaigns.campaign_name,compaign_participants.status,compaign_participants.archived, compaigns.id,compaigns.start_date,compaigns.end_date,compaigns.created_datetime, compaigns.images FROM influencer LEFT JOIN compaign_participants ON compaign_participants.accepted_by=influencer.id LEFT JOIN compaigns ON compaigns.id=compaign_participants.compaign_id LEFT JOIN   users ON users.id=compaign_participants.brand_id WHERE compaign_participants.accepted_by= ' +
    req.query.influencer_id +
    condition +
    limit;
  connection.query(sql, function (err, compaigns) {
    var sqlcount =
      "SELECT COUNT(compaigns.id) AS count FROM influencer LEFT JOIN compaign_participants ON compaign_participants.accepted_by=influencer.id LEFT JOIN compaigns ON compaigns.id=compaign_participants.compaign_id LEFT JOIN   users ON users.id=compaign_participants.brand_id WHERE compaign_participants.accepted_by= " +
      req.query.influencer_id +
      condition;
    connection.query(sqlcount, function (err, compaignsCount) {
      var count = 0;
      if (compaignsCount.length > 0) {
        total_count = compaignsCount[0].count;
      }
      if (compaigns.length > 0) {
        return res.json({
          success: true,
          message: "compaings list for influencer.",
          response: compaigns,
          total_count: total_count,
        });

        // return compaigns;
      } else {
        return res.json({
          success: true,
          message: "No any compaign.",
          response: [],
          total_count: total_count,
        });
      }
    });
  });
};
exports.getCompaignListByCompany = async function (req, res) {
  if (req.query.company_id == "") {
    return res.json({ success: true, message: "influencer  Id is required." });
  }
  var date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  var currentdate = year + "-" + month + "-" + date;

  var condition = "  ";
  var limit = "";

  if (req.query.type == "pending") {
    condition = " AND  compaigns.status=0 ";
  } else if (req.query.type == "active") {
    condition =
      " AND  compaigns.status= 1  AND compaigns.end_date>='" +
      currentdate +
      "' ";
  }
  if (req.query.type == "ended") {
    condition =
      "   AND  compaigns.status= 1   AND compaigns.end_date<'" +
      currentdate +
      "'";
  }
  if (req.query.type == "archived") {
    condition = "   AND  compaigns.archived= 1 ";
  }
  var page = 0;
  if (
    req.query.page != undefined &&
    req.query.page != null &&
    req.query.page != "" &&
    req.query.page > 0
  ) {
    page = req.query.page * 1 - 1;

    limit = " LIMIT " + page + ",10";
  }
  var sql =
    'SELECT users.id AS company_id,compaigns.archived, users.first_name,compaigns.platform,users.company_name,compaigns.platform,CONCAT("' +
    constants.BASE_URL +
    '","uploads/profiles/",users.profile_picture) AS profile_picture,users.email,users.contact,compaigns.campaign_name,compaigns.status,  compaigns.id,compaigns.start_date,compaigns.end_date,compaigns.created_datetime, compaigns.images FROM compaigns  LEFT JOIN   users ON users.id=compaigns.user_id WHERE compaigns.user_id= ' +
    req.query.company_id +
    condition +
    limit;

  connection.query(sql, function (err, compaigns) {
    var sqlcount =
      "SELECT COUNT(compaigns.id) AS count FROM  compaigns  LEFT JOIN   users ON users.id=compaigns.user_id WHERE compaigns.user_id= " +
      req.query.company_id +
      condition;
    connection.query(sqlcount, function (err, compaignsCount) {
      var count = 0;
      if (compaignsCount.length > 0) {
        count = compaignsCount[0].count;
      }
      if (compaigns.length > 0) {
        return res.json({
          success: true,
          message: "compaings list for Company.",
          response: compaigns,
          total_count: count,
        });

        // return compaigns;
      } else {
        return res.json({
          success: true,
          message: "No any compaign.",
          response: [],
          total_count: count,
        });
      }
    });
  });
};

exports.submitCompaignByInfluencer = function (req, res) {
  var sql =
    "UPDATE compaign_participants LEFT JOIN users ON users.id=compaign_participants.accepted_by SET  compaign_participants.status='" +
    req.body.status +
    "' WHERE compaign_participants.compaign_id=" +
    req.body.compaign_id +
    " AND  users.id=" +
    req.body.influencer_id;

  connection.query(sql, function (err, campaign) {
    if (err) {
      return res.json({
        success: false,
        message: "Something went wrong.",
      });
    } else {
      return res.json({
        success: true,
        message: "Compaign sumited successful",
      });
    }
  });
};
