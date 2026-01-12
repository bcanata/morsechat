import React, { useState } from 'react';
import { 
    Tabs, Tab, TextField, Button, Box, Typography, Table, TableBody, IconButton,
    TableCell, TableContainer, TableHead, TableRow, Paper 
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';

import { useDispatch, useSelector } from 'react-redux'
import { apiCall } from '../../redux/apiSlice';
import useDebounce from '../../hooks/UseDebounce';
import TableCellTooltip from './TableCellTooltip.jsx'
import TableCellWithCopy from './TableCellCopy.jsx'
import BanButton from './BanButton.jsx'
import ManualBanForm from './ManualBanForm.jsx'

function formatDate(date){
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (now.toDateString() === date.toDateString()) return `today, ${date.toLocaleTimeString()}`;
    if (yesterday.toDateString() === date.toDateString()) return `yesterday, ${date.toLocaleTimeString()}`;
    return date.toLocaleString();
}

export default function ModerationMenu() {
    const dispatch = useDispatch()
    const [tabIndex, setTabIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const loadingStates = {
      LOADING: "loading",
      DONE: "done",
      ERROR: "error"
    }
    const [loading, setLoading] = useState(loadingStates.LOADING);
    const debouncedSearchTerm = useDebounce(searchTerm, 1000);

    //moderation data fetching state
    let [modData, setModData] = React.useState({})
    let [modPromise, setModPromise] = React.useState(undefined)

    React.useEffect(()=>{
      setLoading(loadingStates.LOADING)
      let query = "%"
      if(debouncedSearchTerm != ""){
        query = debouncedSearchTerm
      }
      // perform an api call to the mod data endpoint
      const livePromise = dispatch(apiCall({
        endpoint: "moderation/list",
        data: {query: query}
      }))
      // we need to preserve this promise during rerenders if we want to abort it
      setModPromise(livePromise)
      livePromise.unwrap()
        .then(ret => {
          console.log(ret)
          //TODO: apply transformations to some fields
          setModData(ret)
          setLoading(loadingStates.DONE)
        })
        .catch(ret => {
          console.log(ret)
          setLoading(loadingStates.ERROR)
        })

      //cleanup function
      return function cleanUp(){
        modPromise?.abort()
      }
    }, [debouncedSearchTerm])


    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleRemoveBan = (callsign) => {
        console.log("Remove ban on:", callsign);
        // Implement removal logic later
    };

    return (
        <Box sx={{ p: 2 }}>
            {/* Search Bar */}
            <Box sx={{ display: 'flex', mb: 2, gap: 1, alignItems: 'center'}}>
                <TextField
                    sx={{ width: 300 }}
                    fullWidth
                    variant="outlined"
                    label="Ara..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Box sx={{ ml: 6, display: 'flex'}}>
                  {loading == loadingStates.LOADING && (
                    <CircularProgress size="30px" />
                  )}
                  {loading == loadingStates.ERROR && (
                    <p>Yükleme hatası</p>
                  )}
                  {loading == loadingStates.DONE && (
                    <p>{(
                    modData.users.length +
                    modData.anon_users.length +
                    modData.ban_actions.length +
                    modData.report_actions.length
                  )} sonuç</p>
                  )}
                </Box>
            </Box>

            {/* Tabs */}
            <Tabs value={tabIndex} onChange={handleTabChange}>
                <Tab label="Denetim Kayıtları" />
                <Tab label="Yasaklı Kullanıcılar" />
                <Tab label="Bildirimler" />
                <Tab label="Manuel İşlemler" />
            </Tabs>

            {/* Moderation Logs Tab */}
            {tabIndex === 0 && (
                <TableContainer component={Paper} sx={{ mt: 2 }} >
                    <Table size="small" >
                        <TableHead>
                            <TableRow>
                                <TableCell>Tarih ve Saat</TableCell>
                                <TableCell>Bilgi</TableCell>
                                <TableCell>İşlem</TableCell>
                                <TableCell>Kullanıcı</TableCell>
                                <TableCell>Cihaz</TableCell>
                            </TableRow>
                        </TableHead>
                        <BanActionsTable data={modData?.ban_actions} />
                    </Table>
                </TableContainer>
            )}

            {/* Banned users Tab */}
            {tabIndex === 1 && (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small" >
                        <TableHead>
                            <TableRow>
                                {/*this table will contain both the content of users and anon_users*/}
                                <TableCell>Çağrı İşareti</TableCell>
                                <TableCell>Ülke</TableCell>
                                <TableCell>Doğrulanmış</TableCell>
                                <TableCell>Kullanıcı Adı</TableCell>
                                <TableCell>Cihaz</TableCell>
                                <TableCell>İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <UsersTable data={{users: modData.users, anon_users: modData.anon_users}} />
                    </Table>
                </TableContainer>
            )}

            {/* Reports Tab */}
            {tabIndex === 2 && (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small" >
                        <TableHead>
                            <TableRow>
                                <TableCell>Kötü Mesaj</TableCell>{/*badmessage_transcript: a long string. show the first 10 chars, and expand on hover*/}
                                <TableCell>Kötü Kullanıcı</TableCell>{/*baduser_id: Integer. if 0, write "anonymous"*/}
                                <TableCell>Kötü Cihaz</TableCell>{/*baduser_session: a long string. show the first 10 chars, and expand on hover */}
                                <TableCell>Gönderildi</TableCell>{/*badmessage_timestamp: date and time. convert unix timestamp to date and time. if the date is recent, write it in the format "today", "yesterday", ... eg: "yesterday, 12:01 AM"*/}
                                <TableCell>İşlemler</TableCell>{/*This row must contain a "ban" button, that calls a callback with baduser_id and baduser_session */}
                                <TableCell>Bildiren</TableCell>{/*reporter_user_id: Integer. if 0, write "anonymous"*/}
                                <TableCell>Bildiren Cihaz</TableCell>{/*reporter_session: a long string. show the first 10 chars, and expand on hover */}
                                <TableCell>Bildirildi</TableCell>{/*event_timestamp: date and time. convert unix timestamp to date and time. if the date is recent, write it in the format "today", "yesterday", ... eg: "yesterday, 12:01 AM"*/}
                                <TableCell>İşlemler</TableCell>{/*This row must contain a "ban reporter" button, that calls a callback with baduser_id and baduser_session */}
                            </TableRow>
                        </TableHead>
                        <ReportActionsTable data={modData.report_actions} />
                    </Table>
                </TableContainer>
            )}

            {/* Manual operations Tab */}
            {tabIndex === 3 && (
              <ManualBanForm />
            )}
        </Box>
    );
}


const BanActionsTable = React.memo(({ data }) => {
  return (
    <TableBody>
      {data?.map((action) => {
        const date = new Date(action.event_timestamp * 1000);
        return (
          <TableRow key={action.id}>
            <TableCell>{formatDate(date)}</TableCell>
            <TableCell>
              Denetçi @{action.moderator_username}
              {action.moderator_notes && `: ${action.moderator_notes}`}
            </TableCell>
            <TableCell>{action.is_ban_revert ? "YASAKLAMA GERİ ALINDI" : "YASAKLA"}</TableCell>
            <TableCellWithCopy text={action.baduser_id === 0 ? "--" : action.baduser_username} />
            <TableCellWithCopy title={action.baduser_session} text={action.baduser_session} />
          </TableRow>
        );
      })}
    </TableBody>
  );
});

const UsersTable = React.memo(({ data }) => {
  return (
  <TableBody>
    {[...(data?.users || []), ...(data?.anon_users || [])].map((user, idx) => {
      const isAnon = !user.username;
      return (
        <TableRow key={isAnon ? `anon-${user.last_session}` : user.id}>
          <TableCell>{isAnon ? "-" : user.callsign}</TableCell>
          <TableCell>{isAnon ? "-" : user.country}</TableCell>
          <TableCell>{isAnon ? "-" : user.is_verified ? "EVET": "hayır"}</TableCell>
          <TableCellWithCopy text={isAnon ? "-" : user.username} />
          <TableCellWithCopy text={isAnon ? user.last_session : "-"} />
          <TableCell>
            <BanButton variant="outlined" size="small" username={user.username} session={user.last_session} revert={true}>
              Yasağı geri al
            </BanButton>
          </TableCell>
        </TableRow>
      );
    })}
  </TableBody>
  );

});

const ReportActionsTable = React.memo(({ data }) => {
  return (
    <TableBody>
      {data?.map((report) => {
        const badMsgDate = new Date(report.badmessage_timestamp * 1000);
        const reportDate = new Date(report.event_timestamp * 1000);

        return (
          <TableRow key={report.id}>
            <TableCellTooltip text={report.badmessage_transcript} maxLength={30} />
            <TableCellWithCopy text={report.baduser_id === 0 ? "--" : report.baduser_username} />
            <TableCellTooltip text={report.baduser_session} maxLength={20} />
            <TableCell>{formatDate(badMsgDate)}</TableCell>
            <TableCell>
              <BanButton variant="outlined" size="small" username={report.baduser_username} session={report.baduser_session} >
                            Yasakla
              </BanButton>
            </TableCell>
            <TableCellWithCopy text={report.reporter_user_id === 0 ? "--" : report.reporter_username} />
            <TableCellTooltip text={report.reporter_session} maxLength={20} />
            <TableCell>{formatDate(reportDate)}</TableCell>
            <TableCell>
              <BanButton variant="outlined" size="small" username={report.reporter_username} session={report.reporter_session} >
                            Bildireni yasakla
              </BanButton>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  )
});
