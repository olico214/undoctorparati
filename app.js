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



const flowNostros = addKeyword('nosotros', { sensitive: true })
.addAnswer('PANELYA somos una empresa con amplia experiencia en el montaje y distribución de todo tipo de panel sándwich,'+
' cubiertas y fachadas metálicas. Cuidamos al máximo la calidad final del trabajo, porque comprendemos que el crecimiento'+
' de nuestra empresa se basa en la máxima calidad de nuestros productos, siempre trabajando con primeras marcas.'+
'En PANELYA, le asesoramos en todo momento sobre los mejores materiales y métodos de montaje más adecuados para conseguir que sus instalaciones resulten en un acabado perfecto.',{media:'https://panelya.com/wp-content/themes/panelya/img/logo.png'},null)

.addAnswer('Fabricamos y servimos todo tipo de panel sándwich a medida a cualquier punto de España',{media:'https://panelya.com/wp-content/uploads/2022/08/panel-sandwich-fachada-empresa.jpg'},null)
.addAnswer([
  'Desde nuestro inicio, somos conscientes de la importancia del diseño en el mercado actual,'+
  ' es por ello, que para todos los diseños y proyectos que podemos realizar contamos con el servicio y asesoramiento de la empresa *DENORTE PROJECT MANAGEMENT*,'+
  ' la cual junto a un estudio detalle y una serie de propuestas en 3d o infografías,'+
  ' presentamos un dossier a nuestros clientes con toda la información final para llevar a cabo su remodelación'+
  ' al mejor precio y la mejor calidad de materiales, sin que por ello se incremente el precio final de la obra a ejecutar.'
],{media:'https://panelya.com/wp-content/uploads/2022/08/panel-teja-casa-campo.jpeg'}, (ctx,{flowDynamic,gotoFlow})=>{
  flowDynamic({body:"Para Conocer mas de nosotros de invitamos a conocer nuestra pagina web: https://panelya.com"})
  return gotoFlow()
})



const flowBienvenida = addKeyword(EVENTS.WELCOME)
.addAnswer(['Bienvenido a Panelya.\n*Fabricamos y servimos todo tipo de panel sándwich a medida a cualquier punto de España*'])
.addAnswer([
  '💫 Selecciona una de las siguientes opciones:\n',
  '1️⃣ Cotizaciónes ✍🖨',
  '2️⃣ Nosotros 👩‍🏫',
  '3️⃣ Pagina Web 📍',
  '\nRecuerda que nuestro horario de atencion es de 08:00 AM A 20:00 PM'
],{capture:true},(ctx,{gotoFlow})=>{
  if(ctx.body === "1"){
    return gotoFlow(flowCategory)
  }if(ctx.body === "2"){
    return gotoFlow(flowNostros)
  }
  
  return flowDynamic({body:'Selecciona una opcion correcta'})
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
const adapterFlow = createFlow([flowBienvenida,flowRecibirMedia,flowLocation,flowNotaDeVoz,flowDocumento,flowCategory,flowNostros])
const adapterProvider = createProvider(BaileysProvider)

createBot({
flow: adapterFlow,
provider: adapterProvider,
database: adapterDB,
})

QRPortalWeb()
}

main()
