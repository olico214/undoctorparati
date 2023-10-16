const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const axios = require('axios')
const { EVENTS } = require('@bot-whatsapp/bot')

const city = 'Guadalajara' 



const flowMostrainformacionDoctor  = addKeyword('infoDoctor').addAction(async(ctx,{flowDynamic,endFlow,state,provider})=>{
const datosPaciente = state.getMyState()
const consultorio = datosPaciente.consultorio;
let msgPX =""
const namePX =`Hola! ${datosPaciente.nombrePaciente}`
msgPX += `${namePX}\n\n`
const nameDoc = consultorio[7]
msgPX += `Tu cita con el Dr(a). ${nameDoc} ha sido registrada. Aquí tienes los detalles:\n\n`
const especialidad = consultorio[8]
msgPX += `🩺 Especialidad: ${especialidad}\n`
msgPX += `👨‍⚕️ Doctor: Dr(a). ${nameDoc}\n`
const motivoconsulta =datosPaciente.motivo
msgPX += `⚕ Motivo de consulta: ${motivoconsulta}\n`
const telDoc =consultorio[0]
msgPX += `📞 Teléfono del Doctor: ${telDoc}\n`
const ubicacion =consultorio[2]
msgPX += `📍 Ubicación: ${ubicacion}\n`
const mapa =consultorio[3];
msgPX += `🗺️ Mapa: ${mapa}\n\n`
msgPX += `Por favor, no olvides llegar con 10 minutos de anticipación. Si tienes alguna pregunta o necesitas cambiar la cita, no dudes en comunicarte.`


flowDynamic({body:msgPX})

let telwhats = consultorio[6]

let msgDoc = ""

msgDoc+= `Hola Dr(a). ${nameDoc} 👋\n\n`
msgDoc+= `Hemos recibido un nuevo registro con los siguientes detalles:\n\n`
msgDoc+=`😷 Nombre Paciente: ${datosPaciente.nombrePaciente}\n`
msgDoc+=`⚕ Motivo de consulta: ${motivoconsulta}\n`
const tel = datosPaciente.telefono
msgDoc+= `📞 Teléfono Paciente: ${tel}\n\n`
msgDoc+= `Por favor, contactarse con el paciente.`

await provider.sendText(`521${telwhats}@s.whatsapp.net`, msgDoc)

})

const flowValidate = addKeyword('validate').addAction((ctx,{flowDynamic,gotoFlow,endFlow,state})=>{
  const estatus = state.getMyState()
  let correo = "";

  if(estatus.email == 0 ){
    correo = "Sin Correo"
  }else{
    correo = estatus.email;
  }

  state.update({email:correo})
  flowDynamic({body:`Motivo:${estatus.motivo}\nNombre Paciente: ${estatus.nombrePaciente}\nCorreo: (${correo})`})
})
.addAnswer('¿La informacion anterior es correcta?\n\n1️⃣ SI\n2️⃣ NO\n3️⃣ *Menu Principal*',{capture:true},async(ctx,{gotoFlow})=>{
  if(ctx.body === '2'){

    return gotoFlow(flowGetDataPaciente)
  }else if(ctx.body == "3"){
    return gotoFlow(flowMenu)
  }else{
    return gotoFlow(flowMostrainformacionDoctor)
  }
  
})


const flowEmail = addKeyword('emailpaciente').addAnswer('✉️  *¿Dime cual es tu email?*\n\n "0"(Cero) si no cuentas con correo\n\n*Menu* para Regresar al inicio',{capture:true},async(ctx,{flowDynamic,gotoFlow,endFlow,state})=>{
  let seleccion = ctx.body;
  const lowerseleccion = seleccion.toLowerCase()
  if(lowerseleccion == 'menu' || lowerseleccion == 'menú'){
    return gotoFlow(flowMenu)
  }else{
    await state.update({email:ctx.body})
  return gotoFlow(flowValidate)
  }
  
})


