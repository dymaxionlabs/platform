module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = require('../../../ssr-module-cache.js');
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./components/BasicAppbar.js":
/*!***********************************!*\
  !*** ./components/BasicAppbar.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! prop-types */ "prop-types");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../i18n */ "./i18n.js");
/* harmony import */ var _i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _material_ui_core_styles__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @material-ui/core/styles */ "@material-ui/core/styles");
/* harmony import */ var _material_ui_core_styles__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_material_ui_core_styles__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _components_SignupButton__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/SignupButton */ "./components/SignupButton.js");
/* harmony import */ var _material_ui_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @material-ui/core */ "@material-ui/core");
/* harmony import */ var _material_ui_core__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_material_ui_core__WEBPACK_IMPORTED_MODULE_5__);
var __jsx = react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement;

function cov_1aron6lr2q() {
  var path = "/app/components/BasicAppbar.js";
  var hash = "78c382072f35d418bacf13448e62ec8cd42da953";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/app/components/BasicAppbar.js",
    statementMap: {
      "0": {
        start: {
          line: 9,
          column: 15
        },
        end: {
          line: 24,
          column: 2
        }
      },
      "1": {
        start: {
          line: 9,
          column: 27
        },
        end: {
          line: 24,
          column: 1
        }
      },
      "2": {
        start: {
          line: 26,
          column: 20
        },
        end: {
          line: 60,
          column: 1
        }
      },
      "3": {
        start: {
          line: 34,
          column: 4
        },
        end: {
          line: 58,
          column: 13
        }
      },
      "4": {
        start: {
          line: 62,
          column: 0
        },
        end: {
          line: 67,
          column: 2
        }
      },
      "5": {
        start: {
          line: 69,
          column: 0
        },
        end: {
          line: 73,
          column: 2
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 9,
            column: 15
          },
          end: {
            line: 9,
            column: 16
          }
        },
        loc: {
          start: {
            line: 9,
            column: 27
          },
          end: {
            line: 24,
            column: 1
          }
        },
        line: 9
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 27,
            column: 2
          },
          end: {
            line: 27,
            column: 3
          }
        },
        loc: {
          start: {
            line: 34,
            column: 4
          },
          end: {
            line: 58,
            column: 13
          }
        },
        line: 34
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 50,
            column: 11
          },
          end: {
            line: 54,
            column: 11
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 50,
            column: 11
          },
          end: {
            line: 50,
            column: 25
          }
        }, {
          start: {
            line: 51,
            column: 12
          },
          end: {
            line: 53,
            column: 21
          }
        }],
        line: 50
      },
      "1": {
        loc: {
          start: {
            line: 55,
            column: 11
          },
          end: {
            line: 55,
            column: 41
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 55,
            column: 11
          },
          end: {
            line: 55,
            column: 21
          }
        }, {
          start: {
            line: 55,
            column: 25
          },
          end: {
            line: 55,
            column: 41
          }
        }],
        line: 55
      }
    },
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    },
    f: {
      "0": 0,
      "1": 0
    },
    b: {
      "0": [0, 0],
      "1": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "78c382072f35d418bacf13448e62ec8cd42da953"
  };
  var coverage = global[gcv] || (global[gcv] = {});

  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }

  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_1aron6lr2q = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}

cov_1aron6lr2q();






cov_1aron6lr2q().s[0]++;

const styles = theme => {
  cov_1aron6lr2q().f[0]++;
  cov_1aron6lr2q().s[1]++;
  return {
    appBar: {
      position: "relative"
    },
    logo: {
      height: 25,
      marginRight: theme.spacing(1),
      cursor: "pointer"
    },
    title: {
      cursor: "pointer"
    },
    right: {
      marginLeft: "auto"
    }
  };
};

const BasicAppbar = (cov_1aron6lr2q().s[2]++, Object(_material_ui_core_styles__WEBPACK_IMPORTED_MODULE_3__["withStyles"])(styles)(({
  classes,
  showModeButton,
  showSignUp,
  modeButtonText,
  onModeButtonClick
}) => {
  cov_1aron6lr2q().f[1]++;
  cov_1aron6lr2q().s[3]++;
  return __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_5__["AppBar"], {
    position: "absolute",
    color: "default",
    className: classes.appBar
  }, __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_5__["Toolbar"], null, __jsx(_i18n__WEBPACK_IMPORTED_MODULE_2__["Link"], {
    href: "/"
  }, __jsx("img", {
    src: "/static/logo.png",
    className: classes.logo
  })), __jsx(_i18n__WEBPACK_IMPORTED_MODULE_2__["Link"], {
    href: "/"
  }, __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_5__["Typography"], {
    variant: "h6",
    color: "inherit",
    noWrap: true,
    className: classes.title
  }, "Dymaxion Labs Platform")), __jsx("div", {
    className: classes.right
  }, (cov_1aron6lr2q().b[0][0]++, showModeButton) && (cov_1aron6lr2q().b[0][1]++, __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_5__["Button"], {
    onClick: onModeButtonClick,
    variant: "contained"
  }, modeButtonText)), (cov_1aron6lr2q().b[1][0]++, showSignUp) && (cov_1aron6lr2q().b[1][1]++, __jsx(_components_SignupButton__WEBPACK_IMPORTED_MODULE_4__["default"], null)))));
}));
cov_1aron6lr2q().s[4]++;
BasicAppbar.propTypes = {
  classes: prop_types__WEBPACK_IMPORTED_MODULE_0___default.a.object.isRequired,
  showSignUp: prop_types__WEBPACK_IMPORTED_MODULE_0___default.a.bool,
  showModeButton: prop_types__WEBPACK_IMPORTED_MODULE_0___default.a.bool,
  modeButtonText: prop_types__WEBPACK_IMPORTED_MODULE_0___default.a.string
};
cov_1aron6lr2q().s[5]++;
BasicAppbar.defaultProps = {
  showSignUp: false,
  showModeButton: false,
  modeButtonText: ""
};
/* harmony default export */ __webpack_exports__["default"] = (Object(_material_ui_core_styles__WEBPACK_IMPORTED_MODULE_3__["withStyles"])(styles)(BasicAppbar));

/***/ }),

/***/ "./components/SignupButton.js":
/*!************************************!*\
  !*** ./components/SignupButton.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! prop-types */ "prop-types");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../i18n */ "./i18n.js");
/* harmony import */ var _i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _material_ui_core_styles__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @material-ui/core/styles */ "@material-ui/core/styles");
/* harmony import */ var _material_ui_core_styles__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_material_ui_core_styles__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _material_ui_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @material-ui/core */ "@material-ui/core");
/* harmony import */ var _material_ui_core__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_material_ui_core__WEBPACK_IMPORTED_MODULE_4__);
var __jsx = react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement;

function cov_525fi1env() {
  var path = "/app/components/SignupButton.js";
  var hash = "82dd4535bb9daf8c65ff31d88684f21a627e7eba";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/app/components/SignupButton.js",
    statementMap: {
      "0": {
        start: {
          line: 8,
          column: 15
        },
        end: {
          line: 13,
          column: 2
        }
      },
      "1": {
        start: {
          line: 8,
          column: 27
        },
        end: {
          line: 13,
          column: 1
        }
      },
      "2": {
        start: {
          line: 15,
          column: 21
        },
        end: {
          line: 21,
          column: 1
        }
      },
      "3": {
        start: {
          line: 16,
          column: 2
        },
        end: {
          line: 20,
          column: 9
        }
      },
      "4": {
        start: {
          line: 23,
          column: 0
        },
        end: {
          line: 26,
          column: 2
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 8,
            column: 15
          },
          end: {
            line: 8,
            column: 16
          }
        },
        loc: {
          start: {
            line: 8,
            column: 27
          },
          end: {
            line: 13,
            column: 1
          }
        },
        line: 8
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 15,
            column: 21
          },
          end: {
            line: 15,
            column: 22
          }
        },
        loc: {
          start: {
            line: 16,
            column: 2
          },
          end: {
            line: 20,
            column: 9
          }
        },
        line: 16
      }
    },
    branchMap: {},
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0
    },
    f: {
      "0": 0,
      "1": 0
    },
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "82dd4535bb9daf8c65ff31d88684f21a627e7eba"
  };
  var coverage = global[gcv] || (global[gcv] = {});

  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }

  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_525fi1env = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}

cov_525fi1env();






cov_525fi1env().s[0]++;

const styles = theme => {
  cov_525fi1env().f[0]++;
  cov_525fi1env().s[1]++;
  return {
    btn: {
      margin: theme.spacing(1),
      zIndex: 1000
    }
  };
};

cov_525fi1env().s[2]++;

const SignupButton = ({
  t,
  classes
}) => {
  cov_525fi1env().f[1]++;
  cov_525fi1env().s[3]++;
  return __jsx(_i18n__WEBPACK_IMPORTED_MODULE_2__["Link"], {
    href: "/signup"
  }, __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_4__["Button"], {
    className: classes.btn,
    color: "primary",
    variant: "contained"
  }, t("btn_signup")));
};

cov_525fi1env().s[4]++;
SignupButton.propTypes = {
  classes: prop_types__WEBPACK_IMPORTED_MODULE_0___default.a.object.isRequired,
  t: prop_types__WEBPACK_IMPORTED_MODULE_0___default.a.func.isRequired
};
/* harmony default export */ __webpack_exports__["default"] = (Object(_i18n__WEBPACK_IMPORTED_MODULE_2__["withTranslation"])("testdrive")(Object(_material_ui_core_styles__WEBPACK_IMPORTED_MODULE_3__["withStyles"])(styles)(SignupButton)));

/***/ }),

/***/ "./i18n.js":
/*!*****************!*\
  !*** ./i18n.js ***!
  \*****************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function cov_2qq5znzqev() {
  var path = "/app/i18n.js";
  var hash = "67870b1d90c7816e1270eb616da88306d0c1652b";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/app/i18n.js",
    statementMap: {
      "0": {
        start: {
          line: 1,
          column: 18
        },
        end: {
          line: 1,
          column: 49
        }
      },
      "1": {
        start: {
          line: 3,
          column: 0
        },
        end: {
          line: 7,
          column: 3
        }
      }
    },
    fnMap: {},
    branchMap: {},
    s: {
      "0": 0,
      "1": 0
    },
    f: {},
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "67870b1d90c7816e1270eb616da88306d0c1652b"
  };
  var coverage = global[gcv] || (global[gcv] = {});

  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }

  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_2qq5znzqev = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}

cov_2qq5znzqev();
var NextI18Next = (cov_2qq5znzqev().s[0]++, __webpack_require__(/*! next-i18next */ "next-i18next").default);
cov_2qq5znzqev().s[1]++;
module.exports = new NextI18Next({
  defaultLanguage: "en",
  otherLanguages: ["es"],
  browserLanguageDetection: false
});

/***/ }),

/***/ "./pages/select-project.js":
/*!*********************************!*\
  !*** ./pages/select-project.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _material_ui_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @material-ui/core */ "@material-ui/core");
/* harmony import */ var _material_ui_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _material_ui_core_styles__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @material-ui/core/styles */ "@material-ui/core/styles");
/* harmony import */ var _material_ui_core_styles__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_material_ui_core_styles__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _material_ui_icons_Folder__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @material-ui/icons/Folder */ "@material-ui/icons/Folder");
/* harmony import */ var _material_ui_icons_Folder__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_material_ui_icons_Folder__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! axios */ "axios");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var js_cookie__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! js-cookie */ "js-cookie");
/* harmony import */ var js_cookie__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(js_cookie__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! next/head */ "next/head");
/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var notistack__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! notistack */ "notistack");
/* harmony import */ var notistack__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(notistack__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! prop-types */ "prop-types");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var react_moment__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react-moment */ "react-moment");
/* harmony import */ var react_moment__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_moment__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _components_BasicAppbar__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../components/BasicAppbar */ "./components/BasicAppbar.js");
/* harmony import */ var _i18n__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../i18n */ "./i18n.js");
/* harmony import */ var _i18n__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(_i18n__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var _utils_api__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../utils/api */ "./utils/api.js");
/* harmony import */ var _utils_auth__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../utils/auth */ "./utils/auth.js");
/* harmony import */ var _utils_router__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../utils/router */ "./utils/router.js");
var __jsx = react__WEBPACK_IMPORTED_MODULE_8___default.a.createElement;

