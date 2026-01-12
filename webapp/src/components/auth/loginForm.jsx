import React from 'react';
import {Typography, Grid, TextField, Button, Link, Stack, IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import { useDispatch } from 'react-redux'
import { loginUser } from '../../redux/userSlice';

const LoginForm = ({setPage}) =>{

  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar();
  let [form, setForm] = React.useState({
    username: '',
    password: '',
  })

  const initialError = {
    username: '',
    password: '',
  };
  let [error, _setError] = React.useState(initialError)

  function resetError(){
      _setError(initialError)
  }
  function setError(type, error){
      _setError(f => ({
        ...f,
        [type]: error
      }))
  }

  function handleUpdate(type){
    return function update(data){
      setForm(f => ({
        ...f,
        [type]: data.target.value
      }))
      setError(type, '')
    }
  }


  function clientValidate(){
    let isGood = true
    //username length
    if(form.username.length <3 || form.username.length > 20){
      setError('username', 'geçersiz uzunluk')
      isGood = false
    }
    //username content
    else if(!/^[A-Za-z0-9-_]+$/.test(form.username)){
      setError('username', 'geçersiz karakterler')
      isGood = false
    }
    //password length
    if(form.password.length <8 || form.password.length > 255){
      setError('password', 'çok kısa')
      isGood = false
    }
    return isGood
  }
  async function handleLogin(e){
    e.preventDefault()
    resetError()
    if (!clientValidate())
      return
    try {
      const res = await dispatch(loginUser(form)).unwrap()
      setPage("")
    }
    catch (res) {
      if (res.error == "invalid_credentials") {
        enqueueSnackbar('yanlış kullanıcı adı veya şifre', { variant: "error", preventDuplicate: true })
        setError('username', ' ')
        setError('password', ' ')
      }
      else
        enqueueSnackbar(`kayıt başarısız oldu. ${res.error} ${res.details ?? ''}`, { variant: "error", preventDuplicate: true })
    }
  }

  return (
    <form onSubmit={handleLogin} >

    <Grid container spacing={3} >
      <Grid item xs={12} >
        <IconButton aria-label="close" color="primary" onClick={e => setPage("")}>
          <CloseIcon />
        </IconButton>
      </Grid>
      <Grid item xs={12} >
        <Typography variant="h5" color="primary" >
          Giriş Yap
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField label="Kullanıcı Adı" type="text" value={form.username}
          onChange={handleUpdate('username')} fullWidth variant="standard"
          error={error.username.length > 0} helperText={error.username.trim()} />
      </Grid>
      <Grid item xs={12}>
        <TextField label="Şifre" type="password" value={form.password}
          onChange={handleUpdate('password')} fullWidth variant="standard"
          error={error.password.length > 0} helperText={error.password.trim()} />
      </Grid>
      <Grid item xs={12} >
        <Stack direction="row" sx={{ padding: "10px" }} alignItems="center" spacing={1}>
          <Button size="medium" color="secondary" type="submit" variant="contained">
            Giriş Yap
          </Button>

          <Typography variant="body1" color="primary" >
            Hesabınız yok mu?
          </Typography>
          <Link
            component="button"
            variant="body1"
            onClick={() => { setPage("register") }}
          >
            kayıt ol
          </Link>

        </Stack>
      </Grid>
    </Grid>
    </form>
  )
}

export default LoginForm
