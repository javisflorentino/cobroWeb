export const environments = {
  baseUrlApp: '/',
  baseUrlServ: '/',

  baseUrlSiigem: 'http://localhost:8080/siigemWeb',


  appEnviroment: 'serviciosHacienda',
  siigemEnviroment: 'siigemWeb',
  pagoLineaEnvironment: 'pagoLineaQA',

  pasarelaCaptchaValidate: 'captcha/validate',//'api/v1/captcha/validate',
  pasarelaCaptchaChallenge: 'captcha/challenge',//'api/v1/captcha/challenge',
  URL_PASARELA_CAPTCHA: 'http://192.168.114.89:8080/pagoenlinea/',//'http://192.168.114.89:8080/',

  user_server: 'WS_SH1',
  pass_server: 'Hdes22G*_106',
  valor_uma: 104,
  URL_PAGO_EN_LINEA: 'https://app.hacienda.morelos.gob.mx/pagoenlinea',
  //URL_PAGO_EN_LINEA: 'http://192.168.114.122:8080/pagoenlinea',//'https://app.hacienda.morelos.gob.mx/pagoenlinea',
  //URL_PAGO_EN_LINEA: 'https://app.hacienda.morelos.gob.mx/pagoenlinea',
  URL_PAGO_EN_LINEA_RECIBO: 'https://app.hacienda.morelos.gob.mx/reciboQA',

  // URLs para SIIGEM Web
  URL_SIIGEM_REPORTE_CEDULAR: 'https://app.hacienda.morelos.gob.mx/siigemWeb/impuestos/cedular/reporte',

  /* Data for get token - BANBAJIO, SANTANDER */
  USER_BY_SISTEM_TOKEN: 'admin',
  PASS_BY_SISTEM_TOKEN: 'secretpassword',
  PATH_SYSTEM_TOKEN: 'auth',
  USER_FOR_LOGIN: 'OLIVER.TEST',
  PASS_FOR_LOGIN: 'carlos2023',
  SISTEM_FOR_LOGIN: 'sistema',

  /* BANBAJIO data */
  URL_BANBAJIO: 'http://192.168.114.89:8082/',
  CONTEX_PATH_BANBAJIO: 'banbajiogateway',

  /* SANTANDER data */
  URL_SANTANDER: 'http://192.168.114.89:8082/',
  CONTEX_PATH_SANTANDER: 'santandergateway',
}
