var NextI18Next = require("next-i18next").default;

module.exports = new NextI18Next({
  defaultLanguage: "en",
  otherLanguages: ["es"],
  browserLanguageDetection: false,
});
