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
            sql = (f"SELECT codi_emp, nome_emp, cgce_emp, stat_emp, dina_emp "
                    f"FROM bethadba.geempre "
                    f"WHERE cgce_emp IN ('03457169000163', '04605182000185')"
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


