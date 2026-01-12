import React from 'react';
import Typography from '@mui/material/Typography';
import {Stack, Chip, Grid} from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
import modules from './modules'

import { useDispatch, useSelector } from 'react-redux'
import { apiCall } from '../../redux/apiSlice';

//https://www.techonthenet.com/js/language_tags.php
// <Chip label="valid callsign" icon={<DoneIcon />} size="small" color="success"/>
function SimpleEditor(props){
  const dispatch = useDispatch()
  let [modulesData, setModulesData] = React.useState(props.schema)

  // Reset modulesData when schema changes (e.g., country changes)
  React.useEffect(() => {
    setModulesData(props.schema)
  }, [props.schema])

  // Watch for country changes and update schema accordingly
  React.useEffect(() => {
    const selectedCountry = modulesData[0]?.value
    if (selectedCountry === 'TA' || selectedCountry === 'TB') {
      // Turkish format: 1 digit + 1-3 letters
      if (modulesData.length === 3) {
        setModulesData(prev => {
          const newModules = [...prev]
          // Update digit field to 1 character
          if (newModules[1].module === 'text') {
            newModules[1] = {
              ...newModules[1],
              len: 1,
              ecmaPattern: '^[0-9]*$',
              description: "1 digit",
              value: newModules[1].value.slice(0, 1)
            }
          }
          // Update letters field to 1-3 characters (variable length)
          if (newModules[2].module === 'text') {
            newModules[2] = {
              ...newModules[2],
              minLen: 1,
              maxLen: 3,
              len: undefined,
              ecmaPattern: '^[A-Za-z]*$',
              description: "1-3 letters"
            }
          }
          return newModules
        })
      }
    } else {
      // International format: 2 digits + 3 letters
      if (modulesData.length === 3) {
        setModulesData(prev => {
          const newModules = [...prev]
          // Update digit field to 2 characters
          if (newModules[1].module === 'text') {
            newModules[1] = {
              ...newModules[1],
              len: 2,
              minLen: undefined,
              maxLen: undefined,
              ecmaPattern: '^[0-9]*$',
              description: "2 numbers"
            }
          }
          // Update letters field to 3 characters (fixed length)
          if (newModules[2].module === 'text') {
            newModules[2] = {
              ...newModules[2],
              len: 3,
              minLen: undefined,
              maxLen: undefined,
              ecmaPattern: '^[A-Za-z]*$',
              description: "3 letters"
            }
          }
          return newModules
        })
      }
    }
  }, [modulesData[0]?.value])

  let validationStates = {
    'GOOD': 0,
    'LOADING': 1,
    'BAD': 2,
    'NOOP': 3
  }
  let [validationState, setValidationState] = React.useState(validationStates.NOOP)

  let [validationPromise, setValidationPromise] = React.useState(undefined)

  React.useEffect(()=>{
    //check that all values are valid
    const allValid = modulesData.every(m => {
      if(m.hasOwnProperty('len') && m.len != m.value.length)
        return false
      if(m.hasOwnProperty('minLen') && m.hasOwnProperty('maxLen')) {
        if(m.value.length < m.minLen || m.value.length > m.maxLen)
          return false
      }
      if(m.hasOwnProperty('ecmaPattern') && !(new RegExp(m.ecmaPattern)).test(m.value))
        return false
      return true
    })
    if(allValid){
      //prepare the data for the api request
      let callsign = modulesData.map(m => m.value).join("")
      //pass the value of this component to the parent(this component is used in forms or similar)
      props.setData(callsign)
      //set the state to loading, then start the online validation
      setValidationState(validationStates.LOADING)
      //start the api request
      const livePromise = dispatch(apiCall({
        endpoint: "validate_callsign",
        data: {callsign}
      }))
      //put the validation promise in a react state (we need to preserve it during rerenders if we want to abort it)
      setValidationPromise(livePromise)
      //logic following the promise resolve / reject
      livePromise.unwrap()
        .then(ret => {
          setValidationState(validationStates.GOOD)
        })
        .catch(ret => {
          if (ret.error == 'already_taken')
            setValidationState(validationStates.BAD)
          else if (ret.error != 'abort_error')
            //on errors such as network errors, it's good to remove the
            //loading indicator.
            //However, abort errors indicate that a new request is takin place,
            //and the new request is taking care of the validation states.
            setValidationState(validationStates.NOOP)
        })
    }
    else {
      setValidationState(validationStates.NOOP)
    }
    //cleanup function
    return function cleanUp(){
      validationPromise?.abort()
    }
  }, [modulesData])


  //render the preview
  let preview = modulesData.map( m => {
    let ret = m.value
    if (m.hasOwnProperty("len")){
      ret += '_'.repeat(m.len - m.value.length)
    }
    if(!ret) ret = "__";
    return ret
  } ).join("")
  

  function handleUpdate(i){
    return function(newValue){
      setModulesData( originalData => {
        //make a shallow copy of the array
        let items = [...originalData]
        //make a shallow copy of the element we want to edit
        let item = {...items[i]}
        //update the data
        item.value = newValue
        //put the modified element back into the array, mutating it (it's ok cause it's a shallow copy)
        items[i] = item
        return items
      })
    }
  }

  let renderedModules = modulesData.map( (current, index) => {
        let { module, value, ...props } = current
        let Comp = modules[module]
        return <Comp value={value} key={index} update={handleUpdate(index)} {...props} />
      })

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} >
        <Stack direction="row" spacing={1}>
          <Typography variant="body1">
            {preview}
          </Typography>
          { validationState == validationStates.LOADING ?
              <Chip label="checking availability" icon={<FindReplaceIcon />} size="small" /> :
            validationState == validationStates.BAD ?
              <Chip label="already taken" icon={<ErrorIcon />} size="small" color="error"/> :
            validationState == validationStates.GOOD ?
              <DoneIcon color="success" fontSize="small" /> :
            ''
          }
        </Stack>
      </Grid>

      <Grid item xs={12} >
      {renderedModules}
      </Grid>
        </Grid>
  )

}

const CallSignEditor = (props) =>{
  const country = useSelector(state => state.user.country)

  // Reactive schema that updates when country changes
  const schema = React.useMemo(() => {
    // Turkish callsign format: TA/TB + 1 digit + 1-3 letters
    if (country === 'TA' || country === 'TB') {
      return [
        {
          module: 'country',
          value: country
        },
        {
          module: 'text',
          value: '',
          len: 1,
          ecmaPattern: '^[0-9]*$',
          description: "1 digit"
        },
        {
          module: 'text',
          value: '',
          minLen: 1,
          maxLen: 3,
          ecmaPattern: '^[A-Za-z]*$',
          description: "1-3 letters"
        },
      ]
    }
    // International format: CC + 2 digits + 3 letters
    return [
      {
        module: 'country',
        value: country
      },
      {
        module: 'text',
        value: '',
        len: 2,
        ecmaPattern: '^[0-9]*$',
        description: "2 numbers"
      },
      {
        module: 'text',
        value: '',
        len: 3,
        ecmaPattern: '^[A-Za-z]*$',
        description: "3 letters"
      },
    ]
  }, [country]);
  const [schemaCode,  setSchemaCode] = React.useState("mrse_default")

  function handleSetData(data){
    props.setData(data)
  }

 return (
   <>
    <SimpleEditor schema={schema} setData={handleSetData} />
    </>
 )
}

export default CallSignEditor
