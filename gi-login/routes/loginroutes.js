var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'tom71168',
  password : 'duddbs153',
  database : 'giproject'
});
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");
} else {
    console.log("Error connecting database ... nn");
}
});

exports.register = function(req,res){
    console.log("-------------req::",req.body);
    var body = req.body;
    if(body===null){
        res.send({
            "code":400,
            "message":"error ocurred"
        })
    }

    var today = new Date();
    var users={
      "userid":body.userid,
      "password":body.password,
      "email":body.email,
      "created":today,
      "modified":today
    }
    connection.query('INSERT INTO users SET ?',users, function (error, results, fields) {
    if (error) {
      console.log("error ocurred",error);
      res.send({
        "code":400,
        "message":"error ocurred"
      })
    }else{
      console.log('The solution is: ', results);
      res.send({
        "code":200,
        "message":"user registered sucessfully"
          });
    }
    });
  }

  exports.login = function(req,res){
    console.log("---------------req::", req.body)
    var body = req.body;
    if(body===null){
        res.send({
            "code":400,
            "message":"error ocurred"
        })
    }

    var userid= body.email;
    var password = body.password;
    connection.query('SELECT * FROM users WHERE email = ?',[userid], function (error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code":400,
        "message":"error ocurred"
      })
    }else{
      // console.log('The solution is: ', results);
      if(results.length >0){
        if(results[0].password == password){
          res.send({
            "code":200,
            "message":"login sucessfull"
              });
        }
        else{
          res.send({
            "code":204,
            "message":"Email and password does not match"
              });
        }
      }
      else{
        res.send({
          "code":204,
          "message":"Email does not exits"
            });
      }
    }
    });
  }


  exports.projectRegister = function(req,res){
    console.log("-------------req::",req.body);
    var body = req.body;
    if(body===null){
        res.send({
            "code":400,
            "message":"error ocurred"
        })
    }

    var projects={
      "userid":body.userid,
      "projectname":body.projectname,
      "projectmanager":body.projectmanager,
      "projecturl":body.projecturl,
      "description":body.description,
    }
    connection.query('INSERT INTO projects SET ?', projects, function (error, results, fields) {
    if (error) {
      console.log("error ocurred",error);
      res.send({
        "code":400,
        "message":"error ocurred"
      })
    }else{
      console.log('The solution is: ', results);
      res.send({
        "code":200,
        "message":"project registered sucessfully"
          });
    }
    });
  }

  exports.projectShow = function(req, res){
      var body = req.body;
      if(body===null){
        res.send({
            "code":400,
            "message":"error ocurred"
        })
      }
      
      var userid = body.userid;
      connection.query('SELECT * FROM projects WHERE userid = ?',[userid], function (error, results, fields) {
        if (!error) {
          res.send({
            "code":200,
            "message":"success",
            "data":results
          });
          console.log('The solution is: ', results);
        }else{
          console.log('error occured', error);
          res.send({
            "code":400,
            "message":"error occured!"
              });
        }
        });
    }