function cov_2gbpplgp8h() {
  var path = "/app/pages/select-project.js";
  var hash = "51c021f64fc92c27fdf1914bbaa7349d0c129921";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/app/pages/select-project.js",
    statementMap: {
      "0": {
        start: {
          line: 30,
          column: 15
        },
        end: {
          line: 71,
          column: 2
        }
      },
      "1": {
        start: {
          line: 30,
          column: 27
        },
        end: {
          line: 71,
          column: 1
        }
      },
      "2": {
        start: {
          line: 74,
          column: 10
        },
        end: {
          line: 77,
          column: 3
        }
      },
      "3": {
        start: {
          line: 79,
          column: 17
        },
        end: {
          line: 81,
          column: 3
        }
      },
      "4": {
        start: {
          line: 80,
          column: 4
        },
        end: {
          line: 80,
          column: 55
        }
      },
      "5": {
        start: {
          line: 83,
          column: 17
        },
        end: {
          line: 117,
          column: 3
        }
      },
      "6": {
        start: {
          line: 84,
          column: 4
        },
        end: {
          line: 84,
          column: 23
        }
      },
      "7": {
        start: {
          line: 86,
          column: 22
        },
        end: {
          line: 86,
          column: 32
        }
      },
      "8": {
        start: {
          line: 87,
          column: 21
        },
        end: {
          line: 87,
          column: 31
        }
      },
      "9": {
        start: {
          line: 89,
          column: 4
        },
        end: {
          line: 89,
          column: 40
        }
      },
      "10": {
        start: {
          line: 91,
          column: 4
        },
        end: {
          line: 116,
          column: 5
        }
      },
      "11": {
        start: {
          line: 92,
          column: 23
        },
        end: {
          line: 101,
          column: 7
        }
      },
      "12": {
        start: {
          line: 102,
          column: 23
        },
        end: {
          line: 102,
          column: 36
        }
      },
      "13": {
        start: {
          line: 103,
          column: 6
        },
        end: {
          line: 103,
          column: 34
        }
      },
      "14": {
        start: {
          line: 104,
          column: 6
        },
        end: {
          line: 104,
          column: 27
        }
      },
      "15": {
        start: {
          line: 106,
          column: 23
        },
        end: {
          line: 106,
          column: 35
        }
      },
      "16": {
        start: {
          line: 107,
          column: 6
        },
        end: {
          line: 115,
          column: 7
        }
      },
      "17": {
        start: {
          line: 108,
          column: 8
        },
        end: {
          line: 108,
          column: 17
        }
      },
      "18": {
        start: {
          line: 110,
          column: 8
        },
        end: {
          line: 110,
          column: 32
        }
      },
      "19": {
        start: {
          line: 111,
          column: 8
        },
        end: {
          line: 113,
          column: 11
        }
      },
      "20": {
        start: {
          line: 114,
          column: 8
        },
        end: {
          line: 114,
          column: 45
        }
      },
      "21": {
        start: {
          line: 120,
          column: 27
        },
        end: {
          line: 120,
          column: 37
        }
      },
      "22": {
        start: {
          line: 121,
          column: 33
        },
        end: {
          line: 121,
          column: 43
        }
      },
      "23": {
        start: {
          line: 123,
          column: 4
        },
        end: {
          line: 154,
          column: 6
        }
      },
      "24": {
        start: {
          line: 158,
          column: 0
        },
        end: {
          line: 161,
          column: 2
        }
      },
      "25": {
        start: {
          line: 163,
          column: 0
        },
        end: {
          line: 163,
          column: 52
        }
      },
      "26": {
        start: {
          line: 164,
          column: 0
        },
        end: {
          line: 164,
          column: 67
        }
      },
      "27": {
        start: {
          line: 165,
          column: 0
        },
        end: {
          line: 165,
          column: 46
        }
      },
      "28": {
        start: {
          line: 167,
          column: 26
        },
        end: {
          line: 167,
          column: 27
        }
      },
      "29": {
        start: {
          line: 170,
          column: 10
        },
        end: {
          line: 174,
          column: 3
        }
      },
      "30": {
        start: {
          line: 177,
          column: 4
        },
        end: {
          line: 177,
          column: 29
        }
      },
      "31": {
        start: {
          line: 178,
          column: 4
        },
        end: {
          line: 178,
          column: 38
        }
      },
      "32": {
        start: {
          line: 182,
          column: 22
        },
        end: {
          line: 182,
          column: 32
        }
      },
      "33": {
        start: {
          line: 184,
          column: 4
        },
        end: {
          line: 207,
          column: 5
        }
      },
      "34": {
        start: {
          line: 185,
          column: 23
        },
        end: {
          line: 190,
          column: 8
        }
      },
      "35": {
        start: {
          line: 191,
          column: 33
        },
        end: {
          line: 191,
          column: 46
        }
      },
      "36": {
        start: {
          line: 192,
          column: 6
        },
        end: {
          line: 192,
          column: 40
        }
      },
      "37": {
        start: {
          line: 193,
          column: 6
        },
        end: {
          line: 196,
          column: 7
        }
      },
      "38": {
        start: {
          line: 194,
          column: 24
        },
        end: {
          line: 194,
          column: 34
        }
      },
      "39": {
        start: {
          line: 195,
          column: 8
        },
        end: {
          line: 195,
          column: 42
        }
      },
      "40": {
        start: {
          line: 198,
          column: 23
        },
        end: {
          line: 198,
          column: 35
        }
      },
      "41": {
        start: {
          line: 199,
          column: 6
        },
        end: {
          line: 206,
          column: 7
        }
      },
      "42": {
        start: {
          line: 200,
          column: 8
        },
        end: {
          line: 200,
          column: 17
        }
      },
      "43": {
        start: {
          line: 202,
          column: 8
        },
        end: {
          line: 202,
          column: 32
        }
      },
      "44": {
        start: {
          line: 203,
          column: 8
        },
        end: {
          line: 205,
          column: 11
        }
      },
      "45": {
        start: {
          line: 210,
          column: 24
        },
        end: {
          line: 213,
          column: 3
        }
      },
      "46": {
        start: {
          line: 211,
          column: 4
        },
        end: {
          line: 211,
          column: 40
        }
      },
      "47": {
        start: {
          line: 212,
          column: 4
        },
        end: {
          line: 212,
          column: 25
        }
      },
      "48": {
        start: {
          line: 216,
          column: 27
        },
        end: {
          line: 216,
          column: 37
        }
      },
      "49": {
        start: {
          line: 217,
          column: 40
        },
        end: {
          line: 217,
          column: 50
        }
      },
      "50": {
        start: {
          line: 218,
          column: 19
        },
        end: {
          line: 218,
          column: 32
        }
      },
      "51": {
        start: {
          line: 220,
          column: 4
        },
        end: {
          line: 253,
          column: 5
        }
      },
      "52": {
        start: {
          line: 221,
          column: 6
        },
        end: {
          line: 221,
          column: 32
        }
      },
      "53": {
        start: {
          line: 222,
          column: 11
        },
        end: {
          line: 253,
          column: 5
        }
      },
      "54": {
        start: {
          line: 223,
          column: 6
        },
        end: {
          line: 250,
          column: 8
        }
      },
      "55": {
        start: {
          line: 226,
          column: 12
        },
        end: {
          line: 247,
          column: 23
        }
      },
      "56": {
        start: {
          line: 229,
          column: 29
        },
        end: {
          line: 229,
          column: 62
        }
      },
      "57": {
        start: {
          line: 252,
          column: 6
        },
        end: {
          line: 252,
          column: 62
        }
      },
      "58": {
        start: {
          line: 257,
          column: 0
        },
        end: {
          line: 261,
          column: 2
        }
      },
      "59": {
        start: {
          line: 263,
          column: 0
        },
        end: {
          line: 263,
          column: 54
        }
      },
      "60": {
        start: {
          line: 264,
          column: 0
        },
        end: {
          line: 264,
          column: 69
        }
      },
      "61": {
        start: {
          line: 265,
          column: 0
        },
        end: {
          line: 265,
          column: 48
        }
      },
      "62": {
        start: {
          line: 269,
          column: 4
        },
        end: {
          line: 271,
          column: 6
        }
      },
      "63": {
        start: {
          line: 275,
          column: 34
        },
        end: {
          line: 275,
          column: 44
        }
      },
      "64": {
        start: {
          line: 277,
          column: 4
        },
        end: {
          line: 313,
          column: 6
        }
      },
      "65": {
        start: {
          line: 317,
          column: 0
        },
        end: {
          line: 320,
          column: 2
        }
      },
      "66": {
        start: {
          line: 322,
          column: 0
        },
        end: {
          line: 322,
          column: 50
        }
      },
      "67": {
        start: {
          line: 323,
          column: 0
        },
        end: {
          line: 323,
          column: 65
        }
      },
      "68": {
        start: {
          line: 324,
          column: 0
        },
        end: {
          line: 324,
          column: 44
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 30,
            column: 15
          },
          end: {
            line: 30,
            column: 16
          }
        },
        loc: {
          start: {
            line: 30,
            column: 27
          },
          end: {
            line: 71,
            column: 1
          }
        },
        line: 30
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 79,
            column: 17
          },
          end: {
            line: 79,
            column: 18
          }
        },
        loc: {
          start: {
            line: 79,
            column: 24
          },
          end: {
            line: 81,
            column: 3
          }
        },
        line: 79
      },
      "2": {
        name: "(anonymous_2)",
        decl: {
          start: {
            line: 83,
            column: 17
          },
          end: {
            line: 83,
            column: 18
          }
        },
        loc: {
          start: {
            line: 83,
            column: 30
          },
          end: {
            line: 117,
            column: 3
          }
        },
        line: 83
      },
      "3": {
        name: "(anonymous_3)",
        decl: {
          start: {
            line: 119,
            column: 2
          },
          end: {
            line: 119,
            column: 3
          }
        },
        loc: {
          start: {
            line: 119,
            column: 11
          },
          end: {
            line: 155,
            column: 3
          }
        },
        line: 119
      },
      "4": {
        name: "(anonymous_4)",
        decl: {
          start: {
            line: 176,
            column: 2
          },
          end: {
            line: 176,
            column: 3
          }
        },
        loc: {
          start: {
            line: 176,
            column: 28
          },
          end: {
            line: 179,
            column: 3
          }
        },
        line: 176
      },
      "5": {
        name: "(anonymous_5)",
        decl: {
          start: {
            line: 181,
            column: 2
          },
          end: {
            line: 181,
            column: 3
          }
        },
        loc: {
          start: {
            line: 181,
            column: 22
          },
          end: {
            line: 208,
            column: 3
          }
        },
        line: 181
      },
      "6": {
        name: "(anonymous_6)",
        decl: {
          start: {
            line: 210,
            column: 24
          },
          end: {
            line: 210,
            column: 25
          }
        },
        loc: {
          start: {
            line: 210,
            column: 37
          },
          end: {
            line: 213,
            column: 3
          }
        },
        line: 210
      },
      "7": {
        name: "(anonymous_7)",
        decl: {
          start: {
            line: 215,
            column: 2
          },
          end: {
            line: 215,
            column: 3
          }
        },
        loc: {
          start: {
            line: 215,
            column: 11
          },
          end: {
            line: 254,
            column: 3
          }
        },
        line: 215
      },
      "8": {
        name: "(anonymous_8)",
        decl: {
          start: {
            line: 225,
            column: 23
          },
          end: {
            line: 225,
            column: 24
          }
        },
        loc: {
          start: {
            line: 226,
            column: 12
          },
          end: {
            line: 247,
            column: 23
          }
        },
        line: 226
      },
      "9": {
        name: "(anonymous_9)",
        decl: {
          start: {
            line: 229,
            column: 23
          },
          end: {
            line: 229,
            column: 24
          }
        },
        loc: {
          start: {
            line: 229,
            column: 29
          },
          end: {
            line: 229,
            column: 62
          }
        },
        line: 229
      },
      "10": {
        name: "(anonymous_10)",
        decl: {
          start: {
            line: 268,
            column: 2
          },
          end: {
            line: 268,
            column: 3
          }
        },
        loc: {
          start: {
            line: 268,
            column: 36
          },
          end: {
            line: 272,
            column: 3
          }
        },
        line: 268
      },
      "11": {
        name: "(anonymous_11)",
        decl: {
          start: {
            line: 274,
            column: 2
          },
          end: {
            line: 274,
            column: 3
          }
        },
        loc: {
          start: {
            line: 274,
            column: 11
          },
          end: {
            line: 314,
            column: 3
          }
        },
        line: 274
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 107,
            column: 6
          },
          end: {
            line: 115,
            column: 7
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 107,
            column: 6
          },
          end: {
            line: 115,
            column: 7
          }
        }, {
          start: {
            line: 109,
            column: 13
          },
          end: {
            line: 115,
            column: 7
          }
        }],
        line: 107
      },
      "1": {
        loc: {
          start: {
            line: 107,
            column: 10
          },
          end: {
            line: 107,
            column: 45
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 107,
            column: 10
          },
          end: {
            line: 107,
            column: 18
          }
        }, {
          start: {
            line: 107,
            column: 22
          },
          end: {
            line: 107,
            column: 45
          }
        }],
        line: 107
      },
      "2": {
        loc: {
          start: {
            line: 193,
            column: 6
          },
          end: {
            line: 196,
            column: 7
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 193,
            column: 6
          },
          end: {
            line: 196,
            column: 7
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 193
      },
      "3": {
        loc: {
          start: {
            line: 193,
            column: 10
          },
          end: {
            line: 193,
            column: 46
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 193,
            column: 10
          },
          end: {
            line: 193,
            column: 20
          }
        }, {
          start: {
            line: 193,
            column: 24
          },
          end: {
            line: 193,
            column: 46
          }
        }],
        line: 193
      },
      "4": {
        loc: {
          start: {
            line: 199,
            column: 6
          },
          end: {
            line: 206,
            column: 7
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 199,
            column: 6
          },
          end: {
            line: 206,
            column: 7
          }
        }, {
          start: {
            line: 201,
            column: 13
          },
          end: {
            line: 206,
            column: 7
          }
        }],
        line: 199
      },
      "5": {
        loc: {
          start: {
            line: 199,
            column: 10
          },
          end: {
            line: 199,
            column: 45
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 199,
            column: 10
          },
          end: {
            line: 199,
            column: 18
          }
        }, {
          start: {
            line: 199,
            column: 22
          },
          end: {
            line: 199,
            column: 45
          }
        }],
        line: 199
      },
      "6": {
        loc: {
          start: {
            line: 220,
            column: 4
          },
          end: {
            line: 253,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 220,
            column: 4
          },
          end: {
            line: 253,
            column: 5
          }
        }, {
          start: {
            line: 222,
            column: 11
          },
          end: {
            line: 253,
            column: 5
          }
        }],
        line: 220
      },
      "7": {
        loc: {
          start: {
            line: 222,
            column: 11
          },
          end: {
            line: 253,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 222,
            column: 11
          },
          end: {
            line: 253,
            column: 5
          }
        }, {
          start: {
            line: 251,
            column: 11
          },
          end: {
            line: 253,
            column: 5
          }
        }],
        line: 222
      }
    },
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 0,
      "16": 0,
      "17": 0,
      "18": 0,
      "19": 0,
      "20": 0,
      "21": 0,
      "22": 0,
      "23": 0,
      "24": 0,
      "25": 0,
      "26": 0,
      "27": 0,
      "28": 0,
      "29": 0,
      "30": 0,
      "31": 0,
      "32": 0,
      "33": 0,
      "34": 0,
      "35": 0,
      "36": 0,
      "37": 0,
      "38": 0,
      "39": 0,
      "40": 0,
      "41": 0,
      "42": 0,
      "43": 0,
      "44": 0,
      "45": 0,
      "46": 0,
      "47": 0,
      "48": 0,
      "49": 0,
      "50": 0,
      "51": 0,
      "52": 0,
      "53": 0,
      "54": 0,
      "55": 0,
      "56": 0,
      "57": 0,
      "58": 0,
      "59": 0,
      "60": 0,
      "61": 0,
      "62": 0,
      "63": 0,
      "64": 0,
      "65": 0,
      "66": 0,
      "67": 0,
      "68": 0
    },
    f: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0
    },
    b: {
      "0": [0, 0],
      "1": [0, 0],
      "2": [0, 0],
      "3": [0, 0],
      "4": [0, 0],
      "5": [0, 0],
      "6": [0, 0],
      "7": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "51c021f64fc92c27fdf1914bbaa7349d0c129921"
  };
  var coverage = global[gcv] || (global[gcv] = {});

  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }

  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_2gbpplgp8h = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}

cov_2gbpplgp8h();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
















cov_2gbpplgp8h().s[0]++;

const styles = theme => {
  cov_2gbpplgp8h().f[0]++;
  cov_2gbpplgp8h().s[1]++;
  return {
    main: {
      width: "auto",
      display: "block",
      // Fix IE 11 issue.
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
      [theme.breakpoints.up(500 + theme.spacing(2) * 2)]: {
        width: 500,
        marginLeft: "auto",
        marginRight: "auto"
      }
    },
    paper: {
      marginTop: theme.spacing(8),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(3)}px`
    },
    subheader: {
      marginBottom: theme.spacing(3)
    },
    subsubheader: {
      fontWeight: 500
    },
    grid: {
      flexGrow: 1
    },
    list: {
      overflow: "auto",
      maxHeight: 320
    },
    inlineFormContainer: {
      display: "flex"
    },
    inlineFormControl: {
      flexGrow: 1,
      marginRight: theme.spacing(1)
    }
  };
};

class NewProjectForm extends (react__WEBPACK_IMPORTED_MODULE_8___default.a.Component) {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "state", (cov_2gbpplgp8h().s[2]++, {
      submitting: false,
      name: ""
    }));

    _defineProperty(this, "handleChange", (cov_2gbpplgp8h().s[3]++, e => {
      cov_2gbpplgp8h().f[1]++;
      cov_2gbpplgp8h().s[4]++;
      this.setState({
        [e.target.name]: e.target.value
      });
    }));

    _defineProperty(this, "handleSubmit", (cov_2gbpplgp8h().s[5]++, async e => {
      cov_2gbpplgp8h().f[2]++;
      cov_2gbpplgp8h().s[6]++;
      e.preventDefault();
      const {
        token
      } = (cov_2gbpplgp8h().s[7]++, this.props);
      const {
        name
      } = (cov_2gbpplgp8h().s[8]++, this.state);
      cov_2gbpplgp8h().s[9]++;
      this.setState({
        submitting: true
      });
      cov_2gbpplgp8h().s[10]++;

      try {
        const response = (cov_2gbpplgp8h().s[11]++, await axios__WEBPACK_IMPORTED_MODULE_3___default.a.post(Object(_utils_api__WEBPACK_IMPORTED_MODULE_12__["buildApiUrl"])(`/projects/`), {
          name: name
        }, {
          headers: {
            "Accept-Language": _i18n__WEBPACK_IMPORTED_MODULE_11__["i18n"].language,
            Authorization: token
          }
        }));
        const {
          uuid
        } = (cov_2gbpplgp8h().s[12]++, response.data);
        cov_2gbpplgp8h().s[13]++;
        js_cookie__WEBPACK_IMPORTED_MODULE_4___default.a.set("project", uuid);
        cov_2gbpplgp8h().s[14]++;
        Object(_utils_router__WEBPACK_IMPORTED_MODULE_14__["routerPush"])("/home/");
      } catch (err) {
        const response = (cov_2gbpplgp8h().s[15]++, err.response);
        cov_2gbpplgp8h().s[16]++;

        if ((cov_2gbpplgp8h().b[1][0]++, response) && (cov_2gbpplgp8h().b[1][1]++, response.status === 401)) {
          cov_2gbpplgp8h().b[0][0]++;
          cov_2gbpplgp8h().s[17]++;
          Object(_utils_auth__WEBPACK_IMPORTED_MODULE_13__["logout"])();
        } else {
          cov_2gbpplgp8h().b[0][1]++;
          cov_2gbpplgp8h().s[18]++;
          console.error(response);
          cov_2gbpplgp8h().s[19]++;
          this.props.enqueueSnackbar("Failed to create new project", {
            variant: "error"
          });
          cov_2gbpplgp8h().s[20]++;
          this.setState({
            submitting: false
          });
        }
      }
    }));
  }

  render() {
    cov_2gbpplgp8h().f[3]++;
    const {
      t,
      classes
    } = (cov_2gbpplgp8h().s[21]++, this.props);
    const {
      submitting,
      name
    } = (cov_2gbpplgp8h().s[22]++, this.state);
    cov_2gbpplgp8h().s[23]++;
    return __jsx("form", {
      className: classes.form,
      method: "post",
      autoComplete: "off",
      onSubmit: this.handleSubmit
    }, __jsx("div", {
      className: classes.inlineFormContainer
    }, __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__["FormControl"], {
      required: true,
      margin: "dense",
      className: classes.inlineFormControl
    }, __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__["Input"], {
      name: "name",
      placeholder: t("new.name_placeholder"),
      value: name,
      onChange: this.handleChange,
      disabled: submitting
    })), __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__["Button"], {
      type: "submit",
      variant: "contained",
      color: "primary",
      disabled: submitting
    }, t("new.submit_btn"))));
  }

}

cov_2gbpplgp8h().s[24]++;
NewProjectForm.propTypes = {
  classes: prop_types__WEBPACK_IMPORTED_MODULE_7___default.a.object.isRequired,
  t: prop_types__WEBPACK_IMPORTED_MODULE_7___default.a.func.isRequired
};
cov_2gbpplgp8h().s[25]++;
NewProjectForm = Object(_material_ui_core_styles__WEBPACK_IMPORTED_MODULE_1__["withStyles"])(styles)(NewProjectForm);
cov_2gbpplgp8h().s[26]++;
NewProjectForm = Object(_i18n__WEBPACK_IMPORTED_MODULE_11__["withTranslation"])("select_project")(NewProjectForm);
cov_2gbpplgp8h().s[27]++;
NewProjectForm = Object(notistack__WEBPACK_IMPORTED_MODULE_6__["withSnackbar"])(NewProjectForm);
const PROJECTS_PER_PAGE = (cov_2gbpplgp8h().s[28]++, 5);

class OpenProjectList extends (react__WEBPACK_IMPORTED_MODULE_8___default.a.Component) {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "state", (cov_2gbpplgp8h().s[29]++, {
      loading: true,
      results: [],
      count: 0
    }));

    _defineProperty(this, "handleSelectProject", (cov_2gbpplgp8h().s[45]++, project => {
      cov_2gbpplgp8h().f[6]++;
      cov_2gbpplgp8h().s[46]++;
      js_cookie__WEBPACK_IMPORTED_MODULE_4___default.a.set("project", project.uuid);
      cov_2gbpplgp8h().s[47]++;
      Object(_utils_router__WEBPACK_IMPORTED_MODULE_14__["routerPush"])("/home/");
    }));
  }

  async componentDidMount() {
    cov_2gbpplgp8h().f[4]++;
    cov_2gbpplgp8h().s[30]++;
    await this.getProjects();
    cov_2gbpplgp8h().s[31]++;
    this.setState({
      loading: false
    });
  }

  async getProjects() {
    cov_2gbpplgp8h().f[5]++;
    const {
      token
    } = (cov_2gbpplgp8h().s[32]++, this.props);
    cov_2gbpplgp8h().s[33]++;

    try {
      const response = (cov_2gbpplgp8h().s[34]++, await axios__WEBPACK_IMPORTED_MODULE_3___default.a.get(Object(_utils_api__WEBPACK_IMPORTED_MODULE_12__["buildApiUrl"])(`/projects/`), {
        headers: {
          "Accept-Language": _i18n__WEBPACK_IMPORTED_MODULE_11__["i18n"].language,
          Authorization: token
        }
      }));
      const {
        count,
        results
      } = (cov_2gbpplgp8h().s[35]++, response.data);
      cov_2gbpplgp8h().s[36]++;
      this.setState({
        count,
        results
      });
      cov_2gbpplgp8h().s[37]++;

      if ((cov_2gbpplgp8h().b[3][0]++, count == 1) && (cov_2gbpplgp8h().b[3][1]++, !js_cookie__WEBPACK_IMPORTED_MODULE_4___default.a.get("project"))) {
        cov_2gbpplgp8h().b[2][0]++;
        const project = (cov_2gbpplgp8h().s[38]++, results[0]);
        cov_2gbpplgp8h().s[39]++;
        this.handleSelectProject(project);
      } else {
        cov_2gbpplgp8h().b[2][1]++;
      }
    } catch (err) {
      const response = (cov_2gbpplgp8h().s[40]++, err.response);
      cov_2gbpplgp8h().s[41]++;

      if ((cov_2gbpplgp8h().b[5][0]++, response) && (cov_2gbpplgp8h().b[5][1]++, response.status === 401)) {
        cov_2gbpplgp8h().b[4][0]++;
        cov_2gbpplgp8h().s[42]++;
        Object(_utils_auth__WEBPACK_IMPORTED_MODULE_13__["logout"])();
      } else {
        cov_2gbpplgp8h().b[4][1]++;
        cov_2gbpplgp8h().s[43]++;
        console.error(response);
        cov_2gbpplgp8h().s[44]++;
        this.props.enqueueSnackbar("Failed to get projects", {
          variant: "error"
        });
      }
    }
  }

  render() {
    cov_2gbpplgp8h().f[7]++;
    const {
      t,
      classes
    } = (cov_2gbpplgp8h().s[48]++, this.props);
    const {
      loading,
      count,
      results
    } = (cov_2gbpplgp8h().s[49]++, this.state);
    const locale = (cov_2gbpplgp8h().s[50]++, _i18n__WEBPACK_IMPORTED_MODULE_11__["i18n"].language);
    cov_2gbpplgp8h().s[51]++;

    if (loading) {
      cov_2gbpplgp8h().b[6][0]++;
      cov_2gbpplgp8h().s[52]++;
      return __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__["LinearProgress"], null);
    } else {
      cov_2gbpplgp8h().b[6][1]++;
      cov_2gbpplgp8h().s[53]++;

      if (results.length > 0) {
        cov_2gbpplgp8h().b[7][0]++;
        cov_2gbpplgp8h().s[54]++;
        return __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__["List"], {
          className: classes.list
        }, results.map(project => {
          cov_2gbpplgp8h().f[8]++;
          cov_2gbpplgp8h().s[55]++;
          return __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__["ListItem"], {
            button: true,
            key: project.uuid,
            onClick: () => {
              cov_2gbpplgp8h().f[9]++;
              cov_2gbpplgp8h().s[56]++;
              return this.handleSelectProject(project);
            }
          }, __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__["ListItemAvatar"], null, __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__["Avatar"], null, __jsx(_material_ui_icons_Folder__WEBPACK_IMPORTED_MODULE_2___default.a, null))), __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__["ListItemText"], {
            primary: project.name,
            secondary: __jsx(react__WEBPACK_IMPORTED_MODULE_8___default.a.Fragment, null, __jsx(react_moment__WEBPACK_IMPORTED_MODULE_9___default.a, {
              locale: locale,
              fromNow: true
            }, project.updated_at), " ", "- ", project.collaborators.join(", "))
          }));
        }));
      } else {
        cov_2gbpplgp8h().b[7][1]++;
        cov_2gbpplgp8h().s[57]++;
        return __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__["Typography"], null, t("open.no_projects"));
      }
    }
  }

}

cov_2gbpplgp8h().s[58]++;
OpenProjectList.propTypes = {
  classes: prop_types__WEBPACK_IMPORTED_MODULE_7___default.a.object.isRequired,
  t: prop_types__WEBPACK_IMPORTED_MODULE_7___default.a.func.isRequired,
  token: prop_types__WEBPACK_IMPORTED_MODULE_7___default.a.string.isRequired
};
cov_2gbpplgp8h().s[59]++;
OpenProjectList = Object(_material_ui_core_styles__WEBPACK_IMPORTED_MODULE_1__["withStyles"])(styles)(OpenProjectList);
cov_2gbpplgp8h().s[60]++;
OpenProjectList = Object(_i18n__WEBPACK_IMPORTED_MODULE_11__["withTranslation"])("select_project")(OpenProjectList);
cov_2gbpplgp8h().s[61]++;
OpenProjectList = Object(notistack__WEBPACK_IMPORTED_MODULE_6__["withSnackbar"])(OpenProjectList);

class SelectProject extends (react__WEBPACK_IMPORTED_MODULE_8___default.a.Component) {
  static async getInitialProps(ctx) {
    cov_2gbpplgp8h().f[10]++;
    cov_2gbpplgp8h().s[62]++;
    return {
      namespacesRequired: ["select_project"]
    };
  }

  render() {
    cov_2gbpplgp8h().f[11]++;
    const {
      t,
      classes,
      token
    } = (cov_2gbpplgp8h().s[63]++, this.props);
    cov_2gbpplgp8h().s[64]++;
    return __jsx("div", null, __jsx(next_head__WEBPACK_IMPORTED_MODULE_5___default.a, null, __jsx("title", null, t("title"))), __jsx(_components_BasicAppbar__WEBPACK_IMPORTED_MODULE_10__["default"], null), __jsx("main", {
      className: classes.main
    }, __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__["Paper"], {
      className: classes.paper
    }, __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__["Typography"], {
      className: classes.header,
      component: "h1",
      variant: "h5"
    }, t("header")), __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__["Typography"], {
      className: classes.subheader
    }, t("subheader")), __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__["Grid"], {
      container: true,
      direction: "column",
      spacing: 3,
      className: classes.grid
    }, __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__["Grid"], {
      item: true,
      xs: true
    }, __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__["Typography"], {
      className: classes.subsubheader
    }, t("new.header")), __jsx(NewProjectForm, {
      token: token
    })), __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__["Grid"], {
      item: true,
      xs: true
    }, __jsx(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__["Typography"], {
      className: classes.subsubheader
    }, t("open.header")), __jsx(OpenProjectList, {
      token: token
    }))))));
  }

}

cov_2gbpplgp8h().s[65]++;
SelectProject.propTypes = {
  classes: prop_types__WEBPACK_IMPORTED_MODULE_7___default.a.object.isRequired,
  t: prop_types__WEBPACK_IMPORTED_MODULE_7___default.a.func.isRequired
};
cov_2gbpplgp8h().s[66]++;
SelectProject = Object(_material_ui_core_styles__WEBPACK_IMPORTED_MODULE_1__["withStyles"])(styles)(SelectProject);
cov_2gbpplgp8h().s[67]++;
SelectProject = Object(_i18n__WEBPACK_IMPORTED_MODULE_11__["withTranslation"])("select_project")(SelectProject);
cov_2gbpplgp8h().s[68]++;
SelectProject = Object(_utils_auth__WEBPACK_IMPORTED_MODULE_13__["withAuthSync"])(SelectProject);
/* harmony default export */ __webpack_exports__["default"] = (SelectProject);

/***/ }),

/***/ "./utils/api.js":
/*!**********************!*\
  !*** ./utils/api.js ***!
  \**********************/
/*! exports provided: buildApiUrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "buildApiUrl", function() { return buildApiUrl; });
function cov_1xv8s2kwre() {
  var path = "/app/utils/api.js";
  var hash = "e725c53f863730158807be59c44cdae1663b8f49";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/app/utils/api.js",
    statementMap: {
      "0": {
        start: {
          line: 1,
          column: 25
        },
        end: {
          line: 5,
          column: 1
        }
      },
      "1": {
        start: {
          line: 8,
          column: 20
        },
        end: {
          line: 8,
          column: 33
        }
      },
      "2": {
        start: {
          line: 9,
          column: 2
        },
        end: {
          line: 14,
          column: 3
        }
      },
      "3": {
        start: {
          line: 10,
          column: 4
        },
        end: {
          line: 13,
          column: 5
        }
      },
      "4": {
        start: {
          line: 11,
          column: 6
        },
        end: {
          line: 11,
          column: 28
        }
      },
      "5": {
        start: {
          line: 12,
          column: 6
        },
        end: {
          line: 12,
          column: 12
        }
      },
      "6": {
        start: {
          line: 15,
          column: 2
        },
        end: {
          line: 15,
          column: 55
        }
      }
    },
    fnMap: {
      "0": {
        name: "buildApiUrl",
        decl: {
          start: {
            line: 7,
            column: 16
          },
          end: {
            line: 7,
            column: 27
          }
        },
        loc: {
          start: {
            line: 7,
            column: 34
          },
          end: {
            line: 16,
            column: 1
          }
        },
        line: 7
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 10,
            column: 4
          },
          end: {
            line: 13,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 10,
            column: 4
          },
          end: {
            line: 13,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 10
      }
    },
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0
    },
    f: {
      "0": 0
    },
    b: {
      "0": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "e725c53f863730158807be59c44cdae1663b8f49"
  };
  var coverage = global[gcv] || (global[gcv] = {});

  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }

  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_1xv8s2kwre = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}

cov_1xv8s2kwre();
const KNOWN_HOST_PAIRS = (cov_1xv8s2kwre().s[0]++, [["localhost", "localhost:8000",], ["staging.app.dymaxionlabs.com", "staging.api.dymaxionlabs.com"], ["app.dymaxionlabs.com", "api.dymaxionlabs.com"]]);
function buildApiUrl(path) {
  cov_1xv8s2kwre().f[0]++;
  let apiHostname = (cov_1xv8s2kwre().s[1]++, location.host);
  cov_1xv8s2kwre().s[2]++;

  for (const [webHost, apiHost] of KNOWN_HOST_PAIRS) {
    cov_1xv8s2kwre().s[3]++;

    if (location.hostname === webHost) {
      cov_1xv8s2kwre().b[0][0]++;
      cov_1xv8s2kwre().s[4]++;
      apiHostname = apiHost;
      cov_1xv8s2kwre().s[5]++;
      break;
    } else {
      cov_1xv8s2kwre().b[0][1]++;
    }
  }

  cov_1xv8s2kwre().s[6]++;
  return `${location.protocol}//${apiHostname}${path}`;
}

/***/ }),

