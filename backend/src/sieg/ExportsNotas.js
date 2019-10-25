const fs = require('fs');
const xmljs = require('xml-js')
const util = require('./Util')
const createPasteToSaveXMLs = require('./CreatePasteToSaveXML')
const searchNotas = require('./SearchNotas')

// define the way to read companies
let wayCompanies = 'C:\\Programming\\api-sieg\\backend\\exportData\\companies.json'
// wayCompanies = __dirname + '\\exportData\\companies.json'
const companiesValues = require(wayCompanies)

const dateActual = new Date()
// will onle current year and last year
yearsRead = [dateActual.getFullYear()-1, dateActual.getFullYear()]
// this is util for last year, that is necessary read every months of year
allMonthsOfYear = [1,2,3,4,5,6,7,8,9,10,11,12]
// this is util for current year, where should read future months
monthsOfYear = []
for(i=0; i<=dateActual.getMonth(); i++){
  monthsOfYear.push(i+1)
}

// execute export xmls
const exportNotas = async (typeCNPJ="cnpjDest", typeNF="nfe") => {

  // way base that will save xml
  let wayMain = util.wayMainToSaveXML
  let wayLog = util.wayToSaveLog

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

          //  generates only when exists NFes in the month
          if (notas.length >= 1) {
            fs.writeFileSync(`${wayLog}\\${companie.codi_emp}-${util.zeroLeft(month)}-${year}-${skip}-ok${typeNF}.csv`, `Codigo Empresa;Nome Empresa;CNPJ Empresa;Mes-Ano;Chave NF-e\n`)
          
            let wayToSaveXML = createPasteToSaveXMLs.createPasteToSaveXML(wayMain, companie.nome_emp, companie.codi_emp, `${util.zeroLeft(month)}-${year}`, "Entradas", "NF-e")
    
            notas.forEach( (nota, indice) => {
              let xmlDecode = new Buffer(nota, 'base64').toString('ascii');
              xmlToJson = JSON.parse(xmljs.xml2json(xmlDecode))
              
              let keyNF = xmlToJson.elements[0].elements[0].elements[0].attributes.Id
              
              fs.writeFileSync(`${wayToSaveXML}\\${keyNF}.xml`, xmlDecode, 'utf8')

              console.log(`* Exportado ${indice+1}/${notas.length}: NF-e ${keyNF} do mês ${util.zeroLeft(month)}-${year} para empresa ${companie.codi_emp} - ${companie.nome_emp} - CNPJ ${companie.cgce_emp}`)
              
              fs.appendFileSync(`${wayLog}\\${companie.codi_emp}-${util.zeroLeft(month)}-${year}-${skip}-ok${typeNF}.csv`, `${companie.codi_emp};${companie.nome_emp};${companie.cgce_emp};${util.zeroLeft(month)}-${year};${keyNF}\n`)
          })
          } else {
            let textShow = `* Não há nenhuma nota do mês ${util.zeroLeft(month)}-${year} para empresa ${companie.codi_emp} - ${companie.nome_emp} - CNPJ ${companie.cgce_emp}`
            console.log(textShow)
            fs.writeFileSync(`${wayLog}\\${companie.codi_emp}-${util.zeroLeft(month)}-${year}-${skip}-no${typeNF}.csv`, textShow)
          }
        } catch (error) {
          let textShow = `* Erro para empresa ${companie.codi_emp} - ${companie.nome_emp} - CNPJ ${companie.cgce_emp} --> ${error}`
          console.log(textShow)
          fs.writeFileSync(`${wayLog}\\${companie.codi_emp}-${util.zeroLeft(month)}-${year}-${skip}-error${typeNF}.csv`, textShow)
        }
      }
    }
  }
}

exportNotas()