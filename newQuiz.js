//Create new Quiz:
var request = require('request');
//Uses module_test_db.js file to connect to the test database.
var connection_test = require('./module_test_db');

//var new1 = function(){

//connection_test.query("select ExID,ExName from activityinfo where ExID IN (select ExID from courseactivities where CID = 677) and Written='n'", function(error,result,fields){


//  for(var Ex in result){
//To Create new Quiz
var options_newQuiz = {
  url : 'https://unt.instructure.com/api/v1/courses/608/quizzes?access_token=',
  method : 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  form: {
     "quiz":{
         //"title": result[Ex].ExName,
         "title": "title",
         "quiz_type": "assignment",
         "allowed_attempts": 1,
         "one_question_at_a_time": true,
         "published": true
       }
     }


};

request(options_newQuiz,function(err,res,body){
  if(err) throw err;
  body = JSON.parse(body);
  console.log("New Quiz Created");

//Functions:

    //Process MMC Answer
    function processAnswerMMC(answer,mc1,mc2,mc3,mc4,mc5){

      var a;
      if(answer.search('a')>=0)
        var a = '[{"answer_text":"'+mc1+'","answer_weight":100}';
      else {
        var a = '[{"answer_text":"'+mc1+'","answer_weight":0}';
      }

      if(answer.search('b')>=0)
        a = a+',{"answer_text":"'+mc2+'","answer_weight":100}';
      else {
        a = a+',{"answer_text":"'+mc2+'","answer_weight":0}';
      }

      if(mc3 != null && mc3 != ''){
        if(answer.search('c')>=0)
          a = a+',{"answer_text":"'+mc3+'","answer_weight":100}';
        else {
          a = a+',{"answer_text":"'+mc3+'","answer_weight":0}';
        }
      }
      if(mc4 != null && mc4 != ''){
        if(answer.search('d')>=0)
          a = a+',{"answer_text":"'+mc4+'","answer_weight":100}';
        else {
          a = a+',{"answer_text":"'+mc4+'","answer_weight":0}';
        }
      }
      if(mc5 != null && mc5 != ''){
        if(answer.search('e')>=0)
          a = a+',{"answer_text":"'+mc5+'","answer_weight":100}';
        else {
          a = a+',{"answer_text":"'+mc5+'","answer_weight":0}';
        }
      }
      a = a+']';
      return a;
    }

    //Process FIB Answers
    function processAnswerFIB(answer){
      var b = '[';
      if(answer.search('|')>=0){
        var a = answer.split("|");
        for (var c in a){
          b = b+'{"answer_text":"'+a[c]+'","answer_weight":100},';
        }
        b = b.slice(0, -1);
        b = b + ']';
      }
      else {
       b = b+'{"answer_text":"'+answer+'","answer_weight":100}]';
     }
     return b;
    }

    //Process TF Answers
    function processAnswerTF(answer){
      var a;
      if(answer.search('true')>=0)
        a = '[{"answer_text":"True","answer_weight":100}, {"answer_text":"False","answer_weight":0}]';
      else {
        a = '[{"answer_text":"True","answer_weight":0}, {"answer_text":"False","answer_weight":100}]';
      }
      return a;
    }


//End of Functions


  //Get Data from Database
  connection_test.query("select ExID,ItemNo,Question,Answer,MC1,MC2,MC3,MC4,MC5,ItemType from behv.items where ExID = 'Sy52sp' order by ItemNo asc", function(err,result,fields){
    if(err) throw err;

    for(var count in result){

      //MMC type Questions:
        if(result[count].ItemType=='mmc'){
          // Processing Answer through processAnswer function
          var ans = processAnswerMMC(result[count].Answer,result[count].MC1,result[count].MC2,result[count].MC3,result[count].MC4,result[count].MC5);
          ans = JSON.parse(ans);
          var options_post = {
            url : 'https://unt.instructure.com/api/v1/courses/608/quizzes/'+body.id+'/questions?access_token=',
            method : 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            form: {
              "question":{
                "points_possible": 1,
                "question_name": result[count].ItemNo,
                "position": result[count].ItemNo+1,
                "question_text": result[count].Question,
                "question_type": "multiple_answers_question",
                "answers": ans
                }
              }

            }
          }//End of If mmc
          //Fill in the blanks type Questions:
          if(result[count].ItemType=='fib'){
            var ans = processAnswerFIB(result[count].Answer);
            ans = JSON.parse(ans);
              var options_post = {
              url : 'https://unt.instructure.com/api/v1/courses/608/quizzes/'+body.id+'/questions?access_token=',
              method : 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              form: {
    	          "question":{
    		          "points_possible": 1,
    		          "question_name": result[count].ItemNo,
    		          "question_text": result[count].Question,
    		          "question_type": "short_answer_question",
			            "answers": ans
    	           }
              }
            }
          }//End of If fib

          //tf type Questions:
            if(result[count].ItemType=='tf'){
              // Processing Answer through processAnswer function
              var ans = processAnswerTF(result[count].Answer);
              ans = JSON.parse(ans);
              var options_post = {
                url : 'https://unt.instructure.com/api/v1/courses/608/quizzes/'+body.id+'/questions?access_token=',
                method : 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                form: {
                  "question":{
                    "points_possible": 1,
                    "question_name": result[count].ItemNo,
                    "position": result[count].ItemNo+1,
                    "question_text": result[count].Question,
                    "question_type": "true_false_question",
                    "answers": ans
                    }
                  }

                }
              }//End of If tf


          //Post Request to Canvas
          if(result[count].ItemType=='mmc' || result[count].ItemType=='fib' || result[count].ItemType=='tf'){
            request(options_post,function(err,res,body){
              if(err) throw err;
            });
          }


    }//Inner Items for loop ends here

  });//End of items connection_query function


});
//}//End of outer for loop
//});//End of courseactivities function.
//};//End of function
module.exports = options_newQuiz;
//exports.new1 = new1;
