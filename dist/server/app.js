'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _utils = require('./utils');

var _fbAi = require('./fb-ai');

var fb = _interopRequireWildcard(_fbAi);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

app.set('port', process.env.PORT || 5000);

app.use(_bodyParser2.default.urlencoded({
	extended: false
}));
app.use(_bodyParser2.default.json());

app.get('/', function (req, res) {
	res.send('Ice Cream server sleeps here...<3');
});

app.get('/webhook/', function (req, res) {
	if (req.query['hub.mode'] == 'subscribe' && req.query['hub.verify_token'] === _config2.default.FB_VERIFY_TOKEN) res.status(200).send(req.query['hub.challenge']);
});

app.post('/webhook/', function (req, res) {
	var data = req.body;
	console.log(JSON.stringify(data));
	if (data.object == 'page') {
		data.entry.forEach(function (pageEntry) {
			pageEntry.messaging.forEach(function (messagingEvent) {
				if (messagingEvent.message) {
					fb.receivedMessage(messagingEvent);
				} else {
					console.log('Webhook received unknown messagingEvent: ' + messagingEvent);
				}
			});
		});
		res.sendStatus(200);
	} else {
		var result = data.result;

		var resObject = {
			speech: (0, _utils.getSpeech)(result.contexts, result.action, result.fulfillment.speech),
			displayText: result.fulfillment.messages[0].speech,
			source: "icecream-server"
		};
		res.setHeader('content-type', 'application/json');
		res.status(200).send(resObject);
	}
});

app.listen(app.get('port'), function () {
	console.log('running on port', app.get('port'));
});