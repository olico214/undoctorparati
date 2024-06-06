require("dotenv").config();
const pool = require("../../connection/db_connection.cjs");
const ciudad = process.env.city;

async function getCity() {
  const connection = await pool.getConnection();
  try {
    const sql = "Select city from place";

    const [rows, fields] = await connection.query(sql);

    console.log(rows);
    console.log(fields);
    return rows
  } catch (err) {
    console.log(err);
  }
}

async function getEspecialidades() {
  const connection = await pool.getConnection();
  try {
    const sql =
      "SELECT DISTINCT(especialidad) FROM DocInformation WHERE city = ? and estatus = 0 and botActive = 0 ORDER BY especialidad ASC;";
    const [rows, fields] = await connection.query(sql, [ciudad]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

async function getDoctor(info) {
  const connection = await pool.getConnection();
  let rows, fields;

  try {
    const regexNumber = /^\d+$/; // Expresión regular para verificar si es un número

    if (regexNumber.test(info)) {
      // Si info es un número
      const sql =
        "SELECT t0.id as docID, t0.especialidad, t0.SubEspecialidad, t0.nameDoc,t0.prefijo, t1.* FROM `DocInformation` t0 INNER JOIN consultorios t1 ON t0.id = t1.idDoc WHERE t0.id=? AND t0.estatus = 0 AND t0.botActive = 0 ORDER BY fecharegister ASC";
      [rows, fields] = await connection.query(sql, [info]);
    } else {
      // Si info no es un número
      const sql =
        "SELECT t0.id as docID, t0.especialidad, t0.SubEspecialidad, t0.nameDoc,t0.prefijo, t1.* FROM `DocInformation` t0 INNER JOIN consultorios t1 ON t0.id = t1.idDoc WHERE t0.city = ? AND t0.especialidad = ? AND t0.estatus = 0 AND t0.botActive = 0 ORDER BY fecharegister ASC";
      [rows, fields] = await connection.query(sql, [ciudad, info]);
    }

    // Mapear los resultados en un objeto JSON
    const doctorsMap = new Map(); // Usar un mapa para agrupar consultorios por doctor

    rows.forEach((row) => {
      const doctorID = row.docID;
      // Verificar si ya hemos encontrado este doctor antes
      if (!doctorsMap.has(doctorID)) {
        // Si es un doctor nuevo, inicializar su información
        doctorsMap.set(doctorID, {
          docID: row.docID,
          especialidad: row.especialidad,
          SubEspecialidad: row.SubEspecialidad,
          nameDoc: row.nameDoc,
          prefijo: row.prefijo,
          consultorios: [],
        });
      }
      // Agregar el consultorio al doctor correspondiente
      doctorsMap.get(doctorID).consultorios.push({
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
        notes: row.notes,
      });
    });

    // Convertir el mapa a un array para retornar
    const doctors = Array.from(doctorsMap.values());

    return doctors;
  } catch (err) {
    console.log(err);
    return []; // Devolver un array vacío si hay un error
  } finally {
    connection.release(); // Liberar la conexión cuando hayamos terminado
  }
}

async function getConsultorios(id) {
  const connection = await pool.getConnection();
  try {
    const sql =
      "SELECT t0.nameDoc, t0.especialidad, t0.SubEspecialidad,t0.prefijo, t1.* FROM `DocInformation` t0 INNER JOIN consultorios t1 on t0.id = t1.idDoc WHERE t1.idDoc = ? ";
    const [rows, fields] = await connection.query(sql, [id]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

async function saveName(data) {
  const { name, phone } = data;

  const connection = await pool.getConnection();
  try {
    const sql = "UPDATE TelData SET name = ? WHERE phone = ?";
    const [rows, fields] = await connection.query(sql, [name, phone]);
    console.log(rows);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

async function saveinfofinal(data) {
  const { doc, consultorio, motivo, email, telID, city } = data;

  const newDate = new Date();

  // Formatear la fecha como 'YYYY-MM-DD'
  const formattedDate = newDate.toISOString().split("T")[0];

  const connection = await pool.getConnection();
  try {
    const sql =
      "INSERT INTO consultas (doctor, motivo, fecha, email, telID, city, consultorio) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const [rows, fields] = await connection.query(sql, [
      doc,
      motivo,
      formattedDate,
      email,
      telID,
      city,
      consultorio,
    ]);

    return rows;
  } catch (err) {
    console.log(err);
  }
}

async function getinfoFinal(id) {
  const connection = await pool.getConnection();
  try {
    const sql =
      "select * from consultorios t0 INNER JOIN DocInformation t1 on t0.idDoc = t1.id where t0.id = ?";
    const [rows, fields] = await connection.query(sql, [id]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

async function savespecity(data) {
  const { ciudad, especialidad } = data;
  const newDate = new Date();

  // Formatear la fecha como 'YYYY-MM-DD'
  const formattedDate = newDate.toISOString().split("T")[0];

  const connection = await pool.getConnection();
  try {
    const sql =
      "INSERT INTO datacity (city, especialidad, date) VALUES (?, ?, ?)";
    const [rows, fields] = await connection.query(sql, [
      ciudad,
      especialidad,
      formattedDate,
    ]);
    console.log(rows);
    return rows;
  } catch (err) {
    console.log(err);
    return null;
  } finally {
    connection.release();
  }
}

async function savePhone(phone) {
  const connection = await pool.getConnection();
  try {
    const sql = "INSERT INTO TelData (phone) VALUES (?)";
    const [rows, fields] = await connection.query(sql, [phone]);
    console.log(rows);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

async function findPhone(phone) {
  const connection = await pool.getConnection();
  try {
    const sql = "SELECT * FROM TelData WHERE phone = ?";
    const [rows, fields] = await connection.query(sql, [phone]);
    console.log(rows);
    return rows;
  } catch (err) {
    console.log(err);
    return null;
  } finally {
    connection.release();
  }
}

async function getPalabraClave(clave) {
  const connection = await pool.getConnection();
  try {
    const sql = "Select * from DocInformation where lookup = ?";
    const [rows, fields] = await connection.query(sql, [clave]);

    return rows;
  } catch (err) {
    console.log(err);
    return null;
  } finally {
    connection.release();
  }
}

async function getCiudadEspe(clave) {
  const connection = await pool.getConnection();
  try {
    const sql = "Select * from busqueda_Ciudades where Hastag = ?";
    const [rows, fields] = await connection.query(sql, [clave]);

    return rows;
  } catch (err) {
    console.log(err);
    return null;
  } finally {
    connection.release();
  }
}

module.exports = {
  getCity,
  getEspecialidades,
  getDoctor,
  getConsultorios,
  saveName,
  saveinfofinal,
  getinfoFinal,
  savespecity,
  savePhone,
  findPhone,
  getPalabraClave,
  getCiudadEspe,
};
