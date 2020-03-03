const fs = require('fs');
const xmljs = require('xml-js')
const path = require('path')
const util = require('./Util')
const createPasteToSaveXMLs = require('./CreatePasteToSaveXML')
const searchNotas = require('./SearchNotas')
const createObjSkip = require('./CreateObjSkip')

// define the way to read companies
let wayCompanies = `${path.join(__dirname, '../..')}\\exportData\\companies.json`
const companiesValues = require(wayCompanies)

// define the way to read skips, which will identify which last processing was stopped
let skipValues = []
let waySkip = `${path.join(__dirname, '../..')}\\exportData\\skips-${process.argv[2]}-${process.argv[3]}.json`
if(!fs.existsSync(waySkip)){
  fs.writeFileSync(waySkip, JSON.stringify(skipValues))
}
skipValues = require(waySkip)

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
// monthsOfYear = [7,8,9,10,11,12]

// execute export xmls
const exportNotas = async (typeCNPJ=process.argv[2], typeNF=process.argv[3]) => {

  let wayMain = util.wayMainToSaveXML
  let wayLog = util.wayToSaveLog

  if(typeCNPJ == "cnpjEmit"){
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

        try {
          let filterCompanie = skipValues.filter(companieFilter => companieFilter.codi_emp == companie.codi_emp)
          let filterMonthYear = filterCompanie.map(companieFilter => companieFilter.valuesCompetencia)[0].filter(monthYear => monthYear.year == year && monthYear.month == month)
          let filterSkip = filterMonthYear.map(monthYear => monthYear.valuesForFilterSkip)[0].filter(filterSkip => filterSkip.typeCNPJ == typeCNPJ && filterSkip.typeNF == typeNF)
          skip = filterSkip[0].skip
          lengthNotas = filterSkip[0].lengthNotas
        } catch (error) {
          skip = undefined
        }

        if(skip == undefined){
            skip = 0
            lengthNotas = 0
        }

        while(true){

          try {
            const notas = await searchNotas.searchNotas(companie.cgce_emp, typeCNPJ, typeNF, dateInitialFormatted, dateEndFormatted, skip)

            // analista se os xmls já não foram exportados
            if(notas.length >= 1 && notas.length < 50){
              if(notas.length == lengthNotas){
                let textShow = `* No skip ${skip} não há nenhuma nota ** NOVA ** do mês ${year}-${util.zeroLeft(month)} para empresa ${companie.codi_emp} - ${companie.nome_emp} - CNPJ ${companie.cgce_emp} / Tipo ${typeNF}-${typeCNPJ}`
                console.log(textShow)
                fs.writeFileSync(`${wayLog}\\${companie.codi_emp}-${year}-${util.zeroLeft(month)}-${skip}-nonova${typeNF}.csv`, textShow)
                break
              }
            }

            //  generates only when exists NFs in the month
            if (notas.length >= 1) {
              fs.writeFileSync(`${wayLog}\\${companie.codi_emp}-${year}-${util.zeroLeft(month)}-${skip}-ok${typeNF}.csv`, `Codigo Empresa;Nome Empresa;CNPJ Empresa;Mes-Ano;Chave NF-e;Tipo CNPJ Busca;Tipo Nota Busca\n`)
            
              let wayToSaveXML = createPasteToSaveXMLs.createPasteToSaveXML(wayMain, companie.nome_emp, companie.codi_emp, year, util.zeroLeft(month), forderTypeCNPJ, folderTypeNF)
      
              notas.forEach( (nota, indice) => {
                let xmlDecode = new Buffer(nota, 'base64').toString('ascii');
                xmlToJson = JSON.parse(xmljs.xml2json(xmlDecode))
                
                let keyNF = xmlToJson.elements[0].elements[0].elements[0].attributes.Id
                
                fs.writeFileSync(`${wayToSaveXML}\\${keyNF}.xml`, xmlDecode, 'utf8')

                console.log(`* Exportando skip ${skip} - nota ${util.zeroLeft(indice+1)}/${util.zeroLeft(notas.length)}: ${keyNF} do mês ${year}-${util.zeroLeft(month)} para empresa ${companie.codi_emp} - ${companie.nome_emp} - CNPJ ${companie.cgce_emp} / Tipo ${typeNF}-${typeCNPJ}`)
                
                fs.appendFileSync(`${wayLog}\\${companie.codi_emp}-${year}-${util.zeroLeft(month)}-${skip}-ok${typeNF}.csv`, `${companie.codi_emp};${companie.nome_emp};${companie.cgce_emp};${util.zeroLeft(month)}-${year};${keyNF};${typeCNPJ};${typeNF}\n`)
              })

              createObjSkip.createObjSkip(skipValues, companie.codi_emp, year, month, typeCNPJ, typeNF, skip, notas.length)
              fs.writeFileSync(waySkip, JSON.stringify(skipValues)/*, error => {
                if(error){
                  console.log('* Não foi possível atualizar o arquivo skips.json')
                }
              }*/)
              
              if(notas.length < 50){
                break
              }

              skip++
            } else {
              let textShow = `* No skip ${skip} não há nenhuma nota do mês ${year}-${util.zeroLeft(month)} para empresa ${companie.codi_emp} - ${companie.nome_emp} - CNPJ ${companie.cgce_emp} / Tipo ${typeNF}-${typeCNPJ}`
              console.log(textShow)
              fs.writeFileSync(`${wayLog}\\${companie.codi_emp}-${year}-${util.zeroLeft(month)}-${skip}-no${typeNF}.csv`, textShow)
              break
            }
          } catch (error) {
            let textShow = `* Erro no mês ${year}-${util.zeroLeft(month)} para empresa ${companie.codi_emp} - ${companie.nome_emp} - CNPJ ${companie.cgce_emp} / Tipo ${typeNF}-${typeCNPJ} --> ${error}`
            console.log(textShow)
            fs.writeFileSync(`${wayLog}\\${companie.codi_emp}-${year}-${util.zeroLeft(month)}-${skip}-error${typeNF}.csv`, textShow)
            break
          }
        }
      }
    }
  }
}

// exportNotas()

function loopExportNotas(){
  return new Promise((resolve, reject) => {
      setTimeout( async () => {
        try {
          resolve(await exportNotas())
          setTimeout(loopExportNotas)
        } catch (error) {
          reject('* Erro no loop de exportação das notas')
          // mesmo com o erro vai tentar executar novamente
          setTimeout(loopExportNotas)
        }
      });
  })
}

const execExportNotas = async () => {
  await loopExportNotas()
}

execExportNotas()