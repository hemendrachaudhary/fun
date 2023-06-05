const nodemailer = require("nodemailer");
var connection = require("../config/db");
const quotedPrintable = require('quoted-printable');
// (email, subject, message)
// sendMailForPassword
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
        user: "vastram823@gmail.com",
        pass: "zydrbnnikwjzwkgt",
     },
 });

async function sendMail(data) {
  try {
    // let testAccount = await nodemailer.createTestAccount();
  
      var info = await transporter.sendMail({
        from: "vastram823@gmail.com",
        to: data.email,
        subject: data.subject,
        html: data.message,
      });
      
      if(data.reply!=1){
        data.messageId = info.messageId;
       await save("mail_Inbox", data);  
      }
      else{
        var temp_inbox_data={temp_messageId:info.messageId,
          temp_in_reply_to:data.messageId
        }
      await save("temp_inbox", temp_inbox_data);
    }
    } catch (err) {
    console.log(err, " In method ");
  }
}
async function sendMail2(data) {
  try {
    // let testAccount = await nodemailer.createTestAccount();
  
      var info = await transporter.sendMail({
        from: "vastram823@gmail.com",
        to: data.email,
        subject: data.subject,
        html: data.message,
      });
      
      if(data.reply!=1){
        data.messageId = info.messageId;
      //  await save("mail_Inbox", data);  
      }
      else{
        var temp_inbox_data={temp_messageId:info.messageId,
          temp_in_reply_to:data.messageId
        }
      // await save("temp_inbox", temp_inbox_data);
    }
    } catch (err) {
    console.log(err, " In method ");
  }
}

async function sendReplyMail(data) {
  try {
    // let testAccount = await nodemailer.createTestAccount(); 
      console.log("IN else condition for reply==========", data);

      var info = await transporter.sendMail(
        {
          from: "vastram823@gmail.com",
          to: data.email,
          subject: data.subject,
          references: data.inReplyTo,
          inReplyTo: data.inReplyTo,
          text: quotedPrintable.encode(data.textAsHtml),
        },
       async function (error, info) {
            if (error) {
              console.log(error);
              } else {
                console.log("INFO=======",info,data.messageId);
                var temp_inbox_data={temp_messageId:info.messageId,
                  temp_in_reply_to:data.messageId
                }
               console.log("Email replied: " + info.response);
               await save("temp_inbox", temp_inbox_data);
             }
           });  
  } catch (err) {
    console.log(err, " In method ");
  }
}
async function sendReplyMail2(data) {
  try {
    // let testAccount = await nodemailer.createTestAccount(); 
      console.log("IN else condition for reply==========", data);
   var mailOptions =  {
        from:data.email,
        to: data.email,
        subject: data.subject,
        references: data.inReplyTo,
        inReplyTo: data.inReplyTo,
        text: quotedPrintable.encode(data.message),
      }
console.log("Mail opt==========",mailOptions);
      var info = await transporter.sendMail(mailOptions,
       
       async function (error, info) {
            if (error) {
              console.log(error);
              } else {
                console.log("INFO=======",info.messageId,data);
                // var temp_inbox_data={temp_messageId:info.messageId,
                //   temp_in_reply_to:data.messageId
                // }
               console.log("Email replied: " + info.response);
               data.messageId=info.messageId;
               await save("mail_Inbox", data);
             }
           });  
  } catch (err){
    console.log(err, " In method ");
  }
}

