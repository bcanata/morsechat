import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Stack,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { closeDialog } from '../../redux/dialogSlice';
import { apiCall } from '../../redux/apiSlice';
import { useSnackbar } from 'notistack';

export const BanUserDialog = () => {
  const dispatch = useDispatch();
  const {enqueueSnackbar} = useSnackbar();
  const { open, username, session, revert } = useSelector((state) => state.dialog);

  const [notes, setNotes] = useState('');
  let [apiPromise, setApiPromise] = React.useState(undefined)

  useEffect(() => {
    if (open) setNotes('');
  }, [open]);

  const handleConfirm = () => {
    if (!notes.trim()) return;


    const livePromise = dispatch(apiCall({
      endpoint: "moderation/ban",
      data: {
        baduser_username: username,
        baduser_session: session,
        notes: notes,
        is_revert: revert
      }
    }))

    // we need to preserve this promise during rerenders if we want to abort it
    setApiPromise(livePromise)
    livePromise.unwrap()
      .then(ret => {
        console.log(ret)
        let actionName = revert ? "yasaklama GERİ ALINDI başarılı." : "yasaklama başarılı"
        enqueueSnackbar(actionName, {variant: "success", preventDuplicate:true})
        dispatch(closeDialog());
      })
      .catch(ret => {
        console.log(ret)
        let actionName = revert ? "yasaklama GERİ ALMA başarısız." : "yasaklama başarısız"
      enqueueSnackbar(actionName, {variant: "error", preventDuplicate:true})
      dispatch(closeDialog());
      })
  };

  React.useEffect(()=>{
    return function cleanUp(){
      apiPromise?.abort()
    }
  }, [])

  const title = revert ? 'Yasağı Geri Al' : 'Kullanıcıyı Yasakla';
  const actionLabel = revert ? 'Yasağı Geri Al' : 'Yasakla';
  const displayUser = username ? `kullanıcı "${username}"` : "bu anonim kullanıcı"
  const description = revert
    ? `${displayUser} için yasağı GERİ ALMAK istediğinizden emin misiniz?`
    : `${displayUser} için YASAKLAMAK istediğinizden emin misiniz?`;

  return (
    <Dialog open={open} onClose={() => dispatch(closeDialog())} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography>{description}</Typography>
          {session &&
            <Typography>Kullanıcı cihazı: {session}</Typography>
          }
          <TextField
            multiline
            minRows={3}
            fullWidth
            label="Denetçi Notları"
            placeholder="Gerekçe veya notlarınızı buraya yazın..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => dispatch(closeDialog())}>İptal</Button>
        <Button
          color={revert ? 'primary' : 'error'}
          variant="contained"
          onClick={handleConfirm}
          disabled={!notes.trim()}
        >
          {actionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
