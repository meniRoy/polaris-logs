import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { LogstashTransport } from 'winston-logstash-transport';
import { LoggerConfiguration } from './configurations/logger-configuration';

const timestampFormat: string = 'DD-MM-YYYY HH:mm:ss';

const consoleFullFormat = winston.format.combine(
    winston.format.timestamp({ format: timestampFormat }),
    winston.format.align(),
    winston.format.printf(info => {
        const { timestamp, level, message, ...args } = info;
        return `${timestamp} [${level}]: ${message} ${
            Object.keys(args).length ? `\n${JSON.stringify(args, null, 2)}` : ''
        }`;
    }),
);

const consoleShortFormat = winston.format.combine(
    winston.format.timestamp({ format: timestampFormat }),
    winston.format.align(),
    winston.format.printf(info => {
        const { timestamp, level, message, throwable } = info;
        return `${timestamp} [${level}]: ${message} ${
            throwable ? `\n${JSON.stringify(throwable, null, 2)}` : ''
        }`;
    }),
);

const logstashFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => {
        return JSON.stringify(info);
    }),
);

const customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        debug: 4,
        trace: 5,
    },
    colors: {
        fatal: 'bold redBG',
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'blue',
        trace: 'magenta',
    },
};

export const createLogger = (loggerConfiguration: LoggerConfiguration) => {
    const logger = winston.createLogger({
        level: loggerConfiguration.loggerLevel,
        levels: customLevels.levels,
        format: winston.format.json(),
        exitOnError: false, // do not exit on handled exceptions
    });

    if (loggerConfiguration.logstashConfigurations) {
        loggerConfiguration.logstashConfigurations.forEach(logstashConfiguration => {
            logger.add(
                new LogstashTransport({
                    host: logstashConfiguration.logstashHost,
                    port: logstashConfiguration.logstashPort,
                    format: logstashFormat,
                }),
            );
        });
    }

    winston.addColors(customLevels.colors);
    if (loggerConfiguration.writeToConsole) {
        logger.add(
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    loggerConfiguration.writeFullMessageToConsole
                        ? consoleFullFormat
                        : consoleShortFormat,
                ),
            }),
        );
    }

    if (loggerConfiguration.dailyRotateFileConfiguration) {
        const dailyFileConf = loggerConfiguration.dailyRotateFileConfiguration;
        logger.add(
            new DailyRotateFile({
                format: logstashFormat,
                datePattern: 'DD-MM-YYYY',
                filename: `${dailyFileConf.directoryPath}${
                    dailyFileConf.fileNamePrefix
                }${'-%DATE%'}.${dailyFileConf.fileExtension}`,
                maxFiles: dailyFileConf.numberOfDaysToDeleteFile
                    ? `${dailyFileConf.numberOfDaysToDeleteFile}${'d'}`
                    : '30d',
            }),
        );
    } else if (loggerConfiguration.logFilePath) {
        logger.add(
            new winston.transports.File({
                format: logstashFormat,
                filename: loggerConfiguration.logFilePath,
            }),
        );
    }

    if (loggerConfiguration.customTransports) {
        loggerConfiguration.customTransports.forEach(customTransport => {
            logger.add(customTransport);
        });
    }

    return logger;
};
