import * as React from "react";
import {Button } from '@mui/material';

import styles from './chat.module.css';

import { useSelector, useDispatch } from 'react-redux'

import { fetchAllData } from '../../redux/apiSlice';
import { useSnackbar } from 'notistack';

import { ReportMessage } from "../report/ReportMessage"; 

export function Chat({className = "", chatDomNode}) {
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch()
    const connectionStatus = useSelector(state => state.chat.connectionStatus)
    const channels = useSelector(state => state.chat.channels)
    let showReadable = useSelector(state => state.user.settings.show_readable)
    let {loading, error} = useSelector(state => state.api)
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedMessage, setSelectedMessage] = React.useState(null);

    const handleDialogClose = () => {
      setDialogOpen(false);
      setSelectedMessage(null)
    };

    let randomChannelIndex = Math.floor(Math.random()*channels.length)
    let randomChannel = channels[randomChannelIndex].name

    function handleChatClick(e){
      if(e.target.tagName!="P" && e.target.tagName != "SPAN"){
        return
      }
      let signature = null
      let text = ""
      if(e.target.tagName == "P"){
        signature = e.target.getAttribute("data-signature")
        text = e.target.innerText
      }
      if(!signature && e.target.tagName == "SPAN"){
        signature = e.target.parentNode.getAttribute("data-signature")
        text = e.target.parentNode.innerText
      }
      if(!signature){
        return
      }
      setSelectedMessage({
        signature,
        text
      })
      setDialogOpen(true);
    }

    function reload(){
        dispatch(fetchAllData()).unwrap()
        .catch(e => {
            let error = "Yükleme tekrar başarısız oldu"
            enqueueSnackbar(error, {variant: "error", preventDuplicate:true})
        })
    }

    let body = "";
    if(loading && error.length > 0){
        body = <div className={styles.loading}>
            <h2>Error: {error}</h2>
            <Button onClick={e => reload()} variant="outlined" color="error">
                tekrar dene
            </Button>
        </div>
    }
    else if(loading){
        body = <div className={styles.loading}>
            <h2>yükleniyor</h2>
        </div>
    }
    else if(connectionStatus == "connection denied"){
        body = <div className={styles.info}>
            <h2>Bağlantı reddedildi</h2>
            <p>Bu kanal sadece kayıtlı kullanıcılar içindir</p>
        </div>
    }
    else if(connectionStatus == "connection busy"){
        body = <div className={styles.info}>
            <h2>Kanal meşgul</h2>
            <p>Bu kanala çok fazla kullanıcı bağlı</p>
            <p>Daha sonra tekrar gelin veya <a href={"/?channel="+randomChannel}>başka bir kanala katılın</a></p>
        </div>
    }
    else if(connectionStatus == "connection failed"){
        body = <div className={styles.info}>
            <h2>Bağlantı başarısız oldu</h2>
            <p>Bu kanala bağlantı başarısız oldu</p>
        </div>
    }
    else{
        let showReadableStyle = showReadable ? styles.showText: ""
        body = <div ref={chatDomNode} onClick={handleChatClick} className={styles.chatContent + " " + showReadableStyle} > </div>
    }

    return (
      <>
      <div className={`${styles.chat} ${className}`} >
        {body}
      </div>
      <ReportMessage open={dialogOpen} onClose={handleDialogClose} data={selectedMessage} />
      </>
    );
}
