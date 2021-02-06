// const  { inspect } = require('util')
const { 
    StatsPipeline, 
    TotalPipeline, 
    LastTwoDays, 
    LastQuarter, 
    FirstAndLastDates,
    MinMaxAvgPipeline,
    Revenue 
} = require('./db.js')

const getIndex = async (request, response) => {
    const ua = request.get('user-agent')
    console.log(`!!! ${new Date()}: Uh oh, someone hitting on /: ${ua}`)
    await response.status(404).end()
}

const getRevenues = async (request, response) => {
    try {
        const stats = await Revenue.aggregate(StatsPipeline)
        const total = await Revenue.aggregate(TotalPipeline)
        const twoDays = await Revenue.aggregate(LastTwoDays)
        const lastQuarter = await Revenue.aggregate(LastQuarter)
        const firstAndLastDates = await Revenue.aggregate(FirstAndLastDates)
        const minMaxAvg = await Revenue.aggregate(MinMaxAvgPipeline)

        if (stats && total && twoDays && lastQuarter && firstAndLastDates) {
            console.log(`*** ${new Date()}: Serving revenue stats.`)
            response.setHeader('Access-Control-Allow-Origin', '*')
            await response.json({
                firstAndLastDates: firstAndLastDates[0],
                minMaxAvg: minMaxAvg[0],
                monthlyTotals: stats[0].data,
                overallTotal: total[0].overallTotal,
                twoDays: twoDays[0].data,
                lastQuarter: lastQuarter[0].data
            }).status(200)
        } else {
            throw new Error(`stats undefined`)
        }
    } catch (e) {
        console.log(`ERROR: ${e}`)
    }
}

module.exports = {
    getIndex,
    getRevenues
}
