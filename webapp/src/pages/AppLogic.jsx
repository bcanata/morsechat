import {useDispatch, useSelector} from "react-redux";
import {selectChannelName, setConnected, setTyping, updateOnline} from "../redux/chatSlice";
import {wpmToMorseTimes} from "../redux/userSlice";
import * as React from "react";
import {SocketClient} from "../socket/client";
import getDialect from '../utils/dialects'
import {dialects} from '../utils/dialects'
import {scrollDown, systemMessage} from '../utils/chatDom'

import ReceiverSound from '../utils/ReceiverSound'

export function AppLogic({chatDomNode}) {
    const dispatch = useDispatch()
    let loading = useSelector(state => state.api.loading)
    let callsign = useSelector(state => state.user.callsign)
    let channel = useSelector(state => state.chat.channel)
    let channelName = useSelector(selectChannelName)
    const pusher = React.useRef(null)
    const pusherChannel = React.useRef(null)

    let dialectName = useSelector(state => state.user.settings.dialect)
    let dialect = getDialect(dialectName)
    //audio related selectors
    let volume = useSelector(state => state.user.settings.volume_receiver)
    let onlineUsers = useSelector(state => state.chat.onlineUsers)
    //get a reference to volume so that code in callbacks will have access to
    //it without outdated bindings
    //https://stackoverflow.com/a/60643670
    let volumeRef = React.useRef()
    volumeRef.current = volume
    let onlineUsersRef = React.useRef()
    onlineUsersRef.current = onlineUsers

    /**
     * recursive typer loop. Its job is to type a received message into the chat,
     * with the same timings of the sender
     * note: this should be refactored into something cleaner, maybe a generator func
     * 
     * @param {DOMElement} morse - the html element where we'll display the raw morse code
     * @param {DOMElement} morseLetters - the html element where we'll display the translated morse
     * @param {number[]} message - an array of integers, representing the received message
     * @param {Object} times - the morse times object, as generated by wpmToMorseTimes
     * @param {ReceiverSound} sound - the sound manager associated to the user
     * @param {number} i - the current position of the typer while iterating the message array
     * @param {*} letter - the letter the typer is currently decoding
     * @param {*} morseOut - the text content of the morse domElement
     * @param {*} morseLettersOut - the text content of the morseLetters domElement
     * TODO: remove morseOut and morseLettersOut, use element.insertAdjacentText('beforeend', text)
     */
    function typer(morse, morseLetters, message, times, sound, dialectName, i=0, letter="", morseOut="", morseLettersOut=""){
        let t = message[i]

        //released after t millis
        if(i%2 == 0){
            sound.on()
            if(t < times.dash){
                letter += "."
            }else{
                letter += "_"
            }
        }
        //pressed after t millis
        else{
            sound.off()
            if(t > times.wordGap){
                morseOut += letter + "   "
                morseLettersOut += translateToReadable(letter, dialectName) + "  "
                letter = ""
            }
            else if(t > times.letterGap){
                morseOut += letter + " "
                morseLettersOut += translateToReadable(letter, dialectName)
                letter = ""
            }
        }
        morse.innerText = morseOut + letter
        if(i < message.length){
            morseLetters.innerText = morseLettersOut + " " + letter
            setTimeout(typer, message[i], morse, morseLetters, message, times, sound, dialectName, i+1, letter, morseOut, morseLettersOut)
        }
        else{
            //translate what is left
            morseLetters.innerText = morseLettersOut + translateToReadable(letter, dialectName)
            //stop and remove the audio gain node
            sound.disconnect()
        }
    }
    function translateToReadable(letter, dialectName){
        let dialect = getDialect(dialectName)
        letter = letter.replaceAll("_", "-")
        if(dialect.table.hasOwnProperty(letter))
            return dialect.table[letter];
        return " " + letter + " ";
    }

    /**
     * Called when a message is received. Initialize the typer loop
     * 
     */
    function handleMessage(e) {
        //initialize DOM nodes
        let chat = chatDomNode.current
        let message = document.createElement("p")
        let label = document.createElement("span") 
        let morse = document.createElement("span")
        let text = document.createElement("span")
        message.appendChild(label)
        message.appendChild(morse)
        message.appendChild(text)
        let dialect = e.dialect == "international" ? "" : ` [${dialects[e.dialect].short_name}]`
        label.innerText = e.callsign + dialect
        //initialize wpm times
        let times = wpmToMorseTimes(e.wpm)
        //initialize the sound class for this specific user
        //todo: there should be a sound object associated to every online user,
        //it's more efficient than creating an obj on every message
        let sound = new ReceiverSound(e.id, volumeRef, onlineUsersRef)
        //start the typer recursive function
        typer(morse, text, e.message, times, sound, e.dialect)
        chat.insertAdjacentElement("beforeend", message)
        //scroll down if the user is not reading old messages
        scrollDown(chatDomNode)
    }

    //sync the selected channel with the query param
    //look mom! no react router
    React.useEffect(() => {
        let searchParams = new URLSearchParams(window.location.search);
        searchParams.set("channel", channelName);
        let newPath = window.location.pathname + '?' + searchParams.toString();
        history.pushState(null, '', newPath);
    }, [channel])

    /**
     * Pusher client initialization effect
     *
     * TODO: unbind all callbacks and check for mem leaks
     */
    React.useEffect(() => {
        if (loading == false) {
            if (pusher.current === null) {
                //initialize the socket client
                pusher.current = new SocketClient()
                //update pusher server connection status
                //this is not related to the channel subscription
                pusher.current.stateChange = (states) => {
                    console.log("statechange hook: ", states)
                    dispatch(setConnected(states))
                }
            } else {
                console.warn("reinitializing pusher ref")
            }
        }
    }, [loading]);

    /**
     * channel connection effect
     * - runs on every change of the selected channel, or of the user callsign
     * - unsubscribes from the previous channel
     * - connects to the new channel, updating the bindings
     */
    React.useEffect(() => {
        if (pusher.current) {
            console.log(">> effect: subscribing to channel " + channel)
            pusherChannel.current = pusher.current.subscribe(channel)
            dispatch(setConnected('connecting'))

            // pusherChannel.current.bind('pusher:subscription_succeeded', e => {
            //     dispatch(setConnected('connected'))
            //     dispatch(updateOnline(JSON.parse(JSON.stringify(e))))
            //     //clear the chat (TODO: this hshould not happen after a simple disconnect)
            //     //idea: clear the screen only when the channel is changed from the selector,
            //     //maybe adding a connecting.. message
            //     if (chatDomNode.current)
            //         chatDomNode.current.innerHTML = ""
            //     //show successfully connected message
            //     systemMessage(chatDomNode, "connected to " + channelName + " with callsign: " + callsign)
            //     if(channelName == "training"){
            //       systemMessage(chatDomNode, "This is a training channel. The messages that you type won't be broadcasted")
            //     }
            // })

            // pusherChannel.current.bind('pusher:subscription_error', e => {
            //     if (e.error === "pusher_auth_denied login_needed")
            //         dispatch(setConnected('connection denied'))
            //     else
            //         dispatch(setConnected('connection failed'))
            //     dispatch(updateOnline({members: {}, myID: null}))
            // })

            // pusherChannel.current.bind('pusher:member_added', e => {
            //     dispatch(updateOnline(JSON.parse(JSON.stringify(
            //         pusherChannel.current.members
            //     ))))
            // })

            // pusherChannel.current.bind('pusher:member_removed', e => {
            //     dispatch(updateOnline(JSON.parse(JSON.stringify(
            //         pusherChannel.current.members
            //     ))))
            // })

            // pusherChannel.current.bind('message', e => {
            //     handleMessage(e)
            //     dispatch(setTyping({
            //         user: e.id,
            //         typing: false
            //     }))
            // })
            // pusherChannel.current.bind('typing', e => {
            //     dispatch(setTyping({
            //         user: e.id,
            //         typing: true
            //     }))
            // })
            return () => {
                console.log(">> effect: unsubscribing from channel " + channel);
                pusherChannel.current.unsubscribe()
            }
        } else {
            console.log(">> effect: subscribing to channel [NO PUSHER YET] " + channel)
        }
    }, [channel, callsign])


    return null
}
