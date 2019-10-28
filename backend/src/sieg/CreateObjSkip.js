let skipValues = []

function createObjSkip(skipValues = [], codi_emp, year, month, typeCNPJ, typeNF, skip, length){

    // filtra a empresa pra ver se vai precisar adicionar uma nova estrutura no JSON ou não, caso a empresa não exita cai no else e adiciona a empresa nova
    let existsCompanie = skipValues.filter(value => value.codi_emp == codi_emp)
    if(existsCompanie.length > 0){
        // se a empresa já existe, pega o primeiro registro encontrado
        let objSkip = existsCompanie[0]

        // faz a mesma lógica da empresa, mas agora pra competência (mes e ano), se não existir cai no else e adiciona um novo. Se já existir utiliza ele
        let existsPeriod = objSkip.valuesCompetencia.filter(value => value.year == year && value.month == month)
        if(existsPeriod.length > 0){
            // faz a mesma lógica do período mas selecionando o tipo do CNPJ e NF, se não existir cai no else e adiciona um novo (push). Se já existir SUBSTITUI os valores dele
            let existsTypeCNPJAndNF = existsPeriod[0].valuesForFilterSkip.filter(value => value.typeCNPJ == typeCNPJ && value.typeNF == typeNF)
            // console.log(existsTypeCNPJAndNF)
            if(existsTypeCNPJAndNF.length > 0){
                existsPeriod[0].valuesForFilterSkip.pop()
                existsPeriod[0].valuesForFilterSkip.push({
                    typeCNPJ: typeCNPJ,
                    typeNF: typeNF,
                    skip: skip,
                    lengthNotas: length
                })
            } else {
                existsPeriod[0].valuesForFilterSkip.push(
                    {
                        typeCNPJ: typeCNPJ,
                        typeNF: typeNF,
                        skip: skip,
                        lengthNotas: length
                    }
                )
            }
        } else {
            // quando não existe o período, adiciona um novo no array
            objSkip.valuesCompetencia.push(
                {
                    year: year,
                    month: month,
                    valuesForFilterSkip: [
                        {
                            typeCNPJ: typeCNPJ,
                            typeNF: typeNF,
                            skip: skip,
                            lengthNotas: length
                        }
                    ]
                }
            )
        }
    } else {
        skipValues.push(
            {
                codi_emp: codi_emp,
                valuesCompetencia:[
                    {
                        year: year,
                        month: month,
                        valuesForFilterSkip: [
                            {
                                typeCNPJ: typeCNPJ,
                                typeNF: typeNF,
                                skip: skip,
                                lengthNotas: length
                            }
                        ]
                    }
                ]
            }
        )
    }

    return skipValues
}

module.exports.createObjSkip = createObjSkip

// ------------- objetos adicionados manualmente pra teste
// createObjSkip(skipValues, 1, 2019, 10, "cnpjDest", "nfe", 1, 20)
// createObjSkip( skipValues,1, 2019, 10, "cnpjDest", "nfe", 0, 17)
// createObjSkip(skipValues, 1, 2019, 10, "cnpjDest", "nfe", 2, 19)
// createObjSkip(skipValues, 1, 2019, 9, "cnpjDest", "cte", 0, 20)
// createObjSkip(skipValues, 1, 2019, 9, "cnpjDest", "nfe", 0, 15)
// createObjSkip(skipValues, 1, 2019, 9, "cnpjDest", "nfe", 0, 18)
// createObjSkip(skipValues, 2, 2019, 9, "cnpjDest", "nfe", 0, 17)

// console.log(JSON.stringify(skipValues, undefined, 4))

// const filterCompanie = skipValues.filter(companieFilter => companieFilter.codi_emp == 1)
// const filterMonthYear = filterCompanie.map(companieFilter => companieFilter.valuesCompetencia)[0].filter(monthYear => monthYear.year == 2019 && monthYear.month == 10)
// const filterSkip = filterMonthYear.map(monthYear => monthYear.valuesForFilterSkip)[0].filter(filterSkip => filterSkip.typeCNPJ == 'cnpjDest' && filterSkip.typeNF == 'nfe')
// skip = filterSkip[0].skip
// console.log( skip )

// ------------ valores declarado manualmente pra testes
// skipValues = 
// [
//     {
//         codi_emp: 1,
//         valuesCompetencia: [
//             {
//                 year: 2019,
//                 month: 10,
//                 valuesForFilterSkip: [
//                     {
//                         typeCNPJ: 'cnpjDest',
//                         typeNF: 'nfe',
//                         skip: 0,
//                         lengthNotas: 50
//                     }
//                 ]
//             },
//             {
//                 year: 2019,
//                 month: 10,
//                 valuesForFilterSkip: [
//                     {
//                         typeCNPJ: 'cnpjDest',
//                         typeNF: 'cte',
//                         skip: 1,
//                         lengthNotas: 50
//                     }
//                 ]
//             }]
//     },
//     {
//         codi_emp: 2,
//         valuesCompetencia: [
//             {
//                 year: 2019,
//                 month: 10,
//                 valuesForFilterSkip: [
//                     {
//                         typeCNPJ: 'cnpjDest',
//                         typeNF: 'nfe',
//                         skip: 3,
//                         lengthNotas: 30
//                     }
//                 ]
//             },
//             {
//                 year: 2018,
//                 month: 10,
//                 valuesForFilterSkip: [
//                     {
//                         typeCNPJ: 'cnpjEmit',
//                         typeNF: 'nfe',
//                         skip: 2,
//                         lengthNotas: 25
//                     }
//                 ]
//             }]
//     },
// ]