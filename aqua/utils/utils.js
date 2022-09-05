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

export function isoStringToDay(isoString) {
  return moment(isoString).fromNow();
};

export function generateSnippet(modelName, modelVersion) {
  return `from dymaxionlabs.models import Model

model = Model.get("${modelName}", version="${modelVersion}")`
};

export function repr(v) {
  if (typeof (v) === "string") {
    return `"${v}"`
  } else {
    return v
  }
}

export function objectMap(obj, fn) {
  return Object.fromEntries(
    Object.entries(obj).map(
      ([k, v], i) => [k, fn(v, k, i)]
    )
  )
}

export function generatePredictSnippet(modelName, modelVersion, parameters) {
  const predictArguments = Object.entries(parameters).map(([k, v]) => `  ${k}=${repr(v)},`).join("\n")

  return `from dymaxionlabs.models import Model

model = Model.get("${modelName}", version="${modelVersion}")

task = model.predict(
${predictArguments}
)`
};