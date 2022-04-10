import IconButton from "@mui/material/IconButton";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import * as React from "react";
import { useSelector } from 'react-redux'

import styles from './online.module.css';

export function Online({className = ""}) {
    const [animationClass, setAnimationClass] = React.useState(true);
    const [firstRender, setFirstRender] = React.useState(true);

    const connectionStatus = useSelector(state => state.chat.connectionStatus)
    const connected = useSelector(state => state.chat.connected)
    const onlineUsers = useSelector(state => state.chat.onlineUsers)
    const myID = useSelector(state => state.chat.myID)

    const onlineRender = Object.keys(onlineUsers).map(id => {
        let userObj = onlineUsers[id];
        return (
            <div key={id}>
                <div className={styles.left}>
                    <p>{userObj.callsign}{ id==myID ? " (you)" : ""}</p>
                    { 
                    userObj.typing &&
                    <div className={styles.typing}>
                        <div></div>
                        <div></div>
                    </div>
                    }
                </div>
                <IconButton aria-label="mute user">
                    <VolumeOffIcon />
                </IconButton>
            </div>
        )
    })

    //change the animation class when the currentAction text changes
    React.useEffect(() => {
        //avoid showing the animation on the first render of the component
        if (firstRender) {
            setFirstRender(false)
        } else {
            setAnimationClass(a => !a)
        }
    }, [connected]);


    let statusStyles = [
        styles.status,
        (animationClass ? styles.a_1 : styles.a_2),
        (connected ? styles.ws_online : null)

    ].join(" ")
    return (
        <div className={`${styles.online_container} ${className}`}>
            <div className={styles.statusContainer}>
                <p className={statusStyles} >{connectionStatus}</p>
            </div>
            <hr />
            <h2>online users </h2>
            <div className={styles.online}>
                { onlineRender }
            </div>
        </div>
    );
}