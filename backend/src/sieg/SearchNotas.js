const axios = require('axios')

const searchNotas = (cnpj, typeCNPJ, typeNF, dateInicial, dateFinal, skip=0) => {
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

module.exports.searchNotas = searchNotas