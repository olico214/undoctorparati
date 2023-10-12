const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const axios = require('axios')
const { EVENTS } = require('@bot-whatsapp/bot')




const doctor = {};



const dataEspecialidades = {};
let nombresEspecialidades = [];

async function getData() {

  try {
    const apiUrl = 'https://undoctorparami.com/api/get/getSpecialist.php';
    const response = await axios.get(apiUrl);
    const especialidades = response.data;
    
    for (const especialidad of especialidades) {
      nombresEspecialidades.push(especialidad.specialty);
    }
  } catch (error) {
    console.error('Error al consultar la API:', error);
  }
}

const flowEspecialidad = addKeyword('especialidad1').addAction(async (ctx, { flowDynamic, gotoFlow, fallBack }) => {
  await getData();
  const especialidades = {};
  let especial = "";
  const tel = ctx.from

  nombresEspecialidades.forEach((nombreEspecialidad, index) => {
    especialidades[`${index + 1}`] = nombreEspecialidad;
    dataEspecialidades[`${index + 1}`] = nombreEspecialidad
    let i = index + 1;
    especial += `⭐️ » ${i}: ${nombreEspecialidad}\n`; // Concatenar valores
  });
  nombresEspecialidades = [];
  paciente[tel] = { listEspecialidad: especial };
  await flowDynamic({ body: '¡Genial!\n_Por favor escribe el numero de especialista que necesitas/deseas conocer y a continuación te presentaremos un menú con los mejores en esa especialidad_\n\n para regresar al menu principal escribe *Menu*' });

  await flowDynamic({ body: especial });


})
.addAnswer("Escribe el especialista a continuación:",{capture:true},(ctx,{flowDynamic,gotoFlow})=>{
  const tel = ctx.from
  console.log(paciente[tel].listEspecialidad)
  for(let item in paciente[tel].listEspecialidad){
    console.log(paciente[tel].listEspecialidad)
  }
})




const paciente = {};
const flowMenu = addKeyword('Menu').addAnswer([
  `💥 Escribe 1️⃣ para conocer las especialidades que tenemos\n`,
  `🩺 Escribe el nombre del médico que necesitas (nombre y apellido - Ej. Doctor José Almeida - dr. José alvarado - dr José Almeida Alvarado )\n`,
  `🔅 Escribe la especialidad del médico ( Ejemplo: Cardiólogo, Ginecólogo, etc. )\n`,
  `☝️  Escribe Postularme  para formar parte de este Directorio Whatsapp\n\n`,
  `〰️〰️〰️〰️〰️〰️〰️〰️〰️\n\n`,
  `👉 📞 Si deseas agendar una cita por teléfono con algún médico\nLlama a este número  4775820455\n`,
  `⌚️ Nuestras agentes con gusto te atenderán en los siguientes horarios:\n*Lunes a Viernes*\n8:00 am - 8:00 pm\n`,
  `*Sábado*\n9:00 am - 3:00 pm\n`,
  `〰️〰️〰️〰️〰️〰️〰️〰️〰️`,
  ` www.undoctorparati.com`,
  ` ¡Te conectamos con los Doctores!`,

  
  
],{capture:true},(ctx,{fallBack,flowDynamic,gotoFlow})=>{
  const seleccion = ctx.body;
  const phone = ctx.from;
  const tel = phone.slice(3)
  if(!paciente[tel]){
    paciente[tel] = {}
  }
  paciente[tel].tel = tel
  paciente[tel].seleccion = seleccion
  console.log(paciente[tel])
  
  //flowDynamic({body:`Tu seleccion: ${seleccion} tu numero de telefono: ${phone} `})
  if(paciente[tel].seleccion == '1'){
    return gotoFlow(flowEspecialidad)
  }



})


const flowBienvenida = addKeyword(EVENTS.WELCOME).addAction(async(ctx,{flowDynamic,gotoFlow})=>{
  const ciudad = 'Guadalajara'
  await flowDynamic({body:`💊  ¡Hola!  Soy la asistente virtual de undoctorparati.com en ${ciudad} y estoy disponible 24/7 para poder ayudarte\n\n〰️〰️〰️〰️〰️〰️〰️〰️〰️\n\n`+
  `🚫  Este WhatsApp, no es de urgencias\n\n`+
`🦾 Soy una asistente Virtual por WhatsApp con respuestas programadas\n\n`+
`🤳 Este es un servicio gratuito compártelo con quien creas que pueda necesitarlo,`+
` recuerda guardar este whatsapp para tener información de los mejores especialistas en tu ciudad rápidamente sin instalar ninguna app.\n`})
  return gotoFlow(flowMenu)
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
const adapterFlow = createFlow([flowBienvenida,flowRecibirMedia,flowLocation,flowNotaDeVoz,flowDocumento,flowMenu,flowEspecialidad])
const adapterProvider = createProvider(BaileysProvider)

createBot({
flow: adapterFlow,
provider: adapterProvider,
database: adapterDB,
})

QRPortalWeb()
}

main()
