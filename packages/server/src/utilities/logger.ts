import chalk from "chalk";
import { createLogger, format as winstonFormat, transports } from 'winston';
import { TRPCError } from "@trpc/server";
import { format } from "date-fns";

const Severidad = {
  error: "error",
  info: "info",
  warning: "warning",
};

type LogOptions = {
  msg: string;
  severidad?: keyof typeof Severidad;
  desplegarTimestamp?: boolean;
  error?: Error;
};

const { combine, timestamp, printf } = winstonFormat;

const hourColor = "#878891";

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      logFormat
  ),
  transports: [
      new transports.File({ filename: 'logs/error.log', level: 'error' }),
      new transports.File({ filename: 'logs/combined.log' }),
  ]
});

const coloresPorSeveridad = {
  [Severidad.error]: "#e60e0e",
  [Severidad.info]: "#147ab5",
  [Severidad.warning]: "#D9BD23",
};

const cabeceroPorSeveridad = {
  [Severidad.error]: "ERROR",
  [Severidad.info]: "SERVER",
  [Severidad.warning]: "WARNING",
};

class Logger {
  static log({
    msg = "",
    severidad = "info",
    desplegarTimestamp = true,
    error,
  }: LogOptions) {
    const cabecero = this.obtenerCabecero(severidad);
    logger.log(severidad, error?.message);

    if (desplegarTimestamp) {
      const timestamp = this.obtenerTimestamp();
      console.log(`${timestamp} ${cabecero}: ${msg}`);
      return;
    }
  }

  static error(error: TRPCError) {
    const { code, name, message } = error;
    const cabecero = this.obtenerCabecero("error");
    const timestamp = this.obtenerTimestamp();
    const log = `${timestamp} ${cabecero}: ${code} ${name} \n${message}`;
    logger.error(error);
    if (process.env.NODE_ENV !== 'production') console.log(log);
  }

  private static obtenerCabecero(severidad: keyof typeof Severidad) {
    const cabecero = `[${chalk.hex(coloresPorSeveridad[severidad])(
      cabeceroPorSeveridad[severidad],
    )}]`;
    return cabecero;
  }

  private static obtenerTimestamp() {
    const timestamp = `[${chalk.hex(hourColor)(
      format(new Date(), "yyyy-MM-dd hh:mm a"),
    )}]`;
    return timestamp;
  }
}

export default Logger;
