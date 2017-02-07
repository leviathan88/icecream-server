'use strict'

import express from 'express'
import bodyParser from 'body-parser'

import config from '../config'
import { getSpeech } from './utils'
import * as fb from './fb-ai'

const app = express()

app.set('port', (process.env.PORT || 5000))

app.use(bodyParser.urlencoded({
	extended: false
}))
app.use(bodyParser.json())

app.get('/', function (req, res) {
	res.send('Ice Cream server sleeps here...<3')
})

app.get('/webhook/', (req, res)=> {
	if (req.query['hub.mode'] == 'subscribe' && req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN)
		res.status(200).send(req.query['hub.challenge'])
})

app.post('/webhook/', (req, res)=> {	
	const data = req.body
	console.log(JSON.stringify(data))
	if (data.object == 'page') {
		data.entry.forEach( (pageEntry)=> {
			pageEntry.messaging.forEach( (messagingEvent)=> {
				if (messagingEvent.message) {   
					fb.receivedMessage(messagingEvent)
				} else {
					console.log(`Webhook received unknown messagingEvent: ${messagingEvent}`)
				}
			})
		})
		res.sendStatus(200)
	} else {	
		const { result } = data;
		const resObject = {
			speech: getSpeech(result.contexts, result.action, result.fulfillment.speech),
			displayText: result.fulfillment.messages[0].speech,
			source: "icecream-server"
		}
		res.setHeader('content-type', 'application/json')
		res.status(200).send(resObject)		
    }
})

app.listen(app.get('port'), function () {
	console.log('running on port', app.get('port'))
})