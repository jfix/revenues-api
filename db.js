require('dotenv').config()
const mongoose = require('mongoose')

// mongoose.set('debug', { shell: true })

// =============================================================================
// DB CONNECTION DETAILS
const dbUser = process.env.REVENUES_MONGO_USER
const dbPwd = process.env.REVENUES_MONGO_PWD
const dbHost = process.env.REVENUES_MONGO_HOST
const dbDb = process.env.REVENUES_MONGO_DB
const dbConn = `mongodb://${dbUser}:${dbPwd}@${dbHost}/${dbDb}`
// const dbConn = `mongodb://${dbHost}/${dbDb}`

// =============================================================================
// SCHEMA FOR A REVENUE RECORD
const Schema = mongoose.Schema
const revenueSchema = new Schema({
  date: {
    type: Date
  },
  revenue: Number
})

// aggregates the overall total revenue 
const TotalPipeline = [{
  $group: {
    _id: null,
    overallTotal: {
      $sum: {
        $toDouble: "$revenue"
      }
    }
  }
}, {
  $project: {
    _id: false
  }
}]

const MinMaxAvgPipeline = [
  {
    '$sort': {
      'revenue': -1
    }
  }, {
    '$group': {
      '_id': null, 
      'min': {
        '$last': '$$ROOT'
      }, 
      'max': {
        '$first': '$$ROOT'
      }, 
      'avg': {
        '$avg': {
          '$toDouble': '$$ROOT.revenue'
        }
      }
    }
  }, {
    '$addFields': {
      'min': {
        'revenue': {
          '$toDouble': '$$ROOT.min.revenue'
        }
      }, 
      'max': {
        'revenue': {
          '$toDouble': '$$ROOT.max.revenue'
        }
      }
    }
  }, {
    '$project': {
      '_id': false, 
      'min._id': false, 
      'max._id': false
    }
  }
]

// this function is used by the /stats endpoint to retrieve data
const StatsPipeline = [
  {
    // sort by descending date
    $sort: { date: -1 }
  },
  {
    // create documents with year-month as _id and the aggregated 
    // value of the revenues of that month
    $group: {
      '_id': {
        '$dateToString': {
          'date': '$date',
          'format': '%Y-%m'
        }
      },
      'revenue': {
        '$sum': '$revenue'
      },
    }
  },
  {
    // sort the documents by date (_id is yyyy-mm)
    $sort: { _id: 1 }
  },
  {
    // create an array containing the _id and revenue values as an object
    '$group': {
      '_id': null,
      'data': {
        '$push': {
          '$arrayToObject': [
            [
              {
                'k': '$_id',
                'v': {
                  '$toDouble': '$revenue'
                }
              }
            ]
          ]
        }
      }
    }
  },
  // remove _id key
  {
    $project: {
      "_id": 0
    }
  }
]
const LastQuarter = [
  {
    '$sort': {
      'date': -1
    }
  }, {
    '$limit': 90
  }, {
    '$group': {
      '_id': {
        '$dateToString': {
          'date': '$date',
          'format': '%Y-%m-%d'
        }
      },
      'revenue': {
        '$sum': '$revenue'
      }
    }
  }, {
    '$sort': {
      '_id': 1
    }
  }, {
    '$group': {
      '_id': null,
      'data': {
        '$push': {
          '$arrayToObject': [
            [
              {
                'k': '$_id',
                'v': {
                  '$toDouble': '$revenue'
                }
              }
            ]
          ]
        }
      }
    }
  }, {
    '$project': {
      '_id': 0
    }
  }
]

// get the first and the currently last dates that are in the database
const FirstAndLastDates = [
  {
    '$sort': {
      'date': 1
    }
  }, {
    '$group': {
      '_id': null,
      'first-date': {
        '$first': '$$ROOT'
      },
      'last-date': {
        '$last': '$$ROOT'
      }
    }
  }, {
    '$group': {
      '_id': null,
      'dates': {
        '$push': {
          'firstDate': '$first-date.date',
          'lastDate': '$last-date.date'
        }
      }
    }
  }, {
    '$project': {
      'res': {
        '$arrayElemAt': [
          '$dates', 0
        ]
      },
      '_id': 0
    }
  }, {
    '$replaceRoot': {
      'newRoot': '$res'
    }
  }
]

const LastTwoDays = [
  {
    '$sort': {
      'date': -1
    }
  }, {
    '$limit': 2
  }, {
    '$group': {
      '_id': {
        '$dateToString': {
          'date': '$date',
          'format': '%Y-%m-%d'
        }
      },
      'revenue': {
        '$sum': '$revenue'
      }
    }
  }, {
    '$sort': {
      '_id': 1
    }
  }, {
    '$group': {
      '_id': null,
      'data': {
        '$push': {
          '$arrayToObject': [
            [
              {
                'k': '$_id',
                'v': {
                  '$toDouble': '$revenue'
                }
              }
            ]
          ]
        }
      }
    }
  }, {
    '$project': {
      '_id': false
    }
  }
]

const Revenue = mongoose.model('Revenue', revenueSchema)
mongoose.connect(dbConn, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

module.exports = {
  StatsPipeline,
  TotalPipeline,
  LastTwoDays,
  LastQuarter,
  FirstAndLastDates,
  MinMaxAvgPipeline,
  Revenue
}