async function saveAsdraft(newUser,profile_picture) {
  var save_draft = {};
  console.log("new User =====>",newUser);
  if (newUser) {
    // save_draft.user_name
  }
  if (newUser.first_name) {
    save_draft.first_name = newUser.first_name;
  }
  if (newUser.last_name) {
    save_draft.last_name = newUser.last_name;
  }
  if (newUser.contact) {
    save_draft.contact = newUser.contact;
  }

  if (newUser.email) {
    save_draft.email = newUser.email;
  }

  if (newUser.country) {
    save_draft.country = newUser.country;
  }
  if (newUser.state) {
    save_draft.state = newUser.state;
  }
  if (newUser.city) {
    save_draft.city = newUser.city;
  }
  if (newUser.address) {
    save_draft.address = newUser.address;
  }
  if (newUser.password) {
    save_draft.password = newUser.password;
  }
  if (newUser.monetary_payment) {
    save_draft.monetary_payment = newUser.monetary_payment;
  }
  if (newUser.type_of_product_you_promoted) {
    save_draft.type_of_product_you_promoted =
      ""+newUser.type_of_product_you_promoted+"";
  }
  if (newUser.company_name) {
    save_draft.company_name = newUser.company_name;
  }
  if (profile_picture) {
    save_draft.profile_picture = profile_picture;
  }
  if (newUser.instagram_url) {
    save_draft.instagram_url = newUser.instagram_url;
  }
  if (newUser.facebook_url) {
    save_draft.facebook_url = newUser.facebook_url;
  }
  if (newUser.tiktok_url) {
    save_draft.tiktok_url = newUser.tiktok_url;
  }
  if (newUser.twitter_url) {
    save_draft.twitter_url = newUser.twitter_url;
  }

  if (newUser.youtube_url) {
    save_draft.youtube_url = newUser.youtube_url;
  }
  if (newUser.postal_code) {
    save_draft.postal_code = newUser.postal_code;
  }
  if (newUser.my_gender) {
    save_draft.my_gender = newUser.my_gender;
  }
  if (newUser.my_kids) {
    save_draft.my_kids = newUser.my_kids;
  }
  if (newUser.my_kids_gender) {
    save_draft.my_kids_gender = newUser.my_kids_gender;
  }
  if (newUser.about_me) {
    save_draft.about_me = newUser.about_me;
  }
  if(newUser.confirm_mailing){
    save_draft.confirm_mailing=1;
  }
  if(newUser.street_address_m){
    save_draft.street_address_m=newUser.street_address_m;
  }
  if(newUser.city_m){
    save_draft.city_m=newUser.city_m;
  }
  if(newUser.state_m){
    save_draft.state_m=newUser.state_m;
  }
  if(newUser.zip_code){
    save_draft.zip_code=newUser.zip_code;
  }
  
  if(newUser.zip_m){
    save_draft.zip_m=newUser.zip_m;
  }
  if(newUser.country_m){
    save_draft.country_m=newUser.country_m;
  }

  if (newUser.draft_data) {
    save_draft.draft_data = newUser.draft_data;
  }
  
  if (newUser.influencer_id) {
    connection.query(
      "SELECT * FROM draft_save WHERE draft_save.influencer_id=" +
        newUser.influencer_id,
      async function (err,result) {
        if (err) {
          console.log("err==========", err);
        } else if (result.length > 0) {
          connection.query(
            "UPDATE draft_save SET ? WHERE id=" + result[0].id,
            save_draft,
            async function (err,result2,) {
              if (err) {
                console.log("result2    ", err);
                return false;
              } else {
                return true;
              }
            }
          );
        } else {
          save_draft.influencer_id = newUser.influencer_id;
          console.log("save Draft=========",save_draft);
          connection.query(
            "INSERT INTO draft_save SET ?",
            save_draft,
            async function (err,result3) {
              if (err) {
                console.log("result3    ", err);
                return false;
              } else {
                return true;
              }
            }
          );
        }
      }
    );
  }
};





async function save(tbl,data) {
    
    var sql = 'INSERT INTO '+tbl+' SET ?';
    return new Promise((resolve, reject)=> {
      connection.query(sql,data, function(err,data){
            if(err) {
              console.log("save error====",err);
              return reject(err);
            }
            
            resolve(data.insertId);
            
        });
    })   
}


async function findByIdAndUpdate(tbl,data,con) {
    
    var sql = 'UPDATE '+tbl+' SET  ? WHERE  '+con;
    return new Promise((resolve, reject)=> {
      console.log(data,"534534534534")
      connection.query(sql,data, function(err,data){
           if(err) {
                console.log(err,"")
              return reject(err);
            }
            
            resolve(data);
            
        });
    })   
}


async function findOne(tbl,con) {
    var sql = 'SELECT * FROM '+tbl+'  WHERE ? '
    return new Promise((resolve, reject)=> {
      connection.query(sql,con, function(err,data){
            if(err) {
              return reject(err);
            }
            if(data.length > 0) {
            resolve(data[0]);
            }else{
              resolve("");
            }
        });
    })  

}





module.exports = {
  save,
  findOne,
  findByIdAndUpdate,
  sendMail,
  saveAsdraft,
  sendReplyMail,
  sendMail2,
  sendReplyMail2,
};