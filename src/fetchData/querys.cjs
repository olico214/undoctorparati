require('dotenv').config();
const pool = require('../../connection/db_connection.cjs');
const ciudad = process.env.city




async function getCity() {
    const connection = await pool.getConnection();
    try {
        const sql = 'Select city from place';
      
        const [rows, fields] = await connection.query(sql);
      
        console.log(rows);
        console.log(fields);
      } catch (err) {
        console.log(err);
      }
    
  }


  async function getEspecialidades() {
    const connection = await pool.getConnection();
    try {
        const sql = 'SELECT DISTINCT(especialidad) FROM DocInformation WHERE city = ? and estatus = 0 and botActive = 0 ORDER BY especialidad ASC;';
        const [rows, fields] = await connection.query(sql,[ciudad]);
        return rows
      } catch (err) {
        console.log(err);
      }
    
  }
  

  async function getDoctor(espe) {
    const connection = await pool.getConnection();
    try {
      const sql = 'SELECT t0.id as docID, t0.especialidad, t0.SubEspecialidad, t0.nameDoc,t0.prefijo, t1.* FROM `DocInformation` t0 INNER JOIN consultorios t1 ON t0.id = t1.idDoc WHERE t0.city = ? AND t0.especialidad = ? AND t0.estatus = 0 AND t0.botActive = 0 ORDER BY fecharegister ASC';
      const [rows, fields] = await connection.query(sql, [ciudad, espe]);
      
  
      // Mapear los resultados en un objeto JSON
      const doctors = rows.map((row) => ({
        docID: row.docID,
        especialidad: row.especialidad,
        SubEspecialidad: row.SubEspecialidad,
        nameDoc: row.nameDoc,
        consultorios: {
          id: row.id,
          idDoc: row.idDoc,
          hosp: row.hosp,
          dir: row.dir,
          mapa: row.mapa,
          nombreasis: row.nombreasis,
          telConsu: row.telConsu,
          whatsconsu: row.whatsconsu,
          costo: row.costo,
          uber: row.uber,
          horario: row.horario,
          nameGroup: row.nameGroup,
          urlGroup: row.urlGroup,
          notes: row.notes
        }
      }));

      return doctors;
    } catch (err) {
      console.log(err);
      return []; // Devolver un array vacío si hay un error
    } finally {
      connection.release(); // Liberar la conexión cuando hayamos terminado
    }
  }
  

  module.exports ={getCity,getEspecialidades,getDoctor};