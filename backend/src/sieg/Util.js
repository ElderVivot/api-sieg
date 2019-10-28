const path = require('path')

const zeroLeft = (valueInsert, countZeros=2) => {
    return ("0000".repeat(countZeros) + valueInsert).slice(-countZeros);
  }

 const daysInitialAndEndOfMonth = (month, year) => {
    const dateInitial = new Date(year, month-1, 1)
  
    const dateEnd = new Date(year, month, 0)
    
    return{
      dateInitial: `${dateInitial.getFullYear()}-${zeroLeft(dateInitial.getMonth()+1)}-${zeroLeft(dateInitial.getDate())}`, 
      dateEnd: `${dateEnd.getFullYear()}-${zeroLeft(dateEnd.getMonth()+1)}-${zeroLeft(dateEnd.getDate())}`
    }
  }

  // console.log(daysInitialAndEndOfMonth(12,2019))

  module.exports.zeroLeft = zeroLeft
  module.exports.daysInitialAndEndOfMonth = daysInitialAndEndOfMonth
  module.exports.wayMainToSaveXML = 'Y:\\7-DEPTO FISCAL\\9999 - XMLs'
  module.exports.wayToSaveLog = `${path.join(__dirname, '../..')}\\exportData\\logs`