'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.receivedMessage = receivedMessage;

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _apiai = require('apiai');

var _apiai2 = _interopRequireDefault(_apiai);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _sessionIds = new Map();

var apiAiService = (0, _apiai2.default)(_config2.default.API_AI_CLIENT_ACCESS_TOKEN, {
	language: "en"
});

function receivedMessage(event) {
	var senderID = event.sender.id;
	var text = event.message.text;


	if (!_sessionIds.has(senderID)) {
		_sessionIds.set(senderID, _uuid2.default.v1());
	}

	if (text) {
		_sendToApiAi(senderID, text);
	}
}

function _sendToApiAi(sender, text) {
	_sendTypingOn(sender);
	var apiaiRequest = apiAiService.textRequest(text, {
		sessionId: _sessionIds.get(sender)
	});

	apiaiRequest.on('response', function (response) {
		if ((0, _utils.isDefined)(response.result)) {
			_handleApiAiResponse(sender, response);
		}
	});

	apiaiRequest.on('error', function (error) {
		return console.error(error);
	});
	apiaiRequest.end();
}

function _handleApiAiResponse(sender, response) {
	var responseText = response.result.fulfillment.speech;
	var action = response.result.action;

	_sendTypingOff(sender);

	if (responseText == '' && !(0, _utils.isDefined)(action)) {
		console.log('Unknown query ' + response.result.resolvedQuery);
		_sendTextMessage(sender, "What are you even talking about?");
	} else {
		_sendTextMessage(sender, responseText);
	}
}

function _sendTextMessage(recipientId, text) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: text
		}
	};
	_callSendAPI(messageData);
}

function _callSendAPI(messageData) {
	(0, _request2.default)({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: _config2.default.FB_PAGE_TOKEN
		},
		method: 'POST',
		json: messageData

	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var recipientId = body.recipient_id;
			var messageId = body.message_id;

			if (messageId) {
				console.log('Successfully sent message with id ' + messageId + ' to recipient  ' + recipientId);
			} else {
				console.log('Successfully called Send API for recipient ' + recipientId);
			}
		} else {
			console.error('Failed calling Send API ' + response.statusCode + ' ' + response.statusMessage + ', ' + body.error);
		}
	});
}

function _sendTypingOn(recipientId) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		sender_action: "typing_on"
	};

	_callSendAPI(messageData);
}

function _sendTypingOff(recipientId) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		sender_action: "typing_off"
	};

	_callSendAPI(messageData);
}