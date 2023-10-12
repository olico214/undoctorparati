const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const axios = require('axios')
const { EVENTS } = require('@bot-whatsapp/bot')




const paciente = {};
const doctor = {}
const flowMenu = addKeyword('Menu').addAnswer([
  `💥 Escribe *Especialidad* para conocer las especialidades que tenemos`,
  `🩺 Escribe el nombre del médico que necesitas (nombre y apellido - Ej. Doctor José Almeida - dr. José alvarado - dr José Almeida Alvarado )`,
  `🔅 Escribe la especialidad del médico ( Ejemplo: Cardiólogo, Ginecólogo, etc. )`,
  `☝️  Escribe Postularme  para formar parte de este Directorio Whatsapp`,
  `〰️〰️〰️〰️〰️〰️〰️〰️〰️`,
  `👉 📞 Si deseas agendar una cita por teléfono con algún médico\nLlama a este número  4775820455`,
  `⌚️ Nuestras agentes con gusto te atenderán en los siguientes horarios:\n*Lunes a Viernes*\n8:00 am - 8:00 pm`,
  `*Sábado*\n9:00 am - 3:00 pm`,
  `〰️〰️〰️〰️〰️〰️〰️〰️〰️`,
  ` www.undoctorparati.com`,
  ` ¡Te conectamos con los Doctores!`,

  
  
],{capture:true},(ctx,{fallBack,flowDynamic})=>{
  const seleccion = ctx.body;
  const phone = ctx.from;
  const tel = phone.slice(3)
  if(!paciente[tel]){
    paciente[tel] = {}
  }
  paciente[tel].tel = tel
  paciente[tel].seleccion = seleccion
  
  flowDynamic({body:`Tu seleccion: ${seleccion} tu numero de telefono: ${phone} `})



})


const flowBienvenida = addKeyword(EVENTS.WELCOME).addAction(async(ctx,{flowDynamic,gotoFlow})=>{
  const ciudad = 'Guadalajara'
  await flowDynamic({body:`💊  ¡Hola!  Soy la asistente virtual de undoctorparati.com en ${ciudad} y estoy disponible 24/7 para poder ayudarte\n\n〰️〰️〰️〰️〰️〰️〰️〰️〰️\n\n`+
  `🚫  Este WhatsApp, no es de urgencias\n\n`+
`🦾 Soy una asistente Virtual por WhatsApp con respuestas programadas\n🤳 Este es un servicio gratuito compártelo con quien creas que pueda necesitarlo,`+
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
const adapterFlow = createFlow([flowBienvenida,flowRecibirMedia,flowLocation,flowNotaDeVoz,flowDocumento,flowMenu])
const adapterProvider = createProvider(BaileysProvider)

createBot({
flow: adapterFlow,
provider: adapterProvider,
database: adapterDB,
})

QRPortalWeb()
}

main()
