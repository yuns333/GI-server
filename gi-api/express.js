'use strict'

const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://165.22.111.152:9200' })
const express = require('express');
const cors = require('cors')
const app = express();

app.use(express.json());
app.use(cors());



//top pages
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
                    "_term": "asc"
                }
            }
        }
      }
    }
  });
  res.send(body.aggregations.top_pages.buckets);

});

//browsers breakdown

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
                        "_term": "asc"
                    }
                }
            }
          }
        }
      });
      res.send(body.aggregations.broswer_sum.buckets);

});

//devices breakdown
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
                        "_term": "asc"
                    }
                }
            }
          }
        }
      });
      res.send(body.aggregations.device_sum.buckets);


});

//os breakdown
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
                        "_term": "asc"
                    }
                }
            }
          }
        }
      });
      res.send(body.aggregations.os_sum.buckets);


});


//function to convert messy date format to MM/DD/YYYY

function GetFormattedDate(target_time) {
  var month = String(target_time.getMonth() + 1);
  var day = String(target_time.getDate());
  var year = String(target_time.getFullYear());
  return month + "/" + day + "/" + year;
}

//active users
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

//total users
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

//referrers

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
                    "_term": "asc"
                }
            }
        }
      }
    }
  });
  res.send(body.aggregations.referrers.buckets);

});

//funnel api

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
