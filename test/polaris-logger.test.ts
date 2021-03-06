import { Logger } from 'winston';
import { LoggerConfiguration } from '../src/configurations/logger-configuration';
import { ApplicationProperties } from '../src/main';
import { PolarisLogger } from '../src/polaris-logger';
import { createLogger } from '../src/winston-logger';

const loggerImplMock: { [T in keyof Logger]: any } = {
    fatal: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    on: jest.fn(),
} as any;
jest.mock('../src/winston-logger', () => {
    return {
        createLogger: jest.fn(() => {
            return loggerImplMock;
        }),
    };
});

describe('polaris-logger tests', () => {
    const appProps: ApplicationProperties = {
        id: 'p0laris-l0gs',
        name: 'polaris-logs',
        version: 'v1',
        environment: 'environment',
        component: 'component',
    };
    const config: LoggerConfiguration = {
        loggerLevel: 'info',
    };
    const message: string = 'log message';

    test('creating a polaris logger with application properties and configuration - winston createLogger was called with configuration', () => {
        const logger = new PolarisLogger(config, appProps);

        expect(createLogger).toHaveBeenCalledWith(config);
    });

    test('fatal - logging message - message is in the log', () => {
        const logger = new PolarisLogger(config);
        logger.fatal(message);
        expect(loggerImplMock.fatal).toHaveBeenCalledWith({
            message,
        });
    });

    test('error - logging message - message is in the log', () => {
        const logger = new PolarisLogger(config);
        logger.error(message);
        expect(loggerImplMock.error).toHaveBeenCalledWith({
            message,
        });
    });

    test('warn - logging message - message is in the log', () => {
        const logger = new PolarisLogger(config);
        logger.warn(message);
        expect(loggerImplMock.warn).toHaveBeenCalledWith({
            message,
        });
    });

    test('info - logging message - message is in the log', () => {
        const logger = new PolarisLogger(config);
        logger.info(message);
        expect(loggerImplMock.info).toHaveBeenCalledWith({
            message,
        });
    });

    test('debug - logging message - message is in the log', () => {
        const logger = new PolarisLogger(config);
        logger.debug(message);
        expect(loggerImplMock.debug).toHaveBeenCalledWith({
            message,
        });
    });

    test('trace - logging message - message is in the log', () => {
        const logger = new PolarisLogger(config);
        logger.trace(message);
        expect(loggerImplMock.trace).toHaveBeenCalledWith({
            message,
        });
    });

    test('info - logging message - application properties are in the log', () => {
        const logger = new PolarisLogger(config, appProps);
        logger.info(message);
        expect(loggerImplMock.info).toHaveBeenCalledWith(
            expect.objectContaining({
                component: appProps.component,
                environment: appProps.environment,
                version: appProps.version,
                eventKindDescription: { systemId: appProps.id },
                systemId: appProps.id,
                systemName: appProps.name,
            }),
        );
    });
});
