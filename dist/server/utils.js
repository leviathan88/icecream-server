'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isDefined = exports.getSpeech = undefined;

var _fakeModel = require('./fakeModel');

var _fakeModel2 = _interopRequireDefault(_fakeModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getSpeech = exports.getSpeech = function getSpeech(contexts, action, responseText) {
    switch (action) {
        case 'icecream-action':
            var iceCreamFlavour = contexts[0].parameters['icecream-flavours'];
            if (_fakeModel2.default.flavours.includes(iceCreamFlavour.toLowerCase())) {
                return responseText;
            } else {
                return 'Sorry, we have only ' + _styleArrayToText(_fakeModel2.default.flavours);
            }
            break;
        case 'scoop-action':
            var scoopCount = Number.parseInt(contexts[0].parameters['scoop-count']);
            if (Number.isInteger(scoopCount) && scoopCount > 0) {
                return responseText + ('\n\nYou need to pay ' + _fakeModel2.default.cost * scoopCount + '\u20AC');
            } else {
                return "Don't play around with me boy";
            }
            break;
        default:
            return responseText;
    }
};

var isDefined = exports.isDefined = function isDefined(obj) {
    return typeof obj == 'undefined' || !obj ? false : obj != null;
};

var _styleArrayToText = function _styleArrayToText(arr) {
    return arr.slice(0, -1).join(', ') + ' and ' + arr.slice(-1);
};