const shell = require('shelljs')

// console.log(process.argv[2])

shell.exec(`node ${__dirname}/ExportsNotas.js cnpjDest nfe`)
// shell.exec(`node ${__dirname}/ExportsNotas.js cnpjDest cte`)

// exportsNotas.exportNotas("cnpjDest", "nfe")
// exportsNotas.exportNotas("cnpjDest", "cte")