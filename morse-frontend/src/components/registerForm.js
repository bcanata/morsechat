import React from 'react';
import {Typography, Grid, TextField, Button, Divider, IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import CallSignEditor from './callSignEditor/callSignEditor'


const RegisterForm = ({state, reload, setPage, post}) =>{
  let [form, setForm] = React.useState({
    username: '',
    email: '',
    password: '',
    callsign: undefined
  })

  const initialError = {
    username: '',
    email: '',
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
    }
  }

  function clientValidate(){
    let isGood = true
    //username length
    if(form.username.length <3 || form.username.length > 20){
      setError('username', 'invalid length')
      isGood = false
    }
    //username content
    else if(!/^[A-Za-z0-9-_]+$/.test(form.username)){
      setError('username', 'invalid characters')
      isGood = false
    }
    //email length
    if(form.email.length <6 || form.email.length > 255){
      setError('email', 'invalid format')
      isGood = false
    }
    //email format
    if(!/\S+@\S+\.\S+/.test(form.email)){
      setError('email', 'invalid format')
      isGood = false
    }
    //password length
    if(form.password.length <8 || form.password.length > 255){
      setError('password', 'too short')
      isGood = false
    }
    //valid callsign
    if(!form.callsign){
      isGood = false
    }

    return isGood
  }
  async function handleRegister(){
    resetError()
    if (!clientValidate())
      return
    const res = await post('register', form);
    console.log(res)
    if(res.success){
      reload()
      setPage("menu")
    }
  }

  return (
    <Grid container spacing={3} >


      <Grid item xs={12} >
        <IconButton aria-label="close" color="primary" onClick={e => setPage("menu") }>
          <CloseIcon />
        </IconButton>
      </Grid>
      <Grid item xs={12} >
        <Typography variant="h5" color="primary" >
          your call sign
        </Typography>
      </Grid>
      <Grid item xs={12} >
        <CallSignEditor setData={e => setForm( f => ({...f, callsign:e}) )}/>
      </Grid>
      <Grid item xs={12} >
        <Divider />
      </Grid>
      <Grid item xs={12} >
        <Typography variant="h5" color="primary" >
          account data
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Username" type="text" value={form.username} 
        onChange={handleUpdate('username')} fullWidth variant="standard"
        error={error.username.length > 0} helperText={error.username} />
      </Grid>
      <Grid item xs={12} md={6} >
        <TextField label="Email" type="email" value={form.email}
        onChange={handleUpdate('email')} fullWidth variant="standard"
        error={error.email.length > 0} helperText={error.email} />
      </Grid>
      <Grid item xs={12} >
        <TextField label="password" type="password" value={form.password}
        onChange={handleUpdate('password')} fullWidth variant="standard"
        error={error.password.length > 0} helperText={error.password} />
      </Grid>
      <Grid item xs={12} >
        <Button size="medium" color="secondary" onClick={handleRegister} variant="contained">
          Register
        </Button>
      </Grid>
    </Grid>
  )
}

export default RegisterForm