/***/ "./utils/auth.js":
/*!***********************!*\
  !*** ./utils/auth.js ***!
  \***********************/
/*! exports provided: login, logout, withAuthSync, auth */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "login", function() { return login; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "logout", function() { return logout; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "withAuthSync", function() { return withAuthSync; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "auth", function() { return auth; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./router */ "./utils/router.js");
/* harmony import */ var next_cookies__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-cookies */ "next-cookies");
/* harmony import */ var next_cookies__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_cookies__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var js_cookie__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! js-cookie */ "js-cookie");
/* harmony import */ var js_cookie__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(js_cookie__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var querystring__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! querystring */ "querystring");
/* harmony import */ var querystring__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(querystring__WEBPACK_IMPORTED_MODULE_4__);

var __jsx = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement;

function cov_x5zj9i19m() {
  var path = "/app/utils/auth.js";
  var hash = "2af65f68ecdb29d4fb800a91db75049a8aaeff08";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/app/utils/auth.js",
    statementMap: {
      "0": {
        start: {
          line: 7,
          column: 21
        },
        end: {
          line: 19,
          column: 1
        }
      },
      "1": {
        start: {
          line: 13,
          column: 2
        },
        end: {
          line: 13,
          column: 51
        }
      },
      "2": {
        start: {
          line: 14,
          column: 2
        },
        end: {
          line: 14,
          column: 57
        }
      },
      "3": {
        start: {
          line: 15,
          column: 2
        },
        end: {
          line: 17,
          column: 3
        }
      },
      "4": {
        start: {
          line: 16,
          column: 4
        },
        end: {
          line: 16,
          column: 25
        }
      },
      "5": {
        start: {
          line: 18,
          column: 2
        },
        end: {
          line: 18,
          column: 25
        }
      },
      "6": {
        start: {
          line: 21,
          column: 22
        },
        end: {
          line: 28,
          column: 1
        }
      },
      "7": {
        start: {
          line: 22,
          column: 2
        },
        end: {
          line: 22,
          column: 25
        }
      },
      "8": {
        start: {
          line: 23,
          column: 2
        },
        end: {
          line: 23,
          column: 28
        }
      },
      "9": {
        start: {
          line: 24,
          column: 2
        },
        end: {
          line: 24,
          column: 27
        }
      },
      "10": {
        start: {
          line: 26,
          column: 2
        },
        end: {
          line: 26,
          column: 52
        }
      },
      "11": {
        start: {
          line: 27,
          column: 2
        },
        end: {
          line: 27,
          column: 23
        }
      },
      "12": {
        start: {
          line: 31,
          column: 23
        },
        end: {
          line: 32,
          column: 56
        }
      },
      "13": {
        start: {
          line: 32,
          column: 2
        },
        end: {
          line: 32,
          column: 56
        }
      },
      "14": {
        start: {
          line: 34,
          column: 28
        },
        end: {
          line: 78,
          column: 3
        }
      },
      "15": {
        start: {
          line: 35,
          column: 2
        },
        end: {
          line: 78,
          column: 3
        }
      },
      "16": {
        start: {
          line: 36,
          column: 25
        },
        end: {
          line: 36,
          column: 76
        }
      },
      "17": {
        start: {
          line: 39,
          column: 27
        },
        end: {
          line: 39,
          column: 40
        }
      },
      "18": {
        start: {
          line: 40,
          column: 34
        },
        end: {
          line: 40,
          column: 53
        }
      },
      "19": {
        start: {
          line: 43,
          column: 8
        },
        end: {
          line: 44,
          column: 53
        }
      },
      "20": {
        start: {
          line: 46,
          column: 6
        },
        end: {
          line: 46,
          column: 52
        }
      },
      "21": {
        start: {
          line: 50,
          column: 6
        },
        end: {
          line: 50,
          column: 19
        }
      },
      "22": {
        start: {
          line: 52,
          column: 6
        },
        end: {
          line: 52,
          column: 51
        }
      },
      "23": {
        start: {
          line: 56,
          column: 6
        },
        end: {
          line: 56,
          column: 58
        }
      },
      "24": {
        start: {
          line: 60,
          column: 6
        },
        end: {
          line: 60,
          column: 61
        }
      },
      "25": {
        start: {
          line: 61,
          column: 6
        },
        end: {
          line: 61,
          column: 47
        }
      },
      "26": {
        start: {
          line: 65,
          column: 6
        },
        end: {
          line: 68,
          column: 7
        }
      },
      "27": {
        start: {
          line: 66,
          column: 8
        },
        end: {
          line: 66,
          column: 48
        }
      },
      "28": {
        start: {
          line: 67,
          column: 8
        },
        end: {
          line: 67,
          column: 24
        }
      },
      "29": {
        start: {
          line: 72,
          column: 6
        },
        end: {
          line: 72,
          column: 27
        }
      },
      "30": {
        start: {
          line: 76,
          column: 6
        },
        end: {
          line: 76,
          column: 50
        }
      },
      "31": {
        start: {
          line: 80,
          column: 20
        },
        end: {
          line: 101,
          column: 1
        }
      },
      "32": {
        start: {
          line: 81,
          column: 30
        },
        end: {
          line: 81,
          column: 45
        }
      },
      "33": {
        start: {
          line: 83,
          column: 2
        },
        end: {
          line: 85,
          column: 3
        }
      },
      "34": {
        start: {
          line: 84,
          column: 4
        },
        end: {
          line: 84,
          column: 20
        }
      },
      "35": {
        start: {
          line: 87,
          column: 2
        },
        end: {
          line: 98,
          column: 3
        }
      },
      "36": {
        start: {
          line: 88,
          column: 4
        },
        end: {
          line: 97,
          column: 5
        }
      },
      "37": {
        start: {
          line: 89,
          column: 6
        },
        end: {
          line: 96,
          column: 7
        }
      },
      "38": {
        start: {
          line: 90,
          column: 22
        },
        end: {
          line: 90,
          column: 70
        }
      },
      "39": {
        start: {
          line: 91,
          column: 8
        },
        end: {
          line: 91,
          column: 64
        }
      },
      "40": {
        start: {
          line: 92,
          column: 8
        },
        end: {
          line: 92,
          column: 22
        }
      },
      "41": {
        start: {
          line: 93,
          column: 8
        },
        end: {
          line: 93,
          column: 15
        }
      },
      "42": {
        start: {
          line: 95,
          column: 8
        },
        end: {
          line: 95,
          column: 29
        }
      },
      "43": {
        start: {
          line: 100,
          column: 2
        },
        end: {
          line: 100,
          column: 29
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 7,
            column: 21
          },
          end: {
            line: 7,
            column: 22
          }
        },
        loc: {
          start: {
            line: 12,
            column: 6
          },
          end: {
            line: 19,
            column: 1
          }
        },
        line: 12
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 21,
            column: 22
          },
          end: {
            line: 21,
            column: 23
          }
        },
        loc: {
          start: {
            line: 21,
            column: 28
          },
          end: {
            line: 28,
            column: 1
          }
        },
        line: 21
      },
      "2": {
        name: "(anonymous_2)",
        decl: {
          start: {
            line: 31,
            column: 23
          },
          end: {
            line: 31,
            column: 24
          }
        },
        loc: {
          start: {
            line: 32,
            column: 2
          },
          end: {
            line: 32,
            column: 56
          }
        },
        line: 32
      },
      "3": {
        name: "(anonymous_3)",
        decl: {
          start: {
            line: 34,
            column: 28
          },
          end: {
            line: 34,
            column: 29
          }
        },
        loc: {
          start: {
            line: 35,
            column: 2
          },
          end: {
            line: 78,
            column: 3
          }
        },
        line: 35
      },
      "4": {
        name: "(anonymous_4)",
        decl: {
          start: {
            line: 38,
            column: 4
          },
          end: {
            line: 38,
            column: 5
          }
        },
        loc: {
          start: {
            line: 38,
            column: 38
          },
          end: {
            line: 47,
            column: 5
          }
        },
        line: 38
      },
      "5": {
        name: "(anonymous_5)",
        decl: {
          start: {
            line: 49,
            column: 4
          },
          end: {
            line: 49,
            column: 5
          }
        },
        loc: {
          start: {
            line: 49,
            column: 23
          },
          end: {
            line: 53,
            column: 5
          }
        },
        line: 49
      },
      "6": {
        name: "(anonymous_6)",
        decl: {
          start: {
            line: 55,
            column: 4
          },
          end: {
            line: 55,
            column: 5
          }
        },
        loc: {
          start: {
            line: 55,
            column: 24
          },
          end: {
            line: 57,
            column: 5
          }
        },
        line: 55
      },
      "7": {
        name: "(anonymous_7)",
        decl: {
          start: {
            line: 59,
            column: 4
          },
          end: {
            line: 59,
            column: 5
          }
        },
        loc: {
          start: {
            line: 59,
            column: 27
          },
          end: {
            line: 62,
            column: 5
          }
        },
        line: 59
      },
      "8": {
        name: "(anonymous_8)",
        decl: {
          start: {
            line: 64,
            column: 4
          },
          end: {
            line: 64,
            column: 5
          }
        },
        loc: {
          start: {
            line: 64,
            column: 22
          },
          end: {
            line: 69,
            column: 5
          }
        },
        line: 64
      },
      "9": {
        name: "(anonymous_9)",
        decl: {
          start: {
            line: 71,
            column: 4
          },
          end: {
            line: 71,
            column: 5
          }
        },
        loc: {
          start: {
            line: 71,
            column: 15
          },
          end: {
            line: 73,
            column: 5
          }
        },
        line: 71
      },
      "10": {
        name: "(anonymous_10)",
        decl: {
          start: {
            line: 75,
            column: 4
          },
          end: {
            line: 75,
            column: 5
          }
        },
        loc: {
          start: {
            line: 75,
            column: 13
          },
          end: {
            line: 77,
            column: 5
          }
        },
        line: 75
      },
      "11": {
        name: "(anonymous_11)",
        decl: {
          start: {
            line: 80,
            column: 20
          },
          end: {
            line: 80,
            column: 21
          }
        },
        loc: {
          start: {
            line: 80,
            column: 39
          },
          end: {
            line: 101,
            column: 1
          }
        },
        line: 80
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 11,
            column: 2
          },
          end: {
            line: 11,
            column: 22
          }
        },
        type: "default-arg",
        locations: [{
          start: {
            line: 11,
            column: 15
          },
          end: {
            line: 11,
            column: 22
          }
        }],
        line: 11
      },
      "1": {
        loc: {
          start: {
            line: 15,
            column: 2
          },
          end: {
            line: 17,
            column: 3
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 15,
            column: 2
          },
          end: {
            line: 17,
            column: 3
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 15
      },
      "2": {
        loc: {
          start: {
            line: 32,
            column: 2
          },
          end: {
            line: 32,
            column: 56
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 32,
            column: 2
          },
          end: {
            line: 32,
            column: 23
          }
        }, {
          start: {
            line: 32,
            column: 27
          },
          end: {
            line: 32,
            column: 41
          }
        }, {
          start: {
            line: 32,
            column: 45
          },
          end: {
            line: 32,
            column: 56
          }
        }],
        line: 32
      },
      "3": {
        loc: {
          start: {
            line: 39,
            column: 27
          },
          end: {
            line: 39,
            column: 40
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 39,
            column: 27
          },
          end: {
            line: 39,
            column: 34
          }
        }, {
          start: {
            line: 39,
            column: 38
          },
          end: {
            line: 39,
            column: 40
          }
        }],
        line: 39
      },
      "4": {
        loc: {
          start: {
            line: 43,
            column: 8
          },
          end: {
            line: 44,
            column: 53
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 43,
            column: 8
          },
          end: {
            line: 43,
            column: 40
          }
        }, {
          start: {
            line: 44,
            column: 9
          },
          end: {
            line: 44,
            column: 52
          }
        }],
        line: 43
      },
      "5": {
        loc: {
          start: {
            line: 65,
            column: 6
          },
          end: {
            line: 68,
            column: 7
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 65,
            column: 6
          },
          end: {
            line: 68,
            column: 7
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 65
      },
      "6": {
        loc: {
          start: {
            line: 83,
            column: 2
          },
          end: {
            line: 85,
            column: 3
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 83,
            column: 2
          },
          end: {
            line: 85,
            column: 3
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 83
      },
      "7": {
        loc: {
          start: {
            line: 87,
            column: 2
          },
          end: {
            line: 98,
            column: 3
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 87,
            column: 2
          },
          end: {
            line: 98,
            column: 3
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 87
      },
      "8": {
        loc: {
          start: {
            line: 88,
            column: 4
          },
          end: {
            line: 97,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 88,
            column: 4
          },
          end: {
            line: 97,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 88
      },
      "9": {
        loc: {
          start: {
            line: 88,
            column: 8
          },
          end: {
            line: 88,
            column: 27
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 88,
            column: 8
          },
          end: {
            line: 88,
            column: 14
          }
        }, {
          start: {
            line: 88,
            column: 18
          },
          end: {
            line: 88,
            column: 27
          }
        }],
        line: 88
      },
      "10": {
        loc: {
          start: {
            line: 89,
            column: 6
          },
          end: {
            line: 96,
            column: 7
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 89,
            column: 6
          },
          end: {
            line: 96,
            column: 7
          }
        }, {
          start: {
            line: 94,
            column: 13
          },
          end: {
            line: 96,
            column: 7
          }
        }],
        line: 89
      }
    },
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 0,
      "16": 0,
      "17": 0,
      "18": 0,
      "19": 0,
      "20": 0,
      "21": 0,
      "22": 0,
      "23": 0,
      "24": 0,
      "25": 0,
      "26": 0,
      "27": 0,
      "28": 0,
      "29": 0,
      "30": 0,
      "31": 0,
      "32": 0,
      "33": 0,
      "34": 0,
      "35": 0,
      "36": 0,
      "37": 0,
      "38": 0,
      "39": 0,
      "40": 0,
      "41": 0,
      "42": 0,
      "43": 0
    },
    f: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0
    },
    b: {
      "0": [0],
      "1": [0, 0],
      "2": [0, 0, 0],
      "3": [0, 0],
      "4": [0, 0],
      "5": [0, 0],
      "6": [0, 0],
      "7": [0, 0],
      "8": [0, 0],
      "9": [0, 0],
      "10": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "2af65f68ecdb29d4fb800a91db75049a8aaeff08"
  };
  var coverage = global[gcv] || (global[gcv] = {});

  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }

  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_x5zj9i19m = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}

cov_x5zj9i19m();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }






cov_x5zj9i19m().s[0]++;
const login = async ({
  username,
  token,
  expires,
  redirectTo = (cov_x5zj9i19m().b[0][0]++, "/home")
}) => {
  cov_x5zj9i19m().f[0]++;
  cov_x5zj9i19m().s[1]++;
  js_cookie__WEBPACK_IMPORTED_MODULE_3___default.a.set("token", token, {
    expires: expires
  });
  cov_x5zj9i19m().s[2]++;
  js_cookie__WEBPACK_IMPORTED_MODULE_3___default.a.set("username", username, {
    expires: expires
  });
  cov_x5zj9i19m().s[3]++;

  if (!redirectTo) {
    cov_x5zj9i19m().b[1][0]++;
    cov_x5zj9i19m().s[4]++;
    redirectTo = "/home";
  } else {
    cov_x5zj9i19m().b[1][1]++;
  }

  cov_x5zj9i19m().s[5]++;
  Object(_router__WEBPACK_IMPORTED_MODULE_1__["routerPush"])(redirectTo);
};
cov_x5zj9i19m().s[6]++;
const logout = () => {
  cov_x5zj9i19m().f[1]++;
  cov_x5zj9i19m().s[7]++;
  js_cookie__WEBPACK_IMPORTED_MODULE_3___default.a.remove("token");
  cov_x5zj9i19m().s[8]++;
  js_cookie__WEBPACK_IMPORTED_MODULE_3___default.a.remove("username");
  cov_x5zj9i19m().s[9]++;
  js_cookie__WEBPACK_IMPORTED_MODULE_3___default.a.remove("project"); // to support logging out from all windows

  cov_x5zj9i19m().s[10]++;
  window.localStorage.setItem("logout", Date.now());
  cov_x5zj9i19m().s[11]++;
  Object(_router__WEBPACK_IMPORTED_MODULE_1__["routerPush"])("/login");
}; // Gets the display name of a JSX component for dev tools

cov_x5zj9i19m().s[12]++;

const getDisplayName = Component => {
  cov_x5zj9i19m().f[2]++;
  cov_x5zj9i19m().s[13]++;
  return (cov_x5zj9i19m().b[2][0]++, Component.displayName) || (cov_x5zj9i19m().b[2][1]++, Component.name) || (cov_x5zj9i19m().b[2][2]++, "Component");
};

cov_x5zj9i19m().s[14]++;
const withAuthSync = (WrappedComponent, options) => {
  var _class, _temp;

  cov_x5zj9i19m().f[3]++;
  cov_x5zj9i19m().s[15]++;
  return _temp = _class = class extends react__WEBPACK_IMPORTED_MODULE_0__["Component"] {
    static async getInitialProps(ctx) {
      cov_x5zj9i19m().f[4]++;
      const {
        redirect
      } = (cov_x5zj9i19m().s[17]++, (cov_x5zj9i19m().b[3][0]++, options) || (cov_x5zj9i19m().b[3][1]++, {}));
      const {
        username,
        token
      } = (cov_x5zj9i19m().s[18]++, auth(ctx, redirect));
      const componentProps = (cov_x5zj9i19m().s[19]++, (cov_x5zj9i19m().b[4][0]++, WrappedComponent.getInitialProps) && (cov_x5zj9i19m().b[4][1]++, await WrappedComponent.getInitialProps(ctx)));
      cov_x5zj9i19m().s[20]++;
      return _objectSpread(_objectSpread({}, componentProps), {}, {
        username,
        token
      });
    }

    constructor(props) {
      cov_x5zj9i19m().f[5]++;
      cov_x5zj9i19m().s[21]++;
      super(props);
      cov_x5zj9i19m().s[22]++;
      this.syncLogout = this.syncLogout.bind(this);
    }

    componentDidMount() {
      cov_x5zj9i19m().f[6]++;
      cov_x5zj9i19m().s[23]++;
      window.addEventListener("storage", this.syncLogout);
    }

    componentWillUnmount() {
      cov_x5zj9i19m().f[7]++;
      cov_x5zj9i19m().s[24]++;
      window.removeEventListener("storage", this.syncLogout);
      cov_x5zj9i19m().s[25]++;
      window.localStorage.removeItem("logout");
    }

    syncLogout(event) {
      cov_x5zj9i19m().f[8]++;
      cov_x5zj9i19m().s[26]++;

      if (event.key === "logout") {
        cov_x5zj9i19m().b[5][0]++;
        cov_x5zj9i19m().s[27]++;
        console.log("logged out from storage!");
        cov_x5zj9i19m().s[28]++;
        this.onLogout();
      } else {
        cov_x5zj9i19m().b[5][1]++;
      }
    }

    onLogout() {
      cov_x5zj9i19m().f[9]++;
      cov_x5zj9i19m().s[29]++;
      Object(_router__WEBPACK_IMPORTED_MODULE_1__["routerPush"])("/login");
    }

    render() {
      cov_x5zj9i19m().f[10]++;
      cov_x5zj9i19m().s[30]++;
      return __jsx(WrappedComponent, this.props);
    }

  }, _defineProperty(_class, "displayName", (cov_x5zj9i19m().s[16]++, `withAuthSync(${getDisplayName(WrappedComponent)})`)), _temp;
};
cov_x5zj9i19m().s[31]++;
const auth = (ctx, redirect) => {
  cov_x5zj9i19m().f[11]++;
  const {
    username,
    token
  } = (cov_x5zj9i19m().s[32]++, next_cookies__WEBPACK_IMPORTED_MODULE_2___default()(ctx));
  cov_x5zj9i19m().s[33]++;

  if (typeof redirect === "undefined") {
    cov_x5zj9i19m().b[6][0]++;
    cov_x5zj9i19m().s[34]++;
    redirect = true;
  } else {
    cov_x5zj9i19m().b[6][1]++;
  }

  cov_x5zj9i19m().s[35]++;

  if (redirect) {
    cov_x5zj9i19m().b[7][0]++;
    cov_x5zj9i19m().s[36]++;

    if ((cov_x5zj9i19m().b[9][0]++, !token) || (cov_x5zj9i19m().b[9][1]++, !username)) {
      cov_x5zj9i19m().b[8][0]++;
      cov_x5zj9i19m().s[37]++;

      if (ctx.req) {
        cov_x5zj9i19m().b[10][0]++;
        const query = (cov_x5zj9i19m().s[38]++, querystring__WEBPACK_IMPORTED_MODULE_4___default.a.stringify({
          redirect: ctx.req.url
        }));
        cov_x5zj9i19m().s[39]++;
        ctx.res.writeHead(302, {
          Location: `/login?${query}`
        });
        cov_x5zj9i19m().s[40]++;
        ctx.res.end();
        cov_x5zj9i19m().s[41]++;
        return;
      } else {
        cov_x5zj9i19m().b[10][1]++;
        cov_x5zj9i19m().s[42]++;
        Object(_router__WEBPACK_IMPORTED_MODULE_1__["routerPush"])("/login");
      }
    } else {
      cov_x5zj9i19m().b[8][1]++;
    }
  } else {
    cov_x5zj9i19m().b[7][1]++;
  }

  cov_x5zj9i19m().s[43]++;
  return {
    username,
    token
  };
};

/***/ }),

/***/ "./utils/router.js":
/*!*************************!*\
  !*** ./utils/router.js ***!
  \*************************/
/*! exports provided: routerPush, routerReplace */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "routerPush", function() { return routerPush; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "routerReplace", function() { return routerReplace; });
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/router */ "next/router");
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_0__);
function cov_2ohzlstnbs() {
  var path = "/app/utils/router.js";
  var hash = "c5c3353a65eff97ced96a5dd9317dce60dfe3be7";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/app/utils/router.js",
    statementMap: {
      "0": {
        start: {
          line: 4,
          column: 26
        },
        end: {
          line: 11,
          column: 1
        }
      },
      "1": {
        start: {
          line: 5,
          column: 15
        },
        end: {
          line: 5,
          column: 38
        }
      },
      "2": {
        start: {
          line: 6,
          column: 2
        },
        end: {
          line: 10,
          column: 3
        }
      },
      "3": {
        start: {
          line: 7,
          column: 4
        },
        end: {
          line: 7,
          column: 32
        }
      },
      "4": {
        start: {
          line: 9,
          column: 4
        },
        end: {
          line: 9,
          column: 22
        }
      },
      "5": {
        start: {
          line: 14,
          column: 29
        },
        end: {
          line: 21,
          column: 1
        }
      },
      "6": {
        start: {
          line: 15,
          column: 15
        },
        end: {
          line: 15,
          column: 38
        }
      },
      "7": {
        start: {
          line: 16,
          column: 2
        },
        end: {
          line: 20,
          column: 3
        }
      },
      "8": {
        start: {
          line: 17,
          column: 4
        },
        end: {
          line: 17,
          column: 34
        }
      },
      "9": {
        start: {
          line: 19,
          column: 4
        },
        end: {
          line: 19,
          column: 25
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 4,
            column: 26
          },
          end: {
            line: 4,
            column: 27
          }
        },
        loc: {
          start: {
            line: 4,
            column: 34
          },
          end: {
            line: 11,
            column: 1
          }
        },
        line: 4
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 14,
            column: 29
          },
          end: {
            line: 14,
            column: 30
          }
        },
        loc: {
          start: {
            line: 14,
            column: 37
          },
          end: {
            line: 21,
            column: 1
          }
        },
        line: 14
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 6,
            column: 2
          },
          end: {
            line: 10,
            column: 3
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 6,
            column: 2
          },
          end: {
            line: 10,
            column: 3
          }
        }, {
          start: {
            line: 8,
            column: 9
          },
          end: {
            line: 10,
            column: 3
          }
        }],
        line: 6
      },
      "1": {
        loc: {
          start: {
            line: 16,
            column: 2
          },
          end: {
            line: 20,
            column: 3
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 16,
            column: 2
          },
          end: {
            line: 20,
            column: 3
          }
        }, {
          start: {
            line: 18,
            column: 9
          },
          end: {
            line: 20,
            column: 3
          }
        }],
        line: 16
      }
    },
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0
    },
    f: {
      "0": 0,
      "1": 0
    },
    b: {
      "0": [0, 0],
      "1": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "c5c3353a65eff97ced96a5dd9317dce60dfe3be7"
  };
  var coverage = global[gcv] || (global[gcv] = {});

  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }

  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_2ohzlstnbs = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}

cov_2ohzlstnbs();
 // UGLY FIX FOR IE11

cov_2ohzlstnbs().s[0]++;
const routerPush = path => {
  cov_2ohzlstnbs().f[0]++;
  const isIE = (cov_2ohzlstnbs().s[1]++, !!document.documentMode);
  cov_2ohzlstnbs().s[2]++;

  if (isIE) {
    cov_2ohzlstnbs().b[0][0]++;
    cov_2ohzlstnbs().s[3]++;
    window.location.href = path;
  } else {
    cov_2ohzlstnbs().b[0][1]++;
    cov_2ohzlstnbs().s[4]++;
    next_router__WEBPACK_IMPORTED_MODULE_0___default.a.push(path);
  }
}; // UGLY FIX FOR IE11

cov_2ohzlstnbs().s[5]++;
const routerReplace = path => {
  cov_2ohzlstnbs().f[1]++;
  const isIE = (cov_2ohzlstnbs().s[6]++, !!document.documentMode);
  cov_2ohzlstnbs().s[7]++;

  if (isIE) {
    cov_2ohzlstnbs().b[1][0]++;
    cov_2ohzlstnbs().s[8]++;
    window.location.replace(path);
  } else {
    cov_2ohzlstnbs().b[1][1]++;
    cov_2ohzlstnbs().s[9]++;
    next_router__WEBPACK_IMPORTED_MODULE_0___default.a.replace(path);
  }
};

/***/ }),

/***/ 6:
/*!***************************************!*\
  !*** multi ./pages/select-project.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /app/pages/select-project.js */"./pages/select-project.js");


/***/ }),

/***/ "@material-ui/core":
/*!************************************!*\
  !*** external "@material-ui/core" ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@material-ui/core");

/***/ }),

/***/ "@material-ui/core/styles":
/*!*******************************************!*\
  !*** external "@material-ui/core/styles" ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@material-ui/core/styles");

/***/ }),

/***/ "@material-ui/icons/Folder":
/*!********************************************!*\
  !*** external "@material-ui/icons/Folder" ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@material-ui/icons/Folder");

/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("axios");

/***/ }),

/***/ "js-cookie":
/*!****************************!*\
  !*** external "js-cookie" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("js-cookie");

/***/ }),

/***/ "next-cookies":
/*!*******************************!*\
  !*** external "next-cookies" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("next-cookies");

/***/ }),

/***/ "next-i18next":
/*!*******************************!*\
  !*** external "next-i18next" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("next-i18next");

/***/ }),

/***/ "next/head":
/*!****************************!*\
  !*** external "next/head" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("next/head");

/***/ }),

/***/ "next/router":
/*!******************************!*\
  !*** external "next/router" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("next/router");

/***/ }),

/***/ "notistack":
/*!****************************!*\
  !*** external "notistack" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("notistack");

/***/ }),

/***/ "prop-types":
/*!*****************************!*\
  !*** external "prop-types" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("prop-types");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("querystring");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react");

/***/ }),

