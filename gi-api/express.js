/*Note: express js를 실행하기 위하여, 세 가지의 패키지 설치가 필요합니다. 
1. npm i express
2. npm i @elastic/elasticsearch
3. npm i cors (CORS issue를 해결하기 위하여 설치함. )
*/
'use strict'

const { Client } = require('@elastic/elasticsearch')
//client란의 node
const client = new Client({ node: 'http://165.22.111.152:9200' })
const express = require('express');
const cors = require('cors')
const app = express();

app.use(express.json());
app.use(cors());



/*
1. Top Pages 차트를 위한 API입니다.
2. api를 호출할때 url에 더해 body에 json으로 user, project, period 정보를 실어서 보내야 합니다.
아래는 json 예시입니다.
{user:"jane", project:"drone", period:"w"}
user란에는 GI 웹 사이트에서 가져온 user의 id, project란에는 현재 조회하고 있는 project의 이름, period는 통계 기간을 의미합니다.
period에는 "d", "w", "M"의 3가지 값을 줄 수 있습니다.
"d" -> 통계 기간: [24시간 전 ~ 현재 시간]
"w" -> 통계 기간: [1주일 전(168시간) ~ 현재 시간]
"M" -> 통계 기간: [한달 전 ~ 현재 시간]
3. 이 api는 Top 100 Pages Array를 리턴합니다. Array의 각 원소는 {key: "url", doc_count: "number"}로 이루어져 있으며
keyy은 해당 page의 url, doc_count에는 방문 횟수를 담고 있습니다.
*/ 
app.post('/api/top-pages', async(req, res) => {

  const value=req.body;
  const user=value.user;
  const project=value.project;
  const period=value.period;

  var targetdate="now-1"+period
  const { body } = await client.search({
    index: 'accesslog-gi',
    // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
    body: {
      query: {
        bool: {
            must: [
              {term: {"fields.myid.keyword": user}},
              {term: {"fields.project.keyword": project}},
              {range: {"lastvisit": {"gte": targetdate, "lte": "now"}}}
            ],
            filter: {
                exists: {
                    field: "uid.keyword"
                }
            }
        }
      },
      aggs: {
        top_pages: {
            terms: {
                field: "url.keyword",
                size: 100,
                order:{
                    "_term": "desc"
                }
            }
        }
      }
    }
  });
  res.send(body.aggregations.top_pages.buckets);

});

/*
1. Browsers Breakdown를 위한 API입니다.
2. api를 호출할때 url에 더해 body에 json으로 user, project, period 정보를 실어서 보내야 합니다.
아래는 json 예시입니다.
{user:"jane", project:"drone", period:"w"}
user란에는 GI 웹 사이트에서 가져온 user의 id, project란에는 현재 조회하고 있는 project의 이름, period는 통계 기간을 의미합니다.
period에는 "d", "w", "M"의 3가지 값을 줄 수 있습니다.
"d" -> 통계 기간: [24시간 전 ~ 현재 시간]
"w" -> 통계 기간: [1주일 전(168시간) ~ 현재 시간]
"M" -> 통계 기간: [한달 전 ~ 현재 시간]
3. 이 api는 Top 10 browsers Array를 리턴합니다. Array의 각 원소는 {key: "browsers_info", doc_count: "number"}로 이루어져 있으며
key에는 해당 브라우저의 이름, doc_count에는 해당 브라우저로 접속한 횟수를 담고 있습니다.
*/ 

app.post('/api/browsers', async(req, res) => {

    const value=req.body;
    const user=value.user;
    const project=value.project;
    const period=value.period;

    var targetdate="now-1"+period

    const { body } = await client.search({
        index: 'accesslog-gi',
        // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
        body: {
          query: {
            bool: {
                must: [
                  {term: {"fields.myid.keyword": user}},
                  {term: {"fields.project.keyword": project}},
                  {range: {"lastvisit": {"gte": targetdate, "lte": "now"}}}
                ],
                filter: {
                    exists: {
                        field: "uid.keyword"
                    }
                }
            }
          },
          aggs: {
            broswer_sum: {
                terms: {
                    field: "name.keyword",
                    size: 10,
                    order:{
                        "_term": "desc"
                    }
                }
            }
          }
        }
      });
      res.send(body.aggregations.broswer_sum.buckets);

});