const flowGetDataPaciente = addKeyword('getData').addAnswer(
  'Para brindarte la información que solicitas\n\n🩺 *¿Dime cual es el motivo de tu consulta?*\n\n*Menu* para Regresar al inicio',{capture:true},async(ctx,{flowDynamic,endFlow,gotoFlow,state})=>{
    let seleccion = ctx.body;
    const lowerseleccion = seleccion.toLowerCase()
    if(lowerseleccion == 'menu' || lowerseleccion == 'menú'){
      return gotoFlow(flowMenu)
    }else{
      await state.update({motivo:ctx.body})

      const nombrepx = state.getMyState()
      if(!nombrepx.nombrePaciente){
        gotoFlow(flowNombrePaciente)
      }else{
        return gotoFlow(flowEmail)
      }
      
    }
    

})



let selecciodeClinicas = []
const flowConsultorios = addKeyword('getConsultorios').addAction(async(ctx,{flowDynamic,endFlow,gotoFlow,state})=>{
  const datosPaciente = state.getMyState()

  const clinica = datosPaciente.doctor;

  const DireccionConsultorios = clinica.DireccionConsultorios;
  const hospital = clinica.hospital;
  const mapa = clinica.mapaGoogle;
  
  
  const direccion = DireccionConsultorios.split('--')
  const hospitalSplit = hospital.split('--')
  const mapaSplit = mapa.split('--')

  let telParallamadas=clinica.telParallamadas;
  let horario=clinica.horarios;
  let precioConsulta=clinica.precioConsulta;
  let telwhats=clinica.telwhatsapp;
  let name = clinica.name;
  let especialidadBuscada = clinica.especialidadBuscada

  

  let ajuste = "";
  ajuste += ``
  for(let i = 0 ;i<hospitalSplit.length;i++){
    let indice = 1 +i;
    ajuste += `\n\n🏥${indice} -> ${hospitalSplit[i]}\n${direccion[i]}\n\n`
    selecciodeClinicas.push([indice,hospitalSplit[i],direccion[i],mapaSplit[i],telParallamadas,horario,precioConsulta,telwhats,name,especialidadBuscada])
  }
  
await flowDynamic({body:ajuste})

})



.addAnswer('Seleccione una clinica por favor:',{capture:true},async(ctx,{fallBack,state,gotoFlow})=>{
  const seleccion = ctx.body;

let estado = true

  for(let i = 0;i<selecciodeClinicas.length;i++){
  if(selecciodeClinicas[i][0] == seleccion){
      

    await state.update({consultorio: [selecciodeClinicas[i][4],selecciodeClinicas[i][1],selecciodeClinicas[i][2],selecciodeClinicas[i][3],selecciodeClinicas[i][5],selecciodeClinicas[i][6],selecciodeClinicas[i][7],selecciodeClinicas[i][8]]})
    estado = false
    break
  }
}

  return gotoFlow(flowGetDataPaciente)


})
//Fin obtener Datos de pacientes///////////////////



//Inicio obtener especialistas lista de especialidad///////////////////



async function getDoctor(es, city) {
  try {
    const apiUrl = `https://undoctorparami.com/api/get/getDoctors.php?ciudad=${city}&especialidad=${es}`;
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error('Error al consultar la API:', error);
  }
}


  // Array para almacenar los datos de los médicos
