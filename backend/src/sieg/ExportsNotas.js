const fs = require('fs');
const xmljs = require('xml-js')
const path = require('path')
const util = require('./Util')
const createPasteToSaveXMLs = require('./CreatePasteToSaveXML')
const searchNotas = require('./SearchNotas')

console.log(path.join(__dirname, '../..'))

// define the way to read companies
let wayCompanies = `${path.join(__dirname, '../..')}\\exportData\\companies.json`
const companiesValues = require(wayCompanies)

const dateActual = new Date()
// will only current year and last year
yearsRead = [dateActual.getFullYear()-1, dateActual.getFullYear()]
// this is util for last year, that is necessary read every months of year
allMonthsOfYear = [1,2,3,4,5,6,7,8,9,10,11,12]
// this is util for current year, where should read future months
monthsOfYear = []
for(i=0; i<=dateActual.getMonth(); i++){
  monthsOfYear.push(i+1)
}

// execute export xmls
const exportNotas = async (typeCNPJ, typeNF) => {

  let wayMain = util.wayMainToSaveXML
  let wayLog = util.wayToSaveLog

  if(typeCNPJ == "cnpjEmit" || typeCNPJ == "cnpjRemet"){
    forderTypeCNPJ = "Saidas"
  } else{
    forderTypeCNPJ = "Entradas"
  }

  if(typeNF == "nfe"){
    folderTypeNF = "NF-e"
  } else if(typeNF == "cte"){
    folderTypeNF = "CT-e"
  } else if(typeNF == "nfse"){
    folderTypeNF = "NFS-e"
  } else if(typeNF == "nfce"){
    folderTypeNF = "NFC-e"
  }

  for(companie of companiesValues){

    for(year of yearsRead){

      if(year == dateActual.getFullYear()){
        monthsRead = monthsOfYear
      } else {
        monthsRead = allMonthsOfYear
      }

      for(month of monthsRead){

        let date = util.daysInitialAndEndOfMonth(month, year)
        let dateInitialFormatted = date.dateInitial
        let dateEndFormatted = date.dateEnd

        let skip = 0

        try {
          const notas = await searchNotas.searchNotas(companie.cgce_emp, typeCNPJ, typeNF, dateInitialFormatted, dateEndFormatted)

          //  generates only when exists NFs in the month
          if (notas.length >= 1) {
            fs.writeFileSync(`${wayLog}\\${companie.codi_emp}-${year}-${util.zeroLeft(month)}-${skip}-ok${typeNF}.csv`, `Codigo Empresa;Nome Empresa;CNPJ Empresa;Mes-Ano;Chave NF-e;Tipo CNPJ Busca;Tipo Nota Busca\n`)
          
            let wayToSaveXML = createPasteToSaveXMLs.createPasteToSaveXML(wayMain, companie.nome_emp, companie.codi_emp, year, util.zeroLeft(month), forderTypeCNPJ, folderTypeNF)
    
            notas.forEach( (nota, indice) => {
              let xmlDecode = new Buffer(nota, 'base64').toString('ascii');
              xmlToJson = JSON.parse(xmljs.xml2json(xmlDecode))
              
              let keyNF = xmlToJson.elements[0].elements[0].elements[0].attributes.Id
              
              fs.writeFileSync(`${wayToSaveXML}\\${keyNF}.xml`, xmlDecode, 'utf8')

              console.log(`* Exportado ${util.zeroLeft(indice+1)}/${util.zeroLeft(notas.length)}: ${keyNF} do mês ${year}-${util.zeroLeft(month)} para empresa ${companie.codi_emp} - ${companie.nome_emp} - CNPJ ${companie.cgce_emp} / Tipo ${typeNF}-${typeCNPJ}`)
              
              fs.appendFileSync(`${wayLog}\\${companie.codi_emp}-${year}-${util.zeroLeft(month)}-${skip}-ok${typeNF}.csv`, `${companie.codi_emp};${companie.nome_emp};${companie.cgce_emp};${util.zeroLeft(month)}-${year};${keyNF};${typeCNPJ};${typeNF}\n`)
          })
          } else {
            let textShow = `* Não há nenhuma nota do mês ${year}-${util.zeroLeft(month)} para empresa ${companie.codi_emp} - ${companie.nome_emp} - CNPJ ${companie.cgce_emp} / Tipo ${typeNF}-${typeCNPJ}`
            console.log(textShow)
            fs.writeFileSync(`${wayLog}\\${companie.codi_emp}-${year}-${util.zeroLeft(month)}-${skip}-no${typeNF}.csv`, textShow)
          }
        } catch (error) {
          let textShow = `* Erro para empresa ${companie.codi_emp} - ${companie.nome_emp} - CNPJ ${companie.cgce_emp} / Tipo ${typeNF}-${typeCNPJ} --> ${error}`
          console.log(textShow)
          fs.writeFileSync(`${wayLog}\\${companie.codi_emp}-${year}-${util.zeroLeft(month)}-${skip}-error${typeNF}.csv`, textShow)
        }
      }
    }
  }
}

module.exports.exportNotas = exportNotas