const  { inspect } = require('util')

const { 
    StatsPipeline, 
    TotalPipeline, 
    LastTwoDays, 
    LastQuarter, 
    Revenue 
} = require('./db.js')

// =============================================================================
// A BUNCH OF VARIABLES NEEDED IN SEVERAL PLACES


// what happens when / is request via GET
const getIndex = async (request, response) => {
    const ua = request.get('user-agent')
    if (ua.includes('UptimeRobot/2.0')) {
        console.log(`${new Date()}: Uptimebot says hello!`)
        await response.set(200)
    } else {
        console.log(`${new Date()}: Uh oh, someone else is visiting: ${ua}`)
        await response.set(404)
    }
}

const getRevenues = async (request, response) => {
    try {
        const stats = await getStats()
        if (stats) {
            response.setHeader('Access-Control-Allow-Origin', '*')
            await response.json(
                stats
            ).status(200)
        } else {
            throw new Error(`stats undefined`)
        }
    } catch (e) {
        console.log(`ERROR: ${e}`)
    }
}

const getStats = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const stats = await Revenue.aggregate(StatsPipeline)
            const total = await Revenue.aggregate(TotalPipeline)
            const twoDays = await Revenue.aggregate(LastTwoDays)
            const lastQuarter = await Revenue.aggregate(LastQuarter)

            return resolve({
                monthlyTotals: stats[0],
                overallTotal: total[0].overallTotal,
                twoDays: twoDays[0],
                lastQuarter: lastQuarter[0]
            })
        } catch (e) {
            return reject(`ERROR in _stats: ${e}`)
        }
    })
}

module.exports = {
    getIndex,
    getRevenues
}
