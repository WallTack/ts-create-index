import _ from 'lodash';

const stripExtension = (filename) => {
  return filename.includes('.') ? filename.slice(0, filename.lastIndexOf('.')) : filename;
};

const buildExportBlock = (files) => {
  let importBlock;

  importBlock = _.map(files, (fileName) => {
    return "export * from './" + stripExtension(fileName) + "';"; // eslint-disable-line quotes
  });

  importBlock = importBlock.join('\n');

  return importBlock;
};

export default (filePaths, options = {}) => {
  let code;
  let configCode;

  code = '';
  configCode = '';

  if (options.banner) {
    const banners = _.isArray(options.banner) ? options.banner : [options.banner];

    banners.forEach((banner) => {
      code += banner + '\n';
    });

    code += '\n';
  }

  if (options.config && _.size(options.config) > 0) {
    configCode += ' ' + JSON.stringify(options.config);
  }

  code += '// @ts-create-index' + configCode + '\n\n';

  if (filePaths.length) {
    const sortedFilePaths = filePaths.sort();

    code += buildExportBlock(sortedFilePaths) + '\n\n';
  }

  return code;
};
