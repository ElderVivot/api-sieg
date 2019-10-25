const fs = require('fs');

const createPasteToSaveXML = (wayBase, nameEmp, codiEmp, year, month, operationNF, typeNF) => {
    let wayToSaveXMLs = wayBase
  
    let namePasteCompanie = `${nameEmp.substring(0, 70)} - ${codiEmp}`
    fs.existsSync(`${wayToSaveXMLs}\\${namePasteCompanie}`) || fs.mkdirSync(`${wayToSaveXMLs}\\${namePasteCompanie}`)
    wayToSaveXMLs = `${wayToSaveXMLs}\\${namePasteCompanie}`
  
    let namePasteYear = year
    fs.existsSync(`${wayToSaveXMLs}\\${namePasteYear}`) || fs.mkdirSync(`${wayToSaveXMLs}\\${namePasteYear}`)
    wayToSaveXMLs = `${wayToSaveXMLs}\\${namePasteYear}`

    let namePasteMonth = month
    fs.existsSync(`${wayToSaveXMLs}\\${namePasteMonth}`) || fs.mkdirSync(`${wayToSaveXMLs}\\${namePasteMonth}`)
    wayToSaveXMLs = `${wayToSaveXMLs}\\${namePasteMonth}`
  
    // entradas ou saídas
    let namePasteOperationNF = operationNF
    fs.existsSync(`${wayToSaveXMLs}\\${namePasteOperationNF}`) || fs.mkdirSync(`${wayToSaveXMLs}\\${namePasteOperationNF}`)
    wayToSaveXMLs = `${wayToSaveXMLs}\\${namePasteOperationNF}`
  
    let nameTypeNF = typeNF
    fs.existsSync(`${wayToSaveXMLs}\\${nameTypeNF}`) || fs.mkdirSync(`${wayToSaveXMLs}\\${nameTypeNF}`)
    wayToSaveXMLs = `${wayToSaveXMLs}\\${nameTypeNF}`
  
    return wayToSaveXMLs
  }

  module.exports.createPasteToSaveXML = createPasteToSaveXML