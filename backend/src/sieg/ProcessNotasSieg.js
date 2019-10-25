const fs = require('fs');
const axios = require('axios')
const xmljs = require('xml-js')


const zeroLeft = (valueInsert, countZeros=2) => {
  return ("0000".repeat(countZeros) + valueInsert).slice(-countZeros);
}

const daysInitialAndEndOfMonth = (month, year) => {
  const dateInitial = new Date(`${year}-${month}-01`)

  const dateEnd = new Date(`${year}-${month}-01`)
  dateEnd.setMonth(dateEnd.getMonth() + 1)
  dateEnd.setDate(dateEnd.getDate()-1)
  
  return{
    dateInitial: `${dateInitial.getFullYear()}-${zeroLeft(dateInitial.getMonth()+1)}-${zeroLeft(dateInitial.getDate())}`, 
    dateEnd: `${dateEnd.getFullYear()}-${zeroLeft(dateEnd.getMonth()+1)}-${zeroLeft(dateEnd.getDate())}`
  }
}

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

const searchNotas = (cnpj, typeCNPJ="cnpjDest", typeNF="nfe", dateInicial, dateFinal, skip=0) => {
  // JSON to connect API SIEG
  let jsonRequest = {
    "apikey": "49wxHodcRPiPcEqDQAJuQg==",
    "email": "erp@somacontabilidades.com.br",
    "xmltype": `${typeNF}`,
    "take": 50,
    "skip": skip,
    "dataInicio": `${dateInicial}`,
    "dataFim": `${dateFinal}`
  }

  if(typeCNPJ=="cnpjDest"){
    jsonRequest[typeCNPJ] = `${cnpj}`
  } else if(typeCNPJ=="cnpjEmit"){
    jsonRequest[typeCNPJ] = `${cnpj}`
  } else if(typeCNPJ=="cnpjRemet"){
    jsonRequest[typeCNPJ] = `${cnpj}`
  } else{
    jsonRequest["cnpjDest"] = `${cnpj}`
  }

  return new Promise( async (resolve, reject) => {
    try {
      const response = await axios.post('https://api.sieg.com/aws/api-xml-search.ashx', jsonRequest)
      const data = response.data.xmls
      resolve(data)
    } catch (error) {
      reject('Connection with link API recused')
    }
  })
}

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
const exportNotas = async () => {

  for(companie of companiesValues){

    // way base that will save xml
    let wayMain = 'C:\\temp\\notas-fiscais'
    let wayLog = 'C:\\temp\\notas-fiscais\\logs'

    for(year of yearsRead){

      if(year == dateActual.getFullYear()){
        monthsRead = monthsOfYear
      } else {
        monthsRead = allMonthsOfYear
      }

      for(month of monthsRead){

        let date = daysInitialAndEndOfMonth(month, year)
        let dateInitialFormatted = date.dateInitial
        let dateEndFormatted = date.dateEnd

        let skip = 0

        // exports NF-e of Entrada (cnpjDest)
        try {
          typeCNPJ = "cnpjDest"
          typeNF = "nfe"

          const notas = await searchNotas(companie.cgce_emp, typeCNPJ, typeNF, dateInitialFormatted, dateEndFormatted)

          //  generates only when exists NFes in the month
          if (notas.length >= 1) {
            fs.writeFileSync(`${wayLog}\\${companie.codi_emp}-${zeroLeft(month)}-${year}-${skip}-ok${typeNF}.csv`, `Codigo Empresa;Nome Empresa;CNPJ Empresa;Mes-Ano;Chave NF-e\n`)
          
            let wayToSaveXML = createPasteToSaveXML(wayMain, companie.nome_emp, companie.codi_emp, `${zeroLeft(month)}-${year}`, "Entradas", "NF-e")
    
            notas.forEach( (nota, indice) => {
              let xmlDecode = new Buffer(nota, 'base64').toString('ascii');
              xmlToJson = JSON.parse(xmljs.xml2json(xmlDecode))
              
              let keyNF = xmlToJson.elements[0].elements[0].elements[0].attributes.Id
              
              fs.writeFileSync(`${wayToSaveXML}\\${keyNF}.xml`, xmlDecode, 'utf8')

              console.log(`* Exportado ${indice+1}/${notas.length}: NF-e ${keyNF} do mês ${zeroLeft(month)}-${year} para empresa ${companie.codi_emp} - ${companie.nome_emp} - CNPJ ${companie.cgce_emp}`)
              
              fs.appendFileSync(`${wayLog}\\${companie.codi_emp}-${zeroLeft(month)}-${year}-${skip}-ok${typeNF}.csv`, `${companie.codi_emp};${companie.nome_emp};${companie.cgce_emp};${zeroLeft(month)}-${year};${keyNF}\n`)
          })
          } else {
            let textShow = `* Não há nenhuma nota do mês ${zeroLeft(month)}-${year} para empresa ${companie.codi_emp} - ${companie.nome_emp} - CNPJ ${companie.cgce_emp}`
            console.log(textShow)
            fs.writeFileSync(`${wayLog}\\${companie.codi_emp}-${zeroLeft(month)}-${year}-${skip}-no${typeNF}.csv`, textShow)
          }
        } catch (error) {
          let textShow = `* Erro para empresa ${companie.codi_emp} - ${companie.nome_emp} - CNPJ ${companie.cgce_emp} --> ${error}`
          console.log(textShow)
          fs.writeFileSync(`${wayLog}\\${companie.codi_emp}-${zeroLeft(month)}-${year}-${skip}-error${typeNF}.csv`, textShow)
        }
      }
    }
  }
}

exportNotas()