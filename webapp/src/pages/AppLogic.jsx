import {useDispatch, useSelector} from "react-redux";
import {selectChannelName, setConnected, setTyping, updateOnline} from "../redux/chatSlice";
import {wpmToMorseTimes} from "../redux/userSlice";
import * as React from "react";
import {SocketClient} from "../socket/client";
import getDialect from '../utils/dialects'
import {dialects} from '../utils/dialects'
import {scrollDown, systemMessage} from '../utils/chatDom'
import {setInstance, getInstance} from '../socket/global.js'

import ReceiverSound from '../utils/ReceiverSound'

export function AppLogic({chatDomNode}) {
    const dispatch = useDispatch()
    let loading = useSelector(state => state.api.loading)
    let callsign = useSelector(state => state.user.callsign)
    let channel = useSelector(state => state.chat.channel)
    let channelName = useSelector(selectChannelName)
    const pusher = React.useRef(null)
    const pusherChannel = React.useRef(null)
    const chatHistory = React.useRef({})

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
     * parameters:
     * e: Object{
     *   callsign string,
     *   wpm integer,
     *   dialect string,
     *   message []integer
     * }
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
        let sound = new ReceiverSound(e.callsign, volumeRef, onlineUsersRef)
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
     * Pusher client initialization effect.
     * A new reconnection triggers on every callsing change
     */
    React.useEffect(() => {
      if (loading == false) {
        if (pusher.current != null) {
          console.log(">> effect: refreshing ws connection")
          pusher.current.refresh()
        }
        else{
          console.log(">> effect: initializing ws")
          //initialize the socket client
          pusher.current = new SocketClient(channel)
          setInstance(pusher.current)
          //debugging feature TODO: remove
          // window["p"] = pusher.current
          //update pusher server connection status
          //this is not related to the channel subscription
          pusher.current.stateChange = (states) => {
            console.log("TODO: statechange : ", states)
            dispatch(setConnected(states))
          }
          pusher.current.message = (message) =>{
            console.log("TODO: message : ", message)
            handleMessage(message)
            dispatch(setTyping({
                user: message.callsign,
                typing: false
            }))
          }
          pusher.current.typing = (message) => {
            console.log("TODO: typing : ", message)
            dispatch(setTyping({
                user: message.callsign,
                typing: message.typing
            }))
          }
          pusher.current.memberAdded = (message) => {
            console.log("TODO: memberadded : ", message)
            dispatch(updateOnline({
              me: callsign,
              users: message.users
            }))
          }
          pusher.current.memberRemoved = (message) => {
            console.log("TODO: memberremoved : ", message)
            dispatch(updateOnline({
              me: callsign,
              users: message.users
            }))
          }

          pusher.current.subscriptionError = (message) => {
            console.log("TODO: subscriptionError : "+ message+ channelName)
            if (message.error === "invalid_credentials")
                dispatch(setConnected('connection denied'))
            else
                dispatch(setConnected('connection failed'))
            dispatch(updateOnline({
              me: callsign,
              users: []
            }))
          }
        }
      }
    }, [loading, callsign]);

    /**
     * channel connection effect
     * - runs on every change of the selected channel, or of the user callsign
     * - unsubscribes from the previous channel
     * - connects to the new channel, updating the bindings
     */
    React.useEffect(() => {
      if (pusher.current) {
        console.log(">> effect: subscribing to channel " + channel)
        //save / restore the chat state
        if (chatDomNode.current){
          let oldChannel = pusher.current.channel
          chatHistory.current[oldChannel] = chatDomNode.current.innerHTML
          if(chatHistory.current[channel] && channel != "presence-training"){
            chatDomNode.current.innerHTML = chatHistory.current[channel]
          }else{
            chatDomNode.current.innerHTML = ""
          }
        }
        pusher.current.subscribe(channel)

      }
    }, [channel])

    /**
    * Register all the pusher listeners that have dependencies on the state
    */
    React.useEffect(() => {
        if (pusher.current) {
          pusher.current.subscriptionSuccess = (message) => {
            console.log("TODO: subscriptionSuccess : "+ message+ channelName)
            dispatch(setConnected('connected'))
            dispatch(updateOnline({
              me: callsign,
              users: message.users
            }))
            //clear the chat (TODO: this hshould not happen after a simple disconnect)
            //idea: clear the screen only when the channel is changed from the selector,
            //maybe adding a connecting.. message
            // if (chatDomNode.current){
            //     chatDomNode.current.innerHTML = ""
            // }
            //show successfully connected message
            console.log(chatDomNode.current)
            let last = chatDomNode.current.lastChild
            console.log(last)
            if(channelName == "training"){
                systemMessage(chatDomNode, "connected to " + channelName + " with callsign: " + callsign)
                systemMessage(chatDomNode, "This is a training channel. The messages that you type won't be broadcasted")
            }else{
              if(chatDomNode.current.childElementCount == 0)
                systemMessage(chatDomNode, "connected to " + channelName + " with callsign: " + callsign)
            }
          }
        }
  }, [channel, callsign])

  return null
}
