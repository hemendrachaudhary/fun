



var connection = require("../config/db");
var cron = require('node-cron');

// 1 24 * * *,1 0 * * * *
// 
cron.schedule('1 0 * * * *', () => {
  try {
    console.log("Cron is running")
    var date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
  var currentdate = year + "-" + month + "-" + date;
    
    var condition =
    " AND  compaign_participants.status= 1 AND compaign_participants.status!= 2 AND   compaigns.end_date<'" +currentdate+ "' ";
    
    

    var sql =
    'SELECT  GROUP_CONCAT(compaign_participants.compaign_id) as id FROM  compaign_participants LEFT JOIN compaigns ON compaign_participants.compaign_id=compaigns.id WHERE 1 ' +
    condition ;
    console.log("ddddddddd",sql);

  connection.query(sql, function (err, compaigns) {
    console.log("================",err,compaigns)
    if(compaigns[0].id!=null && compaigns[0].id.length>0){
    console.log(compaigns[0].id);
    var sqlU="Update compaign_participants SET status=2 WHERE compaign_id IN("+compaigns[0].id+")"
console.log(sqlU)
   connection.query(sqlU, function (err, compaigns) {
    console.log(err,compaigns)
        })
        var sqlUC="Update compaigns SET status=2 WHERE id IN("+compaigns[0].id+")"
        console.log(sqlUC)
           connection.query(sqlUC, function (err, compaigns) {
            console.log(err,compaigns)
                })

  }

  })

    
  } catch(err){
    console.log(err,"====>")
  }
});