let doctors = [];
const flowEspecialistas = addKeyword('especialista').addAction(async(ctx,{flowDynamic,endFlow,gotoFlow,state})=>{
  const myState = state.getMyState()
  const es = myState.especialidad
  const doctores = await getDoctor(es,city)
  console.log(es)


  if(doctores.message =='Sin resultados'){
    await flowDynamic({body:'Lo sentimos, no contamos con doctores de esa especialidad.'})

  }else{
    let especial = `👩🏻‍⚕‍ 👨🏻‍⚕‍ Tenemos a los siguientes ${es}:\n\n`;
  especial += `👉  Escribe el código (las letras en negritas y minúsculas,  Ej. *1* ) del médico para ver su información y poder agendar tu cita:\n\n\n`
// Itera a través de los datos de los médicos
for (let i = 0; i < doctores.length; i++) {
  const doctor = doctores[i];
  const indice = i + 1;

  // Agrega los datos del médico al array
  doctors.push({
    name: doctor.nameDoc,
    especialidad: doctor.EspecialidadCompleta,
    subEspecialidad: doctor.SubEspecialidad,
    hospital: doctor.HospitalTorre,
    DireccionConsultorios: doctor.DireccionConsultorios,
    id:doctor.idDoc,
    idSeleccion :indice,
    mapaGoogle:doctor.MapaGoogle,
    horarios:doctor.HorarioConsulta,
    precioConsulta:doctor.CostoConsulta,
    telParallamadas : doctor.telRecepcion,
    telwhatsapp	 : doctor.telwhatsapp,
    especialidadBuscada: es
    
  });

  // Agrega una línea al mensaje a mostrar
  especial += `\n\n🩺 » *${indice}*: ${doctor.nameDoc}\n${doctor.EspecialidadCompleta} - ${doctor.HospitalTorre}\n\n`;
}
await flowDynamic({ body:especial });
await state.update({ doctor: ""});
  }
  
})
.addAnswer('Selecciona un Doctor:',{capture:true},async(ctx,{flowDynamic,state,gotoFlow})=>{
  const idvalue= ctx.body
  let namDoc = "";
  let subEspecialidad = "";
  let hospital = "";
  let mapagoogle = "";
  let horario = "";
  let  precioConsulta ="";
  let telParallamadas = "";
  let telwhats = "";
  let especialidadBuscada = ""

  for (let j = 0; j < doctors.length; j++) {
    if (doctors[j].idSeleccion == idvalue) {
      await state.update({ doctor: doctors[j]});
      hospital = doctors[j].hospital
      dirConsultorio = doctors[j].DireccionConsultorios
      namDoc = doctors[j].name;
      subEspecialidad = doctors[j].subEspecialidad;
      mapagoogle = doctors[j].mapaGoogle;
      horario = doctors[j].horarios;
      precioConsulta =doctors[j].precioConsulta; 
      telParallamadas = doctors[j].telParallamadas;
      telwhats = doctors[j].telwhatsapp;
      especialidadBuscada = doctors[j].especialidadBuscada;

      
      break; // Sal del bucle cuando se encuentra el médico
    }
  }

const estado = state.getMyState()

doctors=[]

if(estado.doctor=='' || !estado.doctor){
  return gotoFlow(flowMenu)
}else{
  await flowDynamic({body:`👌 Hola!, Soy la asistente virtual del Dr(a). ${namDoc} » ${subEspecialidad}. `})
  if(hospital.includes('--')){
    return gotoFlow(flowConsultorios)
  }
  await state.update({consultorio: [telParallamadas,hospital,dirConsultorio,mapagoogle,horario,precioConsulta,telwhats,namDoc,especialidadBuscada]})
  return gotoFlow(flowGetDataPaciente)
}

  

})









//Fin obtener especialistas lista de especialidad///////////////////


//Flujo para obtener las especialidades/////////////////////////////

const dataEspecialidades = {};
let nombresEspecialidades = [];

async function getData(city) {
  try {

    const apiUrl = `https://undoctorparami.com/api/get/getSpecialist.php?city=${city}`;
    const response = await axios.get(apiUrl);
    const especialidades = response.data;

    for (const especialidad of especialidades) {
      nombresEspecialidades.push(especialidad.especialidad);
    }
  } catch (error) {
    console.error('Error al consultar la API:', error);
  }
}

// Llama a getData solo una vez al inicio para llenar nombresEspecialidades
getData(city);