/*
1. Devices Breakdown 차트를 위한 API입니다.
2. api를 호출할때 url에 더해 body에 json으로 user, project, period 정보를 실어서 보내야 합니다.
아래는 json 예시입니다.
{user:"jane", project:"drone", period:"w"}
user란에는 GI 웹 사이트에서 가져온 user의 id, project란에는 현재 조회하고 있는 project의 이름, period는 통계 기간을 의미합니다.
period에는 "d", "w", "M"의 3가지 값을 줄 수 있습니다.
"d" -> 통계 기간: [24시간 전 ~ 현재 시간]
"w" -> 통계 기간: [1주일 전(168시간) ~ 현재 시간]
"M" -> 통계 기간: [한달 전 ~ 현재 시간]
3. 이 api는 Top 10 Devices Array를 리턴합니다. Array의 각 원소는 {key: "devices_info", doc_count: "number"}로 이루어져 있으며
key는 devices의 정보, doc_count에는 해당 device로 접속한 횟수를 담고 있습니다.
*/ 

app.post('/api/devices', async(req, res) => {

    const value=req.body;
    const user=value.user;
    const project=value.project;
    const period=value.period;

    var targetdate="now-1"+period
    
    const { body } = await client.search({
        index: 'accesslog-gi',
        // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
        body: {
          query: {
            bool: {
                must: [
                  {term: {"fields.myid.keyword": user}},
                  {term: {"fields.project.keyword": project}},
                  {range: {"lastvisit": {"gte": targetdate, "lte": "now"}}}
                ],
                filter: {
                    exists: {
                        field: "uid.keyword"
                    }
                }
            }
          },
          aggs: {
            device_sum: {
                terms: {
                    field: "device.keyword",
                    size: 10,
                    order:{
                        "_term": "desc"
                    }
                }
            }
          }
        }
      });
      res.send(body.aggregations.device_sum.buckets);


});

/*
1. OS breakdown 차트를 위한 API입니다.
2. api를 호출할때 url에 더해 body에 json으로 user, project, period 정보를 실어서 보내야 합니다.
아래는 json 예시입니다.
{user:"jane", project:"drone", period:"w"}
user란에는 GI 웹 사이트에서 가져온 user의 id, project란에는 현재 조회하고 있는 project의 이름, period는 통계 기간을 의미합니다.
period에는 "d", "w", "M"의 3가지 값을 줄 수 있습니다.
"d" -> 통계 기간: [24시간 전 ~ 현재 시간]
"w" -> 통계 기간: [1주일 전(168시간) ~ 현재 시간]
"M" -> 통계 기간: [한달 전 ~ 현재 시간]
3. 이 api는 Top 10 OS Array를 리턴합니다. Array의 각 원소는 {key: "os_info", doc_count: "number"}로 이루어져 있으며
key는 해당 os의 정보, doc_count에는 해당 os로 접속한 횟수를 담고 있습니다.
*/ 

app.post('/api/os', async(req, res) => {

    const value=req.body;
    const user=value.user;
    const project=value.project;
    const period=value.period;

    var targetdate="now-1"+period

    const { body } = await client.search({
        index: 'accesslog-gi',
        // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
        body: {
          query: {
            bool: {
                must: [
                  {term: {"fields.myid.keyword": user}},
                  {term: {"fields.project.keyword": project}},
                  {range: {"lastvisit": {"gte": targetdate, "lte": "now"}}}
                ],
                filter: {
                    exists: {
                        field: "uid.keyword"
                    }
                }
            }
          },
          aggs: {
            os_sum: {
                terms: {
                    field: "os_name.keyword",
                    size: 10,
                    order:{
                        "_term": "desc"
                    }
                }
            }
          }
        }
      });
      res.send(body.aggregations.os_sum.buckets);


});


//Date format을 MM/DD/YYYY로 변환합니다.

function GetFormattedDate(target_time) {
  var month = String(target_time.getMonth() + 1);
  var day = String(target_time.getDate());
  var year = String(target_time.getFullYear());
  return month + "/" + day + "/" + year;
}

/*
1. Active Users 차트를 위한 API입니다.
2. api를 호출할때 url에 더해 body에 json으로 user, project, period 정보를 실어서 보내야 합니다.
아래는 json 예시입니다.
{user:"jane", project:"drone", period:"w"}
user란에는 GI 웹 사이트에서 가져온 user의 id, project란에는 현재 조회하고 있는 project의 이름, period는 통계 기간을 의미합니다.
period에는 "d", "w", "M"의 3가지 값을 줄 수 있습니다. 
이 API는 elasticsearch에 5번 query를 날립니다. 각 통계 기간에 해당하는 query를 날려, 총 [현재시간 - 5*통계기간] ~ [현재시간] 사이의 정보를
[현재시간-(i)*통계기간]~[현재시간-(i-1)*통계기간], i=1~5 
를 기준으로 나눠 제공합니다.
3. 이 api는  Active User Array를 리턴합니다. Array의 각 원소는 {range: "statistic_period", count: "number"}로 이루어져 있으며
range는 해당 통계 기간, count에는 Active User수를 담고 있습니다.
*/ 

