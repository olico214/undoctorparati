const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const axios = require('axios')
const { EVENTS } = require('@bot-whatsapp/bot')




const client = {};

const flowCategory = addKeyword('categoria', { sensitive: true }).addAnswer([
  'Selecciona una categoria:',
  '1. Paneles de Hogar',
  '2. Paneles de Granja',
  '3. Paneles para empresas'
], { capture: true }, (ctx, { endFlow,flowDynamic }) => {
  const phone = ctx.from;
  const tel = phone.slice(3);
  if (!client[tel]) {
    client[tel] = {}; // Debes inicializar el objeto client[tel]
  }

  client[tel].categoria = ctx.body;
  client[tel].telefono = tel;

  console.log(client[tel].categoria);
  flowDynamic({ body: `Su número celular es ${tel}. Has seleccionado la categoría: Paneles de Hogar` });
  return endFlow()
});



const flowBienvenida = addKeyword(EVENTS.WELCOME)
.addAnswer('¿Cual es tu nombre?',{capture:true},(ctx,{endFlow,flowDynamic})=>{
  const phone = ctx.from;
  const tel = phone.slice(3);
  if (!client[tel]) {
    client[tel] = {}; 
  }

  client[tel].categoria = ctx.body;
  client[tel].telefono = tel;
  const newphone = phone.slice(3)

  flowDynamic(`Bienvenido ${ctx.body} tu numero celular es ${newphone}, saludos! `)
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
const adapterFlow = createFlow([flowBienvenida,flowRecibirMedia,flowLocation,flowNotaDeVoz,flowDocumento,flowCategory])
const adapterProvider = createProvider(BaileysProvider)

createBot({
flow: adapterFlow,
provider: adapterProvider,
database: adapterDB,
})

QRPortalWeb()
}

main()
