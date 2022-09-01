import moment from 'moment';

/** Get `a` bytes and return a human readable string with `b` decimal places **/
export function formatBytes(a, b = 2) {
  if (0 === a) return "0 Bytes";
  const c = 0 > b ? 0 : b,
    d = Math.floor(Math.log(a) / Math.log(1024));
  return (
    parseFloat((a / Math.pow(1024, d)).toFixed(c)) +
    " " +
    ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
  );
};
  
export function isoStringToDay (isoString) {
  return moment(isoString).fromNow();
};

export function generateSnippet(modelName, modelVersion){
  return `
  from dymaxionlabs.models import Model

  model = Model.get("${modelName}", version="${modelVersion}")
  `
};