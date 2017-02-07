import request from 'request'
import uuid from 'uuid'
import apiai from 'apiai'

import config from '../config'
import { isDefined } from './utils'

const _sessionIds = new Map()

const apiAiService = apiai(config.API_AI_CLIENT_ACCESS_TOKEN, {
	language: "en"
});

export function receivedMessage(event) {
	const senderID = event.sender.id	
	const { text } = event.message;

	if (!_sessionIds.has(senderID)) {
		_sessionIds.set(senderID, uuid.v1())
	}

	if (text) {
		_sendToApiAi(senderID, text)
	}
}

function _sendToApiAi(sender, text) {
	_sendTypingOn(sender)
	const apiaiRequest = apiAiService.textRequest(text, {
		sessionId: _sessionIds.get(sender)
	})

	apiaiRequest.on('response', response => {
		if (isDefined(response.result)) {
			_handleApiAiResponse(sender, response)
		}
	})

	apiaiRequest.on('error', error => console.error(error))
	apiaiRequest.end()
}

function _handleApiAiResponse(sender, response) {
	let responseText = response.result.fulfillment.speech
	let action = response.result.action

	_sendTypingOff(sender)

	if (responseText == '' && !isDefined(action)) {
		console.log(`Unknown query ${response.result.resolvedQuery}`)
		_sendTextMessage(sender, "I'm not sure what you want. Can you be more specific?")
	} else {
		_sendTextMessage(sender, responseText)
	}
}

function _sendTextMessage(recipientId, text) {
	console.log('_sendTextMessage')
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: text
		}
	}
	_callSendAPI(messageData);
}

function _callSendAPI(messageData) {
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: config.FB_PAGE_TOKEN
		},
		method: 'POST',
		json: messageData

	}, (error, response, body)=> {
		if (!error && response.statusCode == 200) {
			let recipientId = body.recipient_id
			let messageId = body.message_id

			if (messageId) {
				console.log(`Successfully sent message with id ${messageId} to recipient  ${recipientId}`)
			} else {
				console.log(`Successfully called Send API for recipient ${recipientId}`)
			}
		} else {
			console.error(`Failed calling Send API ${response.statusCode} ${response.statusMessage}, ${body.error}`)
		}
	})
}

function _sendTypingOn(recipientId) {
	const messageData = {
		recipient: {
			id: recipientId
		},
		sender_action: "typing_on"
	};

	_callSendAPI(messageData)
}

function _sendTypingOff(recipientId) {
	const messageData = {
		recipient: {
			id: recipientId
		},
		sender_action: "typing_off"
	};

	_callSendAPI(messageData)
}