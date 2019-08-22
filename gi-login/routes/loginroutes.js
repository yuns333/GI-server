var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'tom71168',
  password : '1111',
  database : 'giproject'
});
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");
} else {
    console.log("Error connecting database ... nn");
    console.log(err);
}
});


//회원가입
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


  //로그인
  exports.login = function(req,res){
    console.log("---------------req::", req.body)
    var body = req.body;
    if(body===null){
        res.send({
            "code":400,
            "message":"error ocurred"
        })
    }

    var userid= body.userid;
    var password = body.password;
    connection.query('SELECT * FROM users WHERE userid = ?',[userid], function (error, results, fields) {
    if (error) {
      console.log("error ocurred",error);
      res.send({
        "code":400,
        "message":"error ocurred"
      })
    }else{
      console.log('The solution is: ', results);
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
            "message":"userid and password does not match"
              });
        }
      }
      else{
        res.send({
          "code":204,
          "message":"userid does not exits"
            });
      }
    }
    });
  }


  //프로젝트 등록
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

  //프로젝트 불러오기
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
