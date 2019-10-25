const fs = require('fs');

const createPasteToSaveXML = (wayBase, nameEmp, codiEmp, monthYear, operationNF, typeNF) => {
    let wayToSaveXMLs = wayBase
  
    let namePasteCompanie = `${nameEmp.substring(0, 70)} - ${codiEmp}`
    fs.existsSync(`${wayToSaveXMLs}\\${namePasteCompanie}`) || fs.mkdirSync(`${wayToSaveXMLs}\\${namePasteCompanie}`)
    wayToSaveXMLs = `${wayToSaveXMLs}\\${namePasteCompanie}`
  
    let namePasteMonthYear = monthYear
    fs.existsSync(`${wayToSaveXMLs}\\${namePasteMonthYear}`) || fs.mkdirSync(`${wayToSaveXMLs}\\${namePasteMonthYear}`)
    wayToSaveXMLs = `${wayToSaveXMLs}\\${namePasteMonthYear}`
  
    // entradas or saídas
    let namePasteOperationNF = operationNF
    fs.existsSync(`${wayToSaveXMLs}\\${namePasteOperationNF}`) || fs.mkdirSync(`${wayToSaveXMLs}\\${namePasteOperationNF}`)
    wayToSaveXMLs = `${wayToSaveXMLs}\\${namePasteOperationNF}`
  
    let nameTypeNF = typeNF
    fs.existsSync(`${wayToSaveXMLs}\\${nameTypeNF}`) || fs.mkdirSync(`${wayToSaveXMLs}\\${nameTypeNF}`)
    wayToSaveXMLs = `${wayToSaveXMLs}\\${nameTypeNF}`
  
    return wayToSaveXMLs
  }

  module.exports.createPasteToSaveXML = createPasteToSaveXML