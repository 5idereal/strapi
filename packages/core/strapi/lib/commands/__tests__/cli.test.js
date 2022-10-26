'use strict';

const { Command } = require('commander');
const path = require('path');
const { runStrapiCommand } = require('../index');

const makeArgv = (...args) => {
  return ['node', path.resolve(__dirname, __filename), ...args];
};

describe('strapi command', () => {
  const exit = jest.spyOn(process, 'exit').mockImplementation(() => {});
  const stdoutWrite = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});
  const writeOut = jest.fn();
  const writeErr = jest.fn();
  let command;

  beforeEach(() => {
    command = new Command();
    exit.mockReset();
    stdoutWrite.mockReset();
    writeOut.mockReset();
    writeErr.mockReset();

    // Set configureOutput instead of mocking stdout so it works even if output is changed in the future
    command.configureOutput({
      writeOut,
      writeErr,
    });
  });

  it('throws on invalid command', async () => {
    const cmd = 'wrongCommand';
    const errString = `error: unknown command '${cmd}'`;

    await runStrapiCommand(makeArgv(cmd), command);

    expect(exit).toHaveBeenCalledWith(1);

    expect(writeErr).toHaveBeenCalled();

    // trim to ignore newlines
    expect(writeErr.mock.calls[0][0].trim()).toEqual(errString);
  });

  it('--version outputs version', async () => {
    await runStrapiCommand(makeArgv('version'), command);

    expect(stdoutWrite).toHaveBeenCalledTimes(1);
    expect(stdoutWrite.mock.calls[0][0].trim()).toEqual(require('../../../package.json').version);
    expect(exit).toHaveBeenCalledWith(0);
  });
});