const flowEspecialidad = addKeyword('especialidad1').addAction(async (ctx, { flowDynamic }) => {
  const especialidades = {};
  let especial = "";

  nombresEspecialidades.forEach((nombreEspecialidad, index) => {
    especialidades[`${index + 1}`] = nombreEspecialidad;
    dataEspecialidades[`${index + 1}`] = nombreEspecialidad;
    let i = index + 1;
    especial += `⭐️ » ${i}: ${nombreEspecialidad}\n`;
  });

  await flowDynamic({
    body: '¡Genial!\n_Por favor escribe el número de especialista que necesitas/deseas conocer y a continuación te presentaremos un menú con los mejores en esa especialidad_\n\n para regresar al menú principal escribe *Menu*',
  });

  await flowDynamic({ body: especial });

})
  .addAnswer("Escribe el especialista a continuación:", { capture: true }, async (ctx, {state, flowDynamic, fallBack, gotoFlow, endFlow }) => {

    const valorBuscado = ctx.body;
    const evaluate = valorBuscado.toLowerCase();


    if (evaluate === "menu" || evaluate === "menú") {
      return gotoFlow(flowMenu);
    }
    const myState = state.getMyState()

    

    for (let i = 0; i < nombresEspecialidades.length; i++) {
      const ban = (i + 1).toString();
      const cadena = nombresEspecialidades[i];

      if (valorBuscado === ban) {
        await state.update({especialidad:cadena})
        
        return gotoFlow(flowEspecialistas)
      }
    }
    

  });
//Fin de obtener especialidades/////////////////////////

async function findEspecilidad(city,es) {
  try {

    const apiUrl = `https://undoctorparami.com/api/get/findEspecialista.php?city=${city}&es=${es}`;
    const response = await axios.get(apiUrl);
    const especialidades = response.data;

    return especialidades;
  } catch (error) {
    console.error('Error al consultar la API:', error);
  }
}

const flowConfirmEspecialidad = addKeyword('ConfirmEspecialidad').addAnswer('1️⃣ SI\n2️⃣ NO',{capture:true},async (ctx,{flowDynamic,gotoFlow})=>{

  if(ctx.body == '1'){
    
      return gotoFlow(flowEspecialistas)
    
    
  }else{
    return gotoFlow(flowMenu)
  }
})

const flowMenu = addKeyword('Menu').addAction(async(ctx,{flowDynamic,state})=>{
  const nombrepx = state.getMyState()
  let name = "";
  try{
    if(!nombrepx.nombrePaciente){
      name = "Amigo"
    }else{
      name = nombrepx.nombrePaciente
    }
  }catch{
    name = 'Amigo'
  }
  

  await flowDynamic({body:`🤖 *¡Gracias! ${name}*\n\n» Puedes escribir 1️⃣ para conocer las especialidades que tenemos.\n
  » También puedes escribir la especialidad del médico que buscas ( Ejemplo: Cardiólogo, Ginecólogo, etc. )\n
  » Si eres médico especialista y te gustaría formar parte de este directorio por WhatsApp escribe el número 9️⃣\n\n
  *Escribe la opción que deseas*`})
})
  

.addAction( { capture: true }, async (ctx, { fallBack, flowDynamic, gotoFlow,state }) => {
    const seleccion = ctx.body;
    // Convierte la primera letra a mayúscula y el resto a minúscula
    const es = seleccion.charAt(0).toUpperCase() + seleccion.slice(1).toLowerCase();

    const phone = ctx.from;
    const tel = phone.slice(3);
    await state.update({telefono:tel})
    
    if (seleccion == '1') {
      
        return gotoFlow(flowEspecialidad);
      
      
    }else if(seleccion == '9'){

    }else{

      const result = await findEspecilidad(city,es)
      
      if(!result){
        await flowDynamic({body:`Por el momento no contamos con este tipo de especialista\n\nTe avisaremos cuando tengamos alguno disponible 😉\n\n
        〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\n\n¡Gracias por utilizar nuestro servicio!\n\n
        *Recuerda guardar este whatsapp para poder darte la información de los mejores especialistas en ${city}*\n\n
        ¡Te conectamos con los Doctores!\n\n             👩🏻‍⚕️ 👨🏻‍⚕️`})
        return fallBack()
      }else{

        await state.update({especialidad:result[0].especialidad})
        await flowDynamic({body:`¿Es correcta la Especialidad?\n\n*${result[0].especialidad}*`})

        
        
          return gotoFlow(flowConfirmEspecialidad)
        

        

      }
    }

  });


