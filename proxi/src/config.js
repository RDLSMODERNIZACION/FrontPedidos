import dotenv from 'dotenv';

dotenv.config();

export const {
  GAS_URL_CREAR_CARPETA,
  GAS_URL_ACTUALIZAR_ESTADO,
  GAS_URL_REENVIAR_PEDIDO,
  FRONTEND_ORIGIN,
  PORT = 3000,
} = process.env;

const required = [
  'GAS_URL_CREAR_CARPETA',
  'GAS_URL_ACTUALIZAR_ESTADO',
  'GAS_URL_REENVIAR_PEDIDO',
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error('Missing environment variables:', missing.join(', '));
  process.exit(1);
}
