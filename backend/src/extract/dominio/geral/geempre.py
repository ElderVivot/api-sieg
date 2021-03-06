import pandas as pd
import pyodbc
from db.ConexaoBanco import DB

class extractGeempre():
    def __init__(self):
        self._DB = DB()
        self._connection = self._DB.getConnection()
        self._cursor = None
        self._wayToSave = 'C:\\Programming\\api-sieg\\backend\\exportData\\companies.json'
        self._data = []
        self._columns = []
        self._dataExport = {}

    def exportaDados(self):
        try:
            self._cursor = self._connection.cursor()
            sql = (f"SELECT codi_emp, nome_emp, cgce_emp, stat_emp, tins_emp, dina_emp "
                    f"FROM bethadba.geempre "
                    f"WHERE /*codi_emp IN (1,1403,1444) "
                    f"  AND ( dina_emp >= YMD(year(today()), month(today())-5, 1) OR ( stat_emp NOT IN ('I') ) )"
                    f"  AND*/ tins_emp IN (1,2)"
                    f"  AND cgce_emp IS NOT NULL"
                    f"  AND TRIM( COALESCE(cgce_emp, '')) <> '' "
                    f"ORDER BY codi_emp")
            self._cursor.execute(sql)

            row = self._cursor.fetchone()
            for t in row.cursor_description:
                self._columns.append(t[0])

            df = pd.read_sql_query(sql, self._connection)

            for column in self._columns:
                if df[column].dtype == 'int64':
                    df[column] = df[column].astype('int64')
                elif df[column].dtype == 'float64':
                    df[column] = df[column].astype('float64')
                else:
                    df[column] = df[column].astype(str).str.replace('\\r\\n', '')
                    df[column] = df[column].replace('\\n', '').replace('\\r', '').replace('\\t', '')

            df.to_json(self._wayToSave, orient='records')
        except Exception as e:
            print(f"Erro ao executar a consulta. O erro é: {e}")
        finally:
            if self._cursor is not None:
                self._cursor.close()
            self._DB.closeConnection()


if __name__ == "__main__":
    geempre = extractGeempre()
    geempre.exportData()