const flowBienvenida = addKeyword(EVENTS.WELCOME).addAction(async(ctx,{flowDynamic,gotoFlow,state})=>{
  const ciudad = 'Guadalajara'
  await flowDynamic({body:`💊  ¡Hola!  Soy la asistente virtual de undoctorparati.com en ${ciudad} y estoy disponible 24/7 para poder ayudarte\n\n〰️〰️〰️〰️〰️〰️〰️〰️〰️\n\n`+
  `🚫  Este WhatsApp, no es de urgencias\n\n`+
`🦾 Soy una asistente Virtual por WhatsApp con respuestas programadas\n\n`+
`🤳 Este es un servicio gratuito compártelo con quien creas que pueda necesitarlo,`+
` recuerda guardar este whatsapp para tener información de los mejores especialistas en tu ciudad rápidamente sin instalar ninguna app.\n`})
  
  try{
    const nombrepx = state.getMyState()
    if(!nombrepx.nombrePaciente){
      
    }else{
      return gotoFlow(flowMenu)
    }
  }catch{
    return gotoFlow(flowNombrePaciente)
  }
      
  
})



const flowNombrePaciente = addKeyword('namepaciente').addAnswer('🤖 Para brindarte una mejor experiencia de atencion me gustaria saber ¿Cual es tu nombre?'+
'\n\nO si lo prefieres envía 1 para Ir al Menú Principal',{capture:true},async(ctx,{flowDynamic,gotoFlow,endFlow,state})=>{
  let seleccion = ctx.body;
  const lowerseleccion = seleccion.toLowerCase()
  if(lowerseleccion == '1'){
    return gotoFlow(flowMenu)
  }else{
    await state.update({nombrePaciente:ctx.body})
  }
  
  
})
.addAnswer('¿Es correcto el nombre?\n\n1️⃣ SI\n2️⃣ NO',{capture:true},(ctx,{flowDynamic,gotoFlow,state})=>{
if(ctx.body == '2'){
  return gotoFlow(flowNombrePaciente)
}else{
  const nombrepx = state.getMyState()
  if(nombrepx.email){
    return gotoFlow(flowEmail)
  }else{
    return gotoFlow(flowMenu)
  }
  
}
})
    
const flowRecibirMedia = addKeyword(EVENTS.MEDIA)
.addAnswer('Por el momento no puedo recibir archivos multimedia, escribeme por favor, una disculpa')

const flowLocation = addKeyword(EVENTS.LOCATION)
.addAnswer('Por el momento no puedo recibir archivos multimedia, escribeme por favor, una disculpa')

const flowNotaDeVoz = addKeyword(EVENTS.VOICE_NOTE)
.addAnswer('Por el momento no puedo recibir archivos multimedia, escribeme por favor, una disculpa')

const flowDocumento = addKeyword(EVENTS.DOCUMENT)
.addAnswer('Por el momento no puedo recibir archivos multimedia, escribeme por favor, una disculpa')


const main = async () => {
const adapterDB = new MockAdapter()
const adapterFlow = createFlow([flowBienvenida,flowRecibirMedia,flowLocation,flowNotaDeVoz,flowDocumento,
  flowMenu,flowEspecialidad,flowEspecialistas,flowGetDataPaciente,flowNombrePaciente,flowEmail,flowMostrainformacionDoctor,flowConsultorios,flowValidate,
  flowConfirmEspecialidad])
const adapterProvider = createProvider(BaileysProvider)

createBot({
flow: adapterFlow,
provider: adapterProvider,
database: adapterDB,
})

QRPortalWeb()
}

main()
