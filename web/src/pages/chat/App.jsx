import * as React from 'react';
import Pusher from 'pusher-client';

import pageRender from '../../pageRender/pageRender'
import {AppLayout} from "./AppLayout";

import {socketUrl} from '../../utils/apiResolver'

import appContext from "../../contexts/appContext";


function App(props){

  let {connected, setConnected} = React.useContext(appContext);
  /*
  TODO: write here all app logic, using the elements exposed by appLayout
  - define settings, and make them available to to layout via contextApi
  - decide how the key will send events up here(state? callback?)
      idea: send events via callback, and have a down property so that it can
            handle sound and aspect
  
  - write sound utility: you define the frequency, and then start/stop. 
     add security feature: if not stopped after x, stop and log error
  */

  /* appstate */
  console.log("APP RERENDER")

  React.useEffect(() => {

    /* Pusher.logToConsole = true; */

    /* var pusher = new Pusher('0041a61088666d5f7c5d', { */
    /*   cluster: 'eu' */
    /* }); */

    /* var channel = pusher.subscribe('my-channel'); */
    /* channel.bind('my-event', function(data) { */
    /*   alert(JSON.stringify(data)); */
    /* }); */

  }, []);

  //   const socket = io(socketUrl);
  //   socket.on("FromAPI", data => {
  //     console.log(data)
  //   });
  //   socket.on("connect", () => {
  //     setConnected(true)
  //     console.log("connect")
  //     console.log(socket)
  //     socket.emit('join', { username: 'forgedUsername', room: 'room_test' })
  //   });
  //   socket.on("disconnect", () => {
  //     setConnected(false)
  //     console.log("disconnect")
  //     console.log(socket)
  //   });

  //   socket.onAny((event, args) => {
  //     console.log("GENERIC EVENT LOGGER")
  //     console.log({
  //       event, args
  //     })
  //   })

  //   // CLEAN UP THE EFFECT
  //   return () => socket.disconnect();
  //   //

  return(
    <AppLayout
      previewWidth={30}
      previewText={"Allor fu la paura un poco queta . che nel lago del cor--.-"}
      previewClearHandler={e=>console.log("clear")}
      connectionStatus={connected}
    />
  )
}

pageRender(App)