app.post('/api/active-users', async(req, res) => {
  
  const value=req.body;
  const user=value.user;
  const project=value.project;
  const period=value.period;

  var user_overtime = new Array()
  for(var i=1; i<=5; i++){
    var target_period = period
    var start_date="now-"+String(i)+target_period
    var end_date="now-1"+String(i-1)+target_period
    
    if(i==1){
      end_date="now"
    }

    const { body } = await client.search({
        index: 'accesslog-gi',
        // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
        body: {
          query: {
            bool: {
                must: [
                  {term: {"fields.myid.keyword": user}},
                  {term: {"fields.project.keyword": project}},
                  {range: {"lastvisit": {"gte": start_date, "lte": end_date}}}
                ],
                filter: {
                    exists: {
                        field: "uid.keyword"
                    }
                }
            }
          },
          aggs: {
            total_users: {
               cardinality: {
                 field: "uid.keyword"
               }
            }
          }
        }
      });

      start_date=new Date();
      end_date=new Date();

      if(target_period == "d"){
        start_date.setDate(start_date.getDate()-i)
        end_date.setDate(end_date.getDate()-(i-1))
      }
      else if(target_period == "w"){
        var week_in_ms = 7 * 24 * 60 * 60 * 1000;
        start_date.setTime(start_date.getTime()-i*week_in_ms)
        end_date.setTime(end_date.getTime()-(i-1)*week_in_ms)
      }
      else if(target_period == "M"){
        start_date.setMonth(start_date.getMonth()-i)
        end_date.setMonth(end_date.getMonth()-(i-1))
      }

      //convert to UTC+9 time
      start_date.setHours(start_date.getHours()+9)
      end_date.setHours(end_date.getHours()+9)

      var time_range = GetFormattedDate(start_date) + "~" + GetFormattedDate(end_date)
      user_overtime.push({range:time_range, count:body.aggregations.total_users.value})
    }
    res.send(user_overtime.reverse());

});

/*
1. Total Users 차트를 위한 API입니다.
2. api를 호출할때 url에 더해 body에 json으로 user, project, period 정보를 실어서 보내야 합니다.
아래는 json 예시입니다.
{user:"jane", project:"drone", period:"w"}
user란에는 GI 웹 사이트에서 가져온 user의 id, project란에는 현재 조회하고 있는 project의 이름, period는 통계 기간을 의미합니다.
period에는 "d", "w", "M"의 3가지 값을 줄 수 있습니다. 
이 API는 elasticsearch에 5번 query를 날립니다. 각 통계 기간에 해당하는 query를 날려, 총 [현재시간 - 5*통계기간] ~ [현재시간] 사이의 정보를
[현재시간-(i)*통계기간]~[현재시간-(i-1)*통계기간], i=1~5 
를 기준으로 나눠 제공합니다.
3. 이 api는  Total User Array를 리턴합니다. Array의 각 원소는 {range: "statistic_period", count: "number"}로 이루어져 있으며
range는 해당 통계 기간, count에는 Total User수를 담고 있습니다.
*/ 

app.post('/api/total-users', async(req, res) => {

  const value=req.body;
  const user=value.user;
  const project=value.project;
  const period=value.period;

  var user_overtime = new Array();
  for(var i=1; i<=5; i++){
    var target_period = period
    var end_date = "now-1"+String(i-1)+target_period
    
    if(i==1){
      end_date="now"
    }

    const { body } = await client.search({
        index: 'accesslog-gi',
        // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
        body: {
          query: {
            bool: {
                must: [
                  {term: {"fields.myid.keyword": user}},
                  {term: {"fields.project.keyword": project}},
                  {range: {"lastvisit": {"lte": end_date}}}
                ],
                filter: {
                    exists: {
                        field: "uid.keyword"
                    }
                }
            }
          },
          aggs: {
            total_users: {
               cardinality: {
                 field: "uid.keyword"
               }
            }
          }
        }
      });
      end_date=new Date();

      if(target_period == "d"){
        end_date.setDate(end_date.getDate()-(i-1))
      }
      else if(target_period == "w"){
        var week_in_ms = 7 * 24 * 60 * 60 * 1000;
        end_date.setTime(end_date.getTime()-(i-1)*week_in_ms)
      }
      else if(target_period == "M"){
        end_date.setMonth(end_date.getMonth()-(i-1))
      }

      //convert to UTC+9 time
      end_date.setHours(end_date.getHours()+9)
      
      user_overtime.push({to:GetFormattedDate(end_date), count:body.aggregations.total_users.value})
    }
    res.send(user_overtime.reverse());
});

/*
1. Referrer 차트를 위한 API입니다.
2. api를 호출할때 url에 더해 body에 json으로 user, project, period 정보를 실어서 보내야 합니다.
아래는 json 예시입니다.
{user:"jane", project:"drone", period:"w"}
user란에는 GI 웹 사이트에서 가져온 user의 id, project란에는 현재 조회하고 있는 project의 이름, period는 통계 기간을 의미합니다.
period에는 "d", "w", "M"의 3가지 값을 줄 수 있습니다.
"d" -> 통계 기간: [24시간 전 ~ 현재 시간]
"w" -> 통계 기간: [1주일 전(168시간) ~ 현재 시간]
"M" -> 통계 기간: [한달 전 ~ 현재 시간]
3. 이 api는 Top 10 Referrers Array를 리턴합니다. Array의 각 원소는 {key: "referrer_url", doc_count: "number"}로 이루어져 있으며
key는 해당 referrer의 url, doc_count에는 해당 referrer에서 사이트로 접속한 횟수를 담고 있습니다.
*/ 

app.post('/api/referrers', async(req, res) => {

  const value=req.body;
  const user=value.user;
  const project=value.project;
  const period=value.period;

  var targetdate="now-1"+period

  const { body } = await client.search({
    index: 'accesslog-gi',
    // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
    body: {
      query: {
        bool: {
            must: [
              {term: {"fields.myid.keyword": user}},
              {term: {"fields.project.keyword": project}},
              {range: {"lastvisit": {"gte": targetdate, "lte": "now"}}}
            ],
            filter: {
                exists: {
                    field: "uid.keyword"
                }
            }
        }
      },
      aggs: {
        referrers: {
            terms: {
                field: "referrer.keyword",
                size: 10,
                order:{
                    "_term": "desc"
                }
            }
        }
      }
    }
  });
  res.send(body.aggregations.referrers.buckets);

});

/*
1. Funnel 차트를 위한 API입니다.
2. api를 호출할때 url에 더해 body에 json으로 user, project, period.from, period.to, flow정보를 실어서 보내야 합니다.
아래는 json 예시입니다.
{ "user": "jane", "project": "drone" ,"period": {"from":"now-1w", "to":"now"}, "flow":["/", "/api/pattern/PATTERN1", "/api/component/COMPONENT1"]}
user란에는 GI 웹 사이트에서 가져온 user의 id, project란에는 현재 조회하고 있는 project의 이름, period는 통계 기간을 의미합니다. period는 from, to로 나누어져 있으며
from, to에 주어진 값을 이용하여 elasticsearch에 query를 날립니다. 값의 형식에 관해서는 https://www.elastic.co/guide/en/elasticsearch/reference/current/common-options.html#date-math
를 참조하십시오.
flow는 url로 이루어진 배열입니다. flow[0]에 landing page의 url을, flow의 마지막 원소로 target page의 url을 삽입하여 주십시오.
3. 이 api는 Flow Url count array를 리턴합니다. Array의 각 원소는 {label: "url", value: "number"}로 이루어져 있으며
label은 해당 page의 url, value에는 방문 횟수를 담고 있습니다.
*/ 

app.post('/api/funnel', async(req, res) => {
  const value= req.body;
  const user=value.user;
  const project=value.project;
  const from=value.period.from;
  const to=value.period.to;
  const flow=value.flow;

  var page_count=new Array();

  for(var i in flow){
    const { body } = await client.search({
      index: 'accesslog-gi',
      // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
      body: {
        query: {
          bool: {
              must: [
                {term: {"fields.myid.keyword": user}},
                {term: {"fields.project.keyword": project}},
                {term: {"url.keyword": flow[i]}},
                {range: {"lastvisit": {"gte": from, "lte": to}}}
              ],
              filter: {
                  exists: {
                      field: "uid.keyword"
                  }
              }
          }
        }
      }
    });
    page_count.push({label: flow[i], value:body.hits.total.value});
}
  res.send(page_count);

});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