/***/ "react-moment":
/*!*******************************!*\
  !*** external "react-moment" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-moment");

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vY29tcG9uZW50cy9CYXNpY0FwcGJhci5qcyIsIndlYnBhY2s6Ly8vLi9jb21wb25lbnRzL1NpZ251cEJ1dHRvbi5qcyIsIndlYnBhY2s6Ly8vLi9pMThuLmpzIiwid2VicGFjazovLy8uL3BhZ2VzL3NlbGVjdC1wcm9qZWN0LmpzIiwid2VicGFjazovLy8uL3V0aWxzL2FwaS5qcyIsIndlYnBhY2s6Ly8vLi91dGlscy9hdXRoLmpzIiwid2VicGFjazovLy8uL3V0aWxzL3JvdXRlci5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJAbWF0ZXJpYWwtdWkvY29yZVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcIkBtYXRlcmlhbC11aS9jb3JlL3N0eWxlc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcIkBtYXRlcmlhbC11aS9pY29ucy9Gb2xkZXJcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJheGlvc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImpzLWNvb2tpZVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcIm5leHQtY29va2llc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcIm5leHQtaTE4bmV4dFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcIm5leHQvaGVhZFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcIm5leHQvcm91dGVyXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwibm90aXN0YWNrXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicHJvcC10eXBlc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcInF1ZXJ5c3RyaW5nXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVhY3RcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZWFjdC1tb21lbnRcIiJdLCJuYW1lcyI6WyJzdHlsZXMiLCJ0aGVtZSIsImFwcEJhciIsInBvc2l0aW9uIiwibG9nbyIsImhlaWdodCIsIm1hcmdpblJpZ2h0Iiwic3BhY2luZyIsImN1cnNvciIsInRpdGxlIiwicmlnaHQiLCJtYXJnaW5MZWZ0IiwiQmFzaWNBcHBiYXIiLCJ3aXRoU3R5bGVzIiwiY2xhc3NlcyIsInNob3dNb2RlQnV0dG9uIiwic2hvd1NpZ25VcCIsIm1vZGVCdXR0b25UZXh0Iiwib25Nb2RlQnV0dG9uQ2xpY2siLCJwcm9wVHlwZXMiLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIiwiYm9vbCIsInN0cmluZyIsImRlZmF1bHRQcm9wcyIsImJ0biIsIm1hcmdpbiIsInpJbmRleCIsIlNpZ251cEJ1dHRvbiIsInQiLCJmdW5jIiwid2l0aFRyYW5zbGF0aW9uIiwiTmV4dEkxOE5leHQiLCJyZXF1aXJlIiwiZGVmYXVsdCIsIm1vZHVsZSIsImV4cG9ydHMiLCJkZWZhdWx0TGFuZ3VhZ2UiLCJvdGhlckxhbmd1YWdlcyIsImJyb3dzZXJMYW5ndWFnZURldGVjdGlvbiIsIm1haW4iLCJ3aWR0aCIsImRpc3BsYXkiLCJicmVha3BvaW50cyIsInVwIiwicGFwZXIiLCJtYXJnaW5Ub3AiLCJmbGV4RGlyZWN0aW9uIiwiYWxpZ25JdGVtcyIsInBhZGRpbmciLCJzdWJoZWFkZXIiLCJtYXJnaW5Cb3R0b20iLCJzdWJzdWJoZWFkZXIiLCJmb250V2VpZ2h0IiwiZ3JpZCIsImZsZXhHcm93IiwibGlzdCIsIm92ZXJmbG93IiwibWF4SGVpZ2h0IiwiaW5saW5lRm9ybUNvbnRhaW5lciIsImlubGluZUZvcm1Db250cm9sIiwiTmV3UHJvamVjdEZvcm0iLCJSZWFjdCIsIkNvbXBvbmVudCIsInN1Ym1pdHRpbmciLCJuYW1lIiwiZSIsInNldFN0YXRlIiwidGFyZ2V0IiwidmFsdWUiLCJwcmV2ZW50RGVmYXVsdCIsInRva2VuIiwicHJvcHMiLCJzdGF0ZSIsInJlc3BvbnNlIiwiYXhpb3MiLCJwb3N0IiwiYnVpbGRBcGlVcmwiLCJoZWFkZXJzIiwiaTE4biIsImxhbmd1YWdlIiwiQXV0aG9yaXphdGlvbiIsInV1aWQiLCJkYXRhIiwiY29va2llIiwic2V0Iiwicm91dGVyUHVzaCIsImVyciIsInN0YXR1cyIsImxvZ291dCIsImNvbnNvbGUiLCJlcnJvciIsImVucXVldWVTbmFja2JhciIsInZhcmlhbnQiLCJyZW5kZXIiLCJmb3JtIiwiaGFuZGxlU3VibWl0IiwiaGFuZGxlQ2hhbmdlIiwid2l0aFNuYWNrYmFyIiwiUFJPSkVDVFNfUEVSX1BBR0UiLCJPcGVuUHJvamVjdExpc3QiLCJsb2FkaW5nIiwicmVzdWx0cyIsImNvdW50IiwicHJvamVjdCIsImNvbXBvbmVudERpZE1vdW50IiwiZ2V0UHJvamVjdHMiLCJnZXQiLCJoYW5kbGVTZWxlY3RQcm9qZWN0IiwibG9jYWxlIiwibGVuZ3RoIiwibWFwIiwidXBkYXRlZF9hdCIsImNvbGxhYm9yYXRvcnMiLCJqb2luIiwiU2VsZWN0UHJvamVjdCIsImdldEluaXRpYWxQcm9wcyIsImN0eCIsIm5hbWVzcGFjZXNSZXF1aXJlZCIsImhlYWRlciIsIndpdGhBdXRoU3luYyIsIktOT1dOX0hPU1RfUEFJUlMiLCJwYXRoIiwiYXBpSG9zdG5hbWUiLCJsb2NhdGlvbiIsImhvc3QiLCJ3ZWJIb3N0IiwiYXBpSG9zdCIsImhvc3RuYW1lIiwicHJvdG9jb2wiLCJsb2dpbiIsInVzZXJuYW1lIiwiZXhwaXJlcyIsInJlZGlyZWN0VG8iLCJyZW1vdmUiLCJ3aW5kb3ciLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwiRGF0ZSIsIm5vdyIsImdldERpc3BsYXlOYW1lIiwiZGlzcGxheU5hbWUiLCJXcmFwcGVkQ29tcG9uZW50Iiwib3B0aW9ucyIsInJlZGlyZWN0IiwiYXV0aCIsImNvbXBvbmVudFByb3BzIiwiY29uc3RydWN0b3IiLCJzeW5jTG9nb3V0IiwiYmluZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJyZW1vdmVJdGVtIiwiZXZlbnQiLCJrZXkiLCJsb2ciLCJvbkxvZ291dCIsIm5leHRDb29raWUiLCJyZXEiLCJxdWVyeSIsInF1ZXJ5c3RyaW5nIiwic3RyaW5naWZ5IiwidXJsIiwicmVzIiwid3JpdGVIZWFkIiwiTG9jYXRpb24iLCJlbmQiLCJpc0lFIiwiZG9jdW1lbnQiLCJkb2N1bWVudE1vZGUiLCJocmVmIiwiUm91dGVyIiwicHVzaCIsInJvdXRlclJlcGxhY2UiLCJyZXBsYWNlIl0sIm1hcHBpbmdzIjoiOztRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EsSUFBSTtRQUNKO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNBQWlDO1FBQzFFLGdIQUFnSCxtQkFBbUIsRUFBRTtRQUNySTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDJCQUEyQiwwQkFBMEIsRUFBRTtRQUN2RCxpQ0FBaUMsZUFBZTtRQUNoRDtRQUNBO1FBQ0E7O1FBRUE7UUFDQSxzREFBc0QsK0RBQStEOztRQUVySDtRQUNBOzs7UUFHQTtRQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0FXOzs7Ozs7Ozs7Ozs7Ozs7O0FBZlo7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTyxNQUFNUSxLQUFLLEdBQUcsT0FBTztBQUMxQkMsVUFEMEI7QUFFMUI1RCxPQUYwQjtBQUcxQjZELFNBSDBCO0FBSTFC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UE0sQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNiUCw4Qzs7Ozs7Ozs7Ozs7QUNBQSxxRDs7Ozs7Ozs7Ozs7QUNBQSxzRDs7Ozs7Ozs7Ozs7QUNBQSxrQzs7Ozs7Ozs7Ozs7QUNBQSxzQzs7Ozs7Ozs7Ozs7QUNBQSx5Qzs7Ozs7Ozs7Ozs7QUNBQSx5Qzs7Ozs7Ozs7Ozs7QUNBQSxzQzs7Ozs7Ozs7Ozs7QUNBQSx3Qzs7Ozs7Ozs7Ozs7QUNBQSxzQzs7Ozs7Ozs7Ozs7QUNBQSx1Qzs7Ozs7Ozs7Ozs7QUNBQSx3Qzs7Ozs7Ozs7Ozs7QUNBQSxrQzs7Ozs7Ozs7Ozs7QUNBQSx5QyIsImZpbGUiOiJzdGF0aWMvZGV2ZWxvcG1lbnQvcGFnZXMvc2VsZWN0LXByb2plY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHJlcXVpcmUoJy4uLy4uLy4uL3Nzci1tb2R1bGUtY2FjaGUuanMnKTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0dmFyIHRocmV3ID0gdHJ1ZTtcbiBcdFx0dHJ5IHtcbiBcdFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcbiBcdFx0XHR0aHJldyA9IGZhbHNlO1xuIFx0XHR9IGZpbmFsbHkge1xuIFx0XHRcdGlmKHRocmV3KSBkZWxldGUgaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XG4gXHRcdH1cblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gNik7XG4iLCJpbXBvcnQgUHJvcFR5cGVzIGZyb20gXCJwcm9wLXR5cGVzXCI7XG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBMaW5rIH0gZnJvbSBcIi4uL2kxOG5cIjtcbmltcG9ydCB7IHdpdGhTdHlsZXMgfSBmcm9tIFwiQG1hdGVyaWFsLXVpL2NvcmUvc3R5bGVzXCI7XG5pbXBvcnQgU2lnbnVwQnV0dG9uIGZyb20gXCIuLi9jb21wb25lbnRzL1NpZ251cEJ1dHRvblwiO1xuXG5pbXBvcnQgeyBBcHBCYXIsIFRvb2xiYXIsIFR5cG9ncmFwaHksIEJ1dHRvbiB9IGZyb20gXCJAbWF0ZXJpYWwtdWkvY29yZVwiO1xuXG5jb25zdCBzdHlsZXMgPSAodGhlbWUpID0+ICh7XG4gIGFwcEJhcjoge1xuICAgIHBvc2l0aW9uOiBcInJlbGF0aXZlXCIsXG4gIH0sXG4gIGxvZ286IHtcbiAgICBoZWlnaHQ6IDI1LFxuICAgIG1hcmdpblJpZ2h0OiB0aGVtZS5zcGFjaW5nKDEpLFxuICAgIGN1cnNvcjogXCJwb2ludGVyXCIsXG4gIH0sXG4gIHRpdGxlOiB7XG4gICAgY3Vyc29yOiBcInBvaW50ZXJcIixcbiAgfSxcbiAgcmlnaHQ6IHtcbiAgICBtYXJnaW5MZWZ0OiBcImF1dG9cIixcbiAgfSxcbn0pO1xuXG5jb25zdCBCYXNpY0FwcGJhciA9IHdpdGhTdHlsZXMoc3R5bGVzKShcbiAgKHtcbiAgICBjbGFzc2VzLFxuICAgIHNob3dNb2RlQnV0dG9uLFxuICAgIHNob3dTaWduVXAsXG4gICAgbW9kZUJ1dHRvblRleHQsXG4gICAgb25Nb2RlQnV0dG9uQ2xpY2ssXG4gIH0pID0+IChcbiAgICA8QXBwQmFyIHBvc2l0aW9uPVwiYWJzb2x1dGVcIiBjb2xvcj1cImRlZmF1bHRcIiBjbGFzc05hbWU9e2NsYXNzZXMuYXBwQmFyfT5cbiAgICAgIDxUb29sYmFyPlxuICAgICAgICA8TGluayBocmVmPVwiL1wiPlxuICAgICAgICAgIDxpbWcgc3JjPVwiL3N0YXRpYy9sb2dvLnBuZ1wiIGNsYXNzTmFtZT17Y2xhc3Nlcy5sb2dvfSAvPlxuICAgICAgICA8L0xpbms+XG4gICAgICAgIDxMaW5rIGhyZWY9XCIvXCI+XG4gICAgICAgICAgPFR5cG9ncmFwaHlcbiAgICAgICAgICAgIHZhcmlhbnQ9XCJoNlwiXG4gICAgICAgICAgICBjb2xvcj1cImluaGVyaXRcIlxuICAgICAgICAgICAgbm9XcmFwXG4gICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXMudGl0bGV9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgRHltYXhpb24gTGFicyBQbGF0Zm9ybVxuICAgICAgICAgIDwvVHlwb2dyYXBoeT5cbiAgICAgICAgPC9MaW5rPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlcy5yaWdodH0+XG4gICAgICAgICAge3Nob3dNb2RlQnV0dG9uICYmIChcbiAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17b25Nb2RlQnV0dG9uQ2xpY2t9IHZhcmlhbnQ9XCJjb250YWluZWRcIj5cbiAgICAgICAgICAgICAge21vZGVCdXR0b25UZXh0fVxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgKX1cbiAgICAgICAgICB7c2hvd1NpZ25VcCAmJiA8U2lnbnVwQnV0dG9uIC8+fVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvVG9vbGJhcj5cbiAgICA8L0FwcEJhcj5cbiAgKVxuKTtcblxuQmFzaWNBcHBiYXIucHJvcFR5cGVzID0ge1xuICBjbGFzc2VzOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gIHNob3dTaWduVXA6IFByb3BUeXBlcy5ib29sLFxuICBzaG93TW9kZUJ1dHRvbjogUHJvcFR5cGVzLmJvb2wsXG4gIG1vZGVCdXR0b25UZXh0OiBQcm9wVHlwZXMuc3RyaW5nLFxufTtcblxuQmFzaWNBcHBiYXIuZGVmYXVsdFByb3BzID0ge1xuICBzaG93U2lnblVwOiBmYWxzZSxcbiAgc2hvd01vZGVCdXR0b246IGZhbHNlLFxuICBtb2RlQnV0dG9uVGV4dDogXCJcIixcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHdpdGhTdHlsZXMoc3R5bGVzKShCYXNpY0FwcGJhcik7XG4iLCJpbXBvcnQgUHJvcFR5cGVzIGZyb20gXCJwcm9wLXR5cGVzXCI7XG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB3aXRoVHJhbnNsYXRpb24gfSBmcm9tIFwiLi4vaTE4blwiO1xuaW1wb3J0IHsgTGluayB9IGZyb20gXCIuLi9pMThuXCI7XG5pbXBvcnQgeyB3aXRoU3R5bGVzIH0gZnJvbSBcIkBtYXRlcmlhbC11aS9jb3JlL3N0eWxlc1wiO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSBcIkBtYXRlcmlhbC11aS9jb3JlXCI7XG5cbmNvbnN0IHN0eWxlcyA9ICh0aGVtZSkgPT4gKHtcbiAgYnRuOiB7XG4gICAgbWFyZ2luOiB0aGVtZS5zcGFjaW5nKDEpLFxuICAgIHpJbmRleDogMTAwMCxcbiAgfSxcbn0pO1xuXG5jb25zdCBTaWdudXBCdXR0b24gPSAoeyB0LCBjbGFzc2VzIH0pID0+IChcbiAgPExpbmsgaHJlZj1cIi9zaWdudXBcIj5cbiAgICA8QnV0dG9uIGNsYXNzTmFtZT17Y2xhc3Nlcy5idG59IGNvbG9yPVwicHJpbWFyeVwiIHZhcmlhbnQ9XCJjb250YWluZWRcIj5cbiAgICAgIHt0KFwiYnRuX3NpZ251cFwiKX1cbiAgICA8L0J1dHRvbj5cbiAgPC9MaW5rPlxuKTtcblxuU2lnbnVwQnV0dG9uLnByb3BUeXBlcyA9IHtcbiAgY2xhc3NlczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICB0OiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgd2l0aFRyYW5zbGF0aW9uKFwidGVzdGRyaXZlXCIpKHdpdGhTdHlsZXMoc3R5bGVzKShTaWdudXBCdXR0b24pKTtcbiIsInZhciBOZXh0STE4TmV4dCA9IHJlcXVpcmUoXCJuZXh0LWkxOG5leHRcIikuZGVmYXVsdDtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTmV4dEkxOE5leHQoe1xuICBkZWZhdWx0TGFuZ3VhZ2U6IFwiZW5cIixcbiAgb3RoZXJMYW5ndWFnZXM6IFtcImVzXCJdLFxuICBicm93c2VyTGFuZ3VhZ2VEZXRlY3Rpb246IGZhbHNlLFxufSk7XG4iLCJpbXBvcnQge1xuICBBdmF0YXIsXG4gIEJ1dHRvbixcbiAgRm9ybUNvbnRyb2wsXG4gIEdyaWQsXG4gIElucHV0LFxuICBMaW5lYXJQcm9ncmVzcyxcbiAgTGlzdCxcbiAgTGlzdEl0ZW0sXG4gIExpc3RJdGVtQXZhdGFyLFxuICBMaXN0SXRlbVRleHQsXG4gIFBhcGVyLFxuICBUeXBvZ3JhcGh5LFxufSBmcm9tIFwiQG1hdGVyaWFsLXVpL2NvcmVcIjtcbmltcG9ydCB7IHdpdGhTdHlsZXMgfSBmcm9tIFwiQG1hdGVyaWFsLXVpL2NvcmUvc3R5bGVzXCI7XG5pbXBvcnQgRm9sZGVySWNvbiBmcm9tIFwiQG1hdGVyaWFsLXVpL2ljb25zL0ZvbGRlclwiO1xuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuaW1wb3J0IGNvb2tpZSBmcm9tIFwianMtY29va2llXCI7XG5pbXBvcnQgSGVhZCBmcm9tIFwibmV4dC9oZWFkXCI7XG5pbXBvcnQgeyB3aXRoU25hY2tiYXIgfSBmcm9tIFwibm90aXN0YWNrXCI7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gXCJwcm9wLXR5cGVzXCI7XG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgTW9tZW50IGZyb20gXCJyZWFjdC1tb21lbnRcIjtcbmltcG9ydCBCYXNpY0FwcGJhciBmcm9tIFwiLi4vY29tcG9uZW50cy9CYXNpY0FwcGJhclwiO1xuaW1wb3J0IHsgaTE4biwgd2l0aFRyYW5zbGF0aW9uIH0gZnJvbSBcIi4uL2kxOG5cIjtcbmltcG9ydCB7IGJ1aWxkQXBpVXJsIH0gZnJvbSBcIi4uL3V0aWxzL2FwaVwiO1xuaW1wb3J0IHsgbG9nb3V0LCB3aXRoQXV0aFN5bmMgfSBmcm9tIFwiLi4vdXRpbHMvYXV0aFwiO1xuaW1wb3J0IHsgcm91dGVyUHVzaCB9IGZyb20gXCIuLi91dGlscy9yb3V0ZXJcIjtcblxuY29uc3Qgc3R5bGVzID0gKHRoZW1lKSA9PiAoe1xuICBtYWluOiB7XG4gICAgd2lkdGg6IFwiYXV0b1wiLFxuICAgIGRpc3BsYXk6IFwiYmxvY2tcIiwgLy8gRml4IElFIDExIGlzc3VlLlxuICAgIG1hcmdpbkxlZnQ6IHRoZW1lLnNwYWNpbmcoMiksXG4gICAgbWFyZ2luUmlnaHQ6IHRoZW1lLnNwYWNpbmcoMiksXG4gICAgW3RoZW1lLmJyZWFrcG9pbnRzLnVwKDUwMCArIHRoZW1lLnNwYWNpbmcoMikgKiAyKV06IHtcbiAgICAgIHdpZHRoOiA1MDAsXG4gICAgICBtYXJnaW5MZWZ0OiBcImF1dG9cIixcbiAgICAgIG1hcmdpblJpZ2h0OiBcImF1dG9cIixcbiAgICB9LFxuICB9LFxuICBwYXBlcjoge1xuICAgIG1hcmdpblRvcDogdGhlbWUuc3BhY2luZyg4KSxcbiAgICBkaXNwbGF5OiBcImZsZXhcIixcbiAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgcGFkZGluZzogYCR7dGhlbWUuc3BhY2luZygyKX1weCAke3RoZW1lLnNwYWNpbmcoMyl9cHggJHt0aGVtZS5zcGFjaW5nKFxuICAgICAgM1xuICAgICl9cHhgLFxuICB9LFxuICBzdWJoZWFkZXI6IHtcbiAgICBtYXJnaW5Cb3R0b206IHRoZW1lLnNwYWNpbmcoMyksXG4gIH0sXG4gIHN1YnN1YmhlYWRlcjoge1xuICAgIGZvbnRXZWlnaHQ6IDUwMCxcbiAgfSxcbiAgZ3JpZDoge1xuICAgIGZsZXhHcm93OiAxLFxuICB9LFxuICBsaXN0OiB7XG4gICAgb3ZlcmZsb3c6IFwiYXV0b1wiLFxuICAgIG1heEhlaWdodDogMzIwLFxuICB9LFxuICBpbmxpbmVGb3JtQ29udGFpbmVyOiB7XG4gICAgZGlzcGxheTogXCJmbGV4XCIsXG4gIH0sXG4gIGlubGluZUZvcm1Db250cm9sOiB7XG4gICAgZmxleEdyb3c6IDEsXG4gICAgbWFyZ2luUmlnaHQ6IHRoZW1lLnNwYWNpbmcoMSksXG4gIH0sXG59KTtcblxuY2xhc3MgTmV3UHJvamVjdEZvcm0gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0ZSA9IHtcbiAgICBzdWJtaXR0aW5nOiBmYWxzZSxcbiAgICBuYW1lOiBcIlwiLFxuICB9O1xuXG4gIGhhbmRsZUNoYW5nZSA9IChlKSA9PiB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IFtlLnRhcmdldC5uYW1lXTogZS50YXJnZXQudmFsdWUgfSk7XG4gIH07XG5cbiAgaGFuZGxlU3VibWl0ID0gYXN5bmMgKGUpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBjb25zdCB7IHRva2VuIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgbmFtZSB9ID0gdGhpcy5zdGF0ZTtcblxuICAgIHRoaXMuc2V0U3RhdGUoeyBzdWJtaXR0aW5nOiB0cnVlIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MucG9zdChcbiAgICAgICAgYnVpbGRBcGlVcmwoYC9wcm9qZWN0cy9gKSxcbiAgICAgICAgeyBuYW1lOiBuYW1lIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICBcIkFjY2VwdC1MYW5ndWFnZVwiOiBpMThuLmxhbmd1YWdlLFxuICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogdG9rZW4sXG4gICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIGNvbnN0IHsgdXVpZCB9ID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgIGNvb2tpZS5zZXQoXCJwcm9qZWN0XCIsIHV1aWQpO1xuICAgICAgcm91dGVyUHVzaChcIi9ob21lL1wiKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gZXJyLnJlc3BvbnNlO1xuICAgICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgIGxvZ291dCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihyZXNwb25zZSk7XG4gICAgICAgIHRoaXMucHJvcHMuZW5xdWV1ZVNuYWNrYmFyKFwiRmFpbGVkIHRvIGNyZWF0ZSBuZXcgcHJvamVjdFwiLCB7XG4gICAgICAgICAgdmFyaWFudDogXCJlcnJvclwiLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHN1Ym1pdHRpbmc6IGZhbHNlIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyB0LCBjbGFzc2VzIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgc3VibWl0dGluZywgbmFtZSB9ID0gdGhpcy5zdGF0ZTtcblxuICAgIHJldHVybiAoXG4gICAgICA8Zm9ybVxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXMuZm9ybX1cbiAgICAgICAgbWV0aG9kPVwicG9zdFwiXG4gICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiXG4gICAgICAgIG9uU3VibWl0PXt0aGlzLmhhbmRsZVN1Ym1pdH1cbiAgICAgID5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzZXMuaW5saW5lRm9ybUNvbnRhaW5lcn0+XG4gICAgICAgICAgPEZvcm1Db250cm9sXG4gICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgbWFyZ2luPVwiZGVuc2VcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzLmlubGluZUZvcm1Db250cm9sfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxJbnB1dFxuICAgICAgICAgICAgICBuYW1lPVwibmFtZVwiXG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0KFwibmV3Lm5hbWVfcGxhY2Vob2xkZXJcIil9XG4gICAgICAgICAgICAgIHZhbHVlPXtuYW1lfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5oYW5kbGVDaGFuZ2V9XG4gICAgICAgICAgICAgIGRpc2FibGVkPXtzdWJtaXR0aW5nfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L0Zvcm1Db250cm9sPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgICAgZGlzYWJsZWQ9e3N1Ym1pdHRpbmd9XG4gICAgICAgICAgPlxuICAgICAgICAgICAge3QoXCJuZXcuc3VibWl0X2J0blwiKX1cbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Zvcm0+XG4gICAgKTtcbiAgfVxufVxuXG5OZXdQcm9qZWN0Rm9ybS5wcm9wVHlwZXMgPSB7XG4gIGNsYXNzZXM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgdDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbn07XG5cbk5ld1Byb2plY3RGb3JtID0gd2l0aFN0eWxlcyhzdHlsZXMpKE5ld1Byb2plY3RGb3JtKTtcbk5ld1Byb2plY3RGb3JtID0gd2l0aFRyYW5zbGF0aW9uKFwic2VsZWN0X3Byb2plY3RcIikoTmV3UHJvamVjdEZvcm0pO1xuTmV3UHJvamVjdEZvcm0gPSB3aXRoU25hY2tiYXIoTmV3UHJvamVjdEZvcm0pO1xuXG5jb25zdCBQUk9KRUNUU19QRVJfUEFHRSA9IDU7XG5cbmNsYXNzIE9wZW5Qcm9qZWN0TGlzdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRlID0ge1xuICAgIGxvYWRpbmc6IHRydWUsXG4gICAgcmVzdWx0czogW10sXG4gICAgY291bnQ6IDAsXG4gIH07XG5cbiAgYXN5bmMgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgYXdhaXQgdGhpcy5nZXRQcm9qZWN0cygpO1xuICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiBmYWxzZSB9KTtcbiAgfVxuXG4gIGFzeW5jIGdldFByb2plY3RzKCkge1xuICAgIGNvbnN0IHsgdG9rZW4gfSA9IHRoaXMucHJvcHM7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQoYnVpbGRBcGlVcmwoYC9wcm9qZWN0cy9gKSwge1xuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgXCJBY2NlcHQtTGFuZ3VhZ2VcIjogaTE4bi5sYW5ndWFnZSxcbiAgICAgICAgICBBdXRob3JpemF0aW9uOiB0b2tlbixcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgeyBjb3VudCwgcmVzdWx0cyB9ID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb3VudCwgcmVzdWx0cyB9KTtcbiAgICAgIGlmIChjb3VudCA9PSAxICYmICFjb29raWUuZ2V0KFwicHJvamVjdFwiKSkge1xuICAgICAgICBjb25zdCBwcm9qZWN0ID0gcmVzdWx0c1swXTtcbiAgICAgICAgdGhpcy5oYW5kbGVTZWxlY3RQcm9qZWN0KHByb2plY3QpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBlcnIucmVzcG9uc2U7XG4gICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2Uuc3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgbG9nb3V0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKHJlc3BvbnNlKTtcbiAgICAgICAgdGhpcy5wcm9wcy5lbnF1ZXVlU25hY2tiYXIoXCJGYWlsZWQgdG8gZ2V0IHByb2plY3RzXCIsIHtcbiAgICAgICAgICB2YXJpYW50OiBcImVycm9yXCIsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZVNlbGVjdFByb2plY3QgPSAocHJvamVjdCkgPT4ge1xuICAgIGNvb2tpZS5zZXQoXCJwcm9qZWN0XCIsIHByb2plY3QudXVpZCk7XG4gICAgcm91dGVyUHVzaChcIi9ob21lL1wiKTtcbiAgfTtcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyB0LCBjbGFzc2VzIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgbG9hZGluZywgY291bnQsIHJlc3VsdHMgfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgbG9jYWxlID0gaTE4bi5sYW5ndWFnZTtcblxuICAgIGlmIChsb2FkaW5nKSB7XG4gICAgICByZXR1cm4gPExpbmVhclByb2dyZXNzIC8+O1xuICAgIH0gZWxzZSBpZiAocmVzdWx0cy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8TGlzdCBjbGFzc05hbWU9e2NsYXNzZXMubGlzdH0+XG4gICAgICAgICAge3Jlc3VsdHMubWFwKChwcm9qZWN0KSA9PiAoXG4gICAgICAgICAgICA8TGlzdEl0ZW1cbiAgICAgICAgICAgICAgYnV0dG9uXG4gICAgICAgICAgICAgIGtleT17cHJvamVjdC51dWlkfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0aGlzLmhhbmRsZVNlbGVjdFByb2plY3QocHJvamVjdCl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxMaXN0SXRlbUF2YXRhcj5cbiAgICAgICAgICAgICAgICA8QXZhdGFyPlxuICAgICAgICAgICAgICAgICAgPEZvbGRlckljb24gLz5cbiAgICAgICAgICAgICAgICA8L0F2YXRhcj5cbiAgICAgICAgICAgICAgPC9MaXN0SXRlbUF2YXRhcj5cbiAgICAgICAgICAgICAgPExpc3RJdGVtVGV4dFxuICAgICAgICAgICAgICAgIHByaW1hcnk9e3Byb2plY3QubmFtZX1cbiAgICAgICAgICAgICAgICBzZWNvbmRhcnk9e1xuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPE1vbWVudCBsb2NhbGU9e2xvY2FsZX0gZnJvbU5vdz5cbiAgICAgICAgICAgICAgICAgICAgICB7cHJvamVjdC51cGRhdGVkX2F0fVxuICAgICAgICAgICAgICAgICAgICA8L01vbWVudD57XCIgXCJ9XG4gICAgICAgICAgICAgICAgICAgIC0ge3Byb2plY3QuY29sbGFib3JhdG9ycy5qb2luKFwiLCBcIil9XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L0xpc3RJdGVtPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L0xpc3Q+XG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gPFR5cG9ncmFwaHk+e3QoXCJvcGVuLm5vX3Byb2plY3RzXCIpfTwvVHlwb2dyYXBoeT47XG4gICAgfVxuICB9XG59XG5cbk9wZW5Qcm9qZWN0TGlzdC5wcm9wVHlwZXMgPSB7XG4gIGNsYXNzZXM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgdDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgdG9rZW46IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbn07XG5cbk9wZW5Qcm9qZWN0TGlzdCA9IHdpdGhTdHlsZXMoc3R5bGVzKShPcGVuUHJvamVjdExpc3QpO1xuT3BlblByb2plY3RMaXN0ID0gd2l0aFRyYW5zbGF0aW9uKFwic2VsZWN0X3Byb2plY3RcIikoT3BlblByb2plY3RMaXN0KTtcbk9wZW5Qcm9qZWN0TGlzdCA9IHdpdGhTbmFja2JhcihPcGVuUHJvamVjdExpc3QpO1xuXG5jbGFzcyBTZWxlY3RQcm9qZWN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIGFzeW5jIGdldEluaXRpYWxQcm9wcyhjdHgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZXNwYWNlc1JlcXVpcmVkOiBbXCJzZWxlY3RfcHJvamVjdFwiXSxcbiAgICB9O1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHsgdCwgY2xhc3NlcywgdG9rZW4gfSA9IHRoaXMucHJvcHM7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPEhlYWQ+XG4gICAgICAgICAgPHRpdGxlPnt0KFwidGl0bGVcIil9PC90aXRsZT5cbiAgICAgICAgPC9IZWFkPlxuICAgICAgICA8QmFzaWNBcHBiYXIgLz5cbiAgICAgICAgPG1haW4gY2xhc3NOYW1lPXtjbGFzc2VzLm1haW59PlxuICAgICAgICAgIDxQYXBlciBjbGFzc05hbWU9e2NsYXNzZXMucGFwZXJ9PlxuICAgICAgICAgICAgPFR5cG9ncmFwaHkgY2xhc3NOYW1lPXtjbGFzc2VzLmhlYWRlcn0gY29tcG9uZW50PVwiaDFcIiB2YXJpYW50PVwiaDVcIj5cbiAgICAgICAgICAgICAge3QoXCJoZWFkZXJcIil9XG4gICAgICAgICAgICA8L1R5cG9ncmFwaHk+XG4gICAgICAgICAgICA8VHlwb2dyYXBoeSBjbGFzc05hbWU9e2NsYXNzZXMuc3ViaGVhZGVyfT5cbiAgICAgICAgICAgICAge3QoXCJzdWJoZWFkZXJcIil9XG4gICAgICAgICAgICA8L1R5cG9ncmFwaHk+XG4gICAgICAgICAgICA8R3JpZFxuICAgICAgICAgICAgICBjb250YWluZXJcbiAgICAgICAgICAgICAgZGlyZWN0aW9uPVwiY29sdW1uXCJcbiAgICAgICAgICAgICAgc3BhY2luZz17M31cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzLmdyaWR9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxHcmlkIGl0ZW0geHM+XG4gICAgICAgICAgICAgICAgPFR5cG9ncmFwaHkgY2xhc3NOYW1lPXtjbGFzc2VzLnN1YnN1YmhlYWRlcn0+XG4gICAgICAgICAgICAgICAgICB7dChcIm5ldy5oZWFkZXJcIil9XG4gICAgICAgICAgICAgICAgPC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgIDxOZXdQcm9qZWN0Rm9ybSB0b2tlbj17dG9rZW59IC8+XG4gICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgICAgPEdyaWQgaXRlbSB4cz5cbiAgICAgICAgICAgICAgICA8VHlwb2dyYXBoeSBjbGFzc05hbWU9e2NsYXNzZXMuc3Vic3ViaGVhZGVyfT5cbiAgICAgICAgICAgICAgICAgIHt0KFwib3Blbi5oZWFkZXJcIil9XG4gICAgICAgICAgICAgICAgPC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgIDxPcGVuUHJvamVjdExpc3QgdG9rZW49e3Rva2VufSAvPlxuICAgICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgPC9QYXBlcj5cbiAgICAgICAgPC9tYWluPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5TZWxlY3RQcm9qZWN0LnByb3BUeXBlcyA9IHtcbiAgY2xhc3NlczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICB0OiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxufTtcblxuU2VsZWN0UHJvamVjdCA9IHdpdGhTdHlsZXMoc3R5bGVzKShTZWxlY3RQcm9qZWN0KTtcblNlbGVjdFByb2plY3QgPSB3aXRoVHJhbnNsYXRpb24oXCJzZWxlY3RfcHJvamVjdFwiKShTZWxlY3RQcm9qZWN0KTtcblNlbGVjdFByb2plY3QgPSB3aXRoQXV0aFN5bmMoU2VsZWN0UHJvamVjdCk7XG5cbmV4cG9ydCBkZWZhdWx0IFNlbGVjdFByb2plY3Q7XG4iLCJjb25zdCBLTk9XTl9IT1NUX1BBSVJTID0gW1xuICBbXCJsb2NhbGhvc3RcIiwgXCJsb2NhbGhvc3Q6ODAwMVwiXSxcbiAgW1wic3RhZ2luZy5hcHAuZHltYXhpb25sYWJzLmNvbVwiLCBcInN0YWdpbmcuYXBpLmR5bWF4aW9ubGFicy5jb21cIl0sXG4gIFtcImFwcC5keW1heGlvbmxhYnMuY29tXCIsIFwiYXBpLmR5bWF4aW9ubGFicy5jb21cIl1cbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEFwaVVybChwYXRoKSB7XG4gIGxldCBhcGlIb3N0bmFtZSA9IGxvY2F0aW9uLmhvc3Q7XG4gIGZvciAoY29uc3QgW3dlYkhvc3QsIGFwaUhvc3RdIG9mIEtOT1dOX0hPU1RfUEFJUlMpIHtcbiAgICBpZiAobG9jYXRpb24uaG9zdG5hbWUgPT09IHdlYkhvc3QpIHtcbiAgICAgIGFwaUhvc3RuYW1lID0gYXBpSG9zdDtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYCR7bG9jYXRpb24ucHJvdG9jb2x9Ly8ke2FwaUhvc3RuYW1lfSR7cGF0aH1gO1xufVxuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyByb3V0ZXJQdXNoIH0gZnJvbSBcIi4vcm91dGVyXCI7XG5pbXBvcnQgbmV4dENvb2tpZSBmcm9tIFwibmV4dC1jb29raWVzXCI7XG5pbXBvcnQgY29va2llIGZyb20gXCJqcy1jb29raWVcIjtcbmltcG9ydCBxdWVyeXN0cmluZyBmcm9tIFwicXVlcnlzdHJpbmdcIjtcblxuZXhwb3J0IGNvbnN0IGxvZ2luID0gYXN5bmMgKHtcbiAgdXNlcm5hbWUsXG4gIHRva2VuLFxuICBleHBpcmVzLFxuICByZWRpcmVjdFRvID0gXCIvaG9tZVwiLFxufSkgPT4ge1xuICBjb29raWUuc2V0KFwidG9rZW5cIiwgdG9rZW4sIHsgZXhwaXJlczogZXhwaXJlcyB9KTtcbiAgY29va2llLnNldChcInVzZXJuYW1lXCIsIHVzZXJuYW1lLCB7IGV4cGlyZXM6IGV4cGlyZXMgfSk7XG4gIGlmICghcmVkaXJlY3RUbykge1xuICAgIHJlZGlyZWN0VG8gPSBcIi9ob21lXCI7XG4gIH1cbiAgcm91dGVyUHVzaChyZWRpcmVjdFRvKTtcbn07XG5cbmV4cG9ydCBjb25zdCBsb2dvdXQgPSAoKSA9PiB7XG4gIGNvb2tpZS5yZW1vdmUoXCJ0b2tlblwiKTtcbiAgY29va2llLnJlbW92ZShcInVzZXJuYW1lXCIpO1xuICBjb29raWUucmVtb3ZlKFwicHJvamVjdFwiKTtcbiAgLy8gdG8gc3VwcG9ydCBsb2dnaW5nIG91dCBmcm9tIGFsbCB3aW5kb3dzXG4gIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImxvZ291dFwiLCBEYXRlLm5vdygpKTtcbiAgcm91dGVyUHVzaChcIi9sb2dpblwiKTtcbn07XG5cbi8vIEdldHMgdGhlIGRpc3BsYXkgbmFtZSBvZiBhIEpTWCBjb21wb25lbnQgZm9yIGRldiB0b29sc1xuY29uc3QgZ2V0RGlzcGxheU5hbWUgPSAoQ29tcG9uZW50KSA9PlxuICBDb21wb25lbnQuZGlzcGxheU5hbWUgfHwgQ29tcG9uZW50Lm5hbWUgfHwgXCJDb21wb25lbnRcIjtcblxuZXhwb3J0IGNvbnN0IHdpdGhBdXRoU3luYyA9IChXcmFwcGVkQ29tcG9uZW50LCBvcHRpb25zKSA9PlxuICBjbGFzcyBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgc3RhdGljIGRpc3BsYXlOYW1lID0gYHdpdGhBdXRoU3luYygke2dldERpc3BsYXlOYW1lKFdyYXBwZWRDb21wb25lbnQpfSlgO1xuXG4gICAgc3RhdGljIGFzeW5jIGdldEluaXRpYWxQcm9wcyhjdHgpIHtcbiAgICAgIGNvbnN0IHsgcmVkaXJlY3QgfSA9IG9wdGlvbnMgfHwge307XG4gICAgICBjb25zdCB7IHVzZXJuYW1lLCB0b2tlbiB9ID0gYXV0aChjdHgsIHJlZGlyZWN0KTtcblxuICAgICAgY29uc3QgY29tcG9uZW50UHJvcHMgPVxuICAgICAgICBXcmFwcGVkQ29tcG9uZW50LmdldEluaXRpYWxQcm9wcyAmJlxuICAgICAgICAoYXdhaXQgV3JhcHBlZENvbXBvbmVudC5nZXRJbml0aWFsUHJvcHMoY3R4KSk7XG5cbiAgICAgIHJldHVybiB7IC4uLmNvbXBvbmVudFByb3BzLCB1c2VybmFtZSwgdG9rZW4gfTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICB0aGlzLnN5bmNMb2dvdXQgPSB0aGlzLnN5bmNMb2dvdXQuYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwic3RvcmFnZVwiLCB0aGlzLnN5bmNMb2dvdXQpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzdG9yYWdlXCIsIHRoaXMuc3luY0xvZ291dCk7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJsb2dvdXRcIik7XG4gICAgfVxuXG4gICAgc3luY0xvZ291dChldmVudCkge1xuICAgICAgaWYgKGV2ZW50LmtleSA9PT0gXCJsb2dvdXRcIikge1xuICAgICAgICBjb25zb2xlLmxvZyhcImxvZ2dlZCBvdXQgZnJvbSBzdG9yYWdlIVwiKTtcbiAgICAgICAgdGhpcy5vbkxvZ291dCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIG9uTG9nb3V0KCkge1xuICAgICAgcm91dGVyUHVzaChcIi9sb2dpblwiKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICByZXR1cm4gPFdyYXBwZWRDb21wb25lbnQgey4uLnRoaXMucHJvcHN9IC8+O1xuICAgIH1cbiAgfTtcblxuZXhwb3J0IGNvbnN0IGF1dGggPSAoY3R4LCByZWRpcmVjdCkgPT4ge1xuICBjb25zdCB7IHVzZXJuYW1lLCB0b2tlbiB9ID0gbmV4dENvb2tpZShjdHgpO1xuXG4gIGlmICh0eXBlb2YgcmVkaXJlY3QgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICByZWRpcmVjdCA9IHRydWU7XG4gIH1cblxuICBpZiAocmVkaXJlY3QpIHtcbiAgICBpZiAoIXRva2VuIHx8ICF1c2VybmFtZSkge1xuICAgICAgaWYgKGN0eC5yZXEpIHtcbiAgICAgICAgY29uc3QgcXVlcnkgPSBxdWVyeXN0cmluZy5zdHJpbmdpZnkoeyByZWRpcmVjdDogY3R4LnJlcS51cmwgfSk7XG4gICAgICAgIGN0eC5yZXMud3JpdGVIZWFkKDMwMiwgeyBMb2NhdGlvbjogYC9sb2dpbj8ke3F1ZXJ5fWAgfSk7XG4gICAgICAgIGN0eC5yZXMuZW5kKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJvdXRlclB1c2goXCIvbG9naW5cIik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgdXNlcm5hbWUsIHRva2VuIH07XG59O1xuIiwiaW1wb3J0IFJvdXRlciBmcm9tIFwibmV4dC9yb3V0ZXJcIjtcblxuLy8gVUdMWSBGSVggRk9SIElFMTFcbmV4cG9ydCBjb25zdCByb3V0ZXJQdXNoID0gcGF0aCA9PiB7XG4gIGNvbnN0IGlzSUUgPSAhIWRvY3VtZW50LmRvY3VtZW50TW9kZTtcbiAgaWYgKGlzSUUpIHtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHBhdGg7XG4gIH0gZWxzZSB7XG4gICAgUm91dGVyLnB1c2gocGF0aCk7XG4gIH1cbn07XG5cbi8vIFVHTFkgRklYIEZPUiBJRTExXG5leHBvcnQgY29uc3Qgcm91dGVyUmVwbGFjZSA9IHBhdGggPT4ge1xuICBjb25zdCBpc0lFID0gISFkb2N1bWVudC5kb2N1bWVudE1vZGU7XG4gIGlmIChpc0lFKSB7XG4gICAgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UocGF0aCk7XG4gIH0gZWxzZSB7XG4gICAgUm91dGVyLnJlcGxhY2UocGF0aCk7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAbWF0ZXJpYWwtdWkvY29yZVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAbWF0ZXJpYWwtdWkvY29yZS9zdHlsZXNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQG1hdGVyaWFsLXVpL2ljb25zL0ZvbGRlclwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJheGlvc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJqcy1jb29raWVcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibmV4dC1jb29raWVzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm5leHQtaTE4bmV4dFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJuZXh0L2hlYWRcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibmV4dC9yb3V0ZXJcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibm90aXN0YWNrXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInByb3AtdHlwZXNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicXVlcnlzdHJpbmdcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVhY3RcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVhY3QtbW9tZW50XCIpOyJdLCJzb3VyY2VSb290IjoiIn0=