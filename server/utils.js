import fakeModel from './fakeModel'

export const getSpeech=(contexts,action,responseText)=> { 
    switch (action) {
        case 'icecream-action':
            let iceCreamFlavour = contexts[0].parameters['icecream-flavours']
            if(fakeModel.flavours.includes(iceCreamFlavour.toLowerCase())) {
                return responseText
            } else {
                return `Sorry, we have only ${_styleArrayToText(fakeModel.flavours)}`
            }
        break
        case 'scoop-action':
            let scoopCount = Number.parseInt(contexts[0].parameters['scoop-count'])            
            if(Number.isInteger(scoopCount) && scoopCount>0) {
                return responseText + `\n\nYou need to pay ${fakeModel.cost * scoopCount}€`                
            } else {
                return "Don't play around with me boy"
            }
        break
		default:			
			return responseText
	}
}

export const isDefined=obj=> typeof obj=='undefined' || !obj ? false : obj!=null

const _styleArrayToText=arr=>`${arr.slice(0,-1).join(', ')} and ${arr.slice(-1)}`