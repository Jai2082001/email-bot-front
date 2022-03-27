import './App.css';
import { Button, Form, Table, ProgressBar, Alert, FormControl, Modal } from 'react-bootstrap';
import readXlsxFile from 'read-excel-file';
import {useState} from 'react';
import Select from 'react-select';
import { eventWrapper } from '@testing-library/user-event/dist/utils';

function App() {
  
  const [loading, changeLoading] = useState(false);
  const [bigLoading, changeBigLoading] = useState(false);
  const [table, changeTable] = useState([]);
  const [email, changeEmail] = useState('');
  const [password, changePassword] = useState('');
  const [body, changeBody] = useState([]);
  const [progress, changeProgress] = useState(0);
  const [service, changeService] = useState(false);
  const [custom, changeCustom] = useState('');
  const [result, changeResult] = useState([]);
  const submitHandler = () => {

    if(email && password && service){
      changeProgress(0);
      changeResult([])
      console.log('here we are')
      changeBigLoading(true);
      let totalDone = 0
      let totalRecs = body.length;
      for(let i=0;i<totalRecs;i++){
      ((i)=>{
        const bodyObj = {};
        bodyObj.email = body[i][0];
        bodyObj.subject = body[i][2];
        bodyObj.content = body[i][1];
        bodyObj.service = body[i][3];
        console.log(body)
        fetch(`http://localhost:3004/sendEmail`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'email': email.trim(),
            'password': password.trim(),
            'service': service.trim(),
            'custom': custom.trim()
          },
          body: JSON.stringify(bodyObj)
        }).then((response)=>{
          return response.json()
        }).then((response)=>{
          console.log(response);
          const array = result;
          array.push(response);
          changeResult(array);
          changeProgress((prevValue)=>{
            return prevValue = prevValue + 1
          })
          totalDone = totalDone + 1;
          console.log(totalDone);
          console.log(totalRecs);
          if(totalDone === totalRecs){
            changeBigLoading(false);
            console.log(result)
          }
          
        })
      })(i)
    }
    }else{
      return
    }
    
  }

  const btnHandler = (event) => {
    changeBigLoading(false)
    changeLoading(true);
    readXlsxFile(event.target.files[0]).then((rows)=>{
      console.log(rows)
      changeTable(rows[0]);
      const body = [];
      for(let i=0; i<rows.length;i++){
        if(i===0){
          continue;
        }else{
          body.push(rows[i]);
        }
      }
      console.log(body);
      changeBody(body);
      changeLoading(false);
    })
  }
  console.log(body)

  const options = [
    {label: 'Gmail', value: 'gmail'},
    {label: 'Custom', value: 'custom'}
  ]

  return (
    <div className="App">
      <Modal show={bigLoading}>
        <Modal.Header>
        </Modal.Header>
        <Modal.Body>
          <ProgressBar className='mt-2' animated={true} now={progress / body.length * 100}></ProgressBar>
        </Modal.Body>
        <Modal.Footer>          
        </Modal.Footer>
      </Modal>

      <h1>Email Bot</h1>
      <Form.Group>
        <p>Input The Sending Mail</p>
        <Alert>If its Gmail Make Sure The Email You are Putting is not 2 Step Authenticated and Allows Less Secured Apps if not you can turn it on from here <a href='https://myaccount.google.com/lesssecureapps'>Allow Less Secure Apps</a></Alert>
        {result.length>0 && 
        <div>
          {result.map((singleItem)=>{
            if(singleItem.status === 'done'){
            }else{
              return (
                <Alert variant='danger'>{`Your Email ${singleItem.email} and Content ${singleItem.content} could not be processed`}</Alert>
              )
            }
          })}
        </div>}
        <div className={"divParent"}>
          <FormControl value={email} onChange={(event)=>{changeEmail(event.target.value)}} className='inputEmail' placeholder={`Enter the Sender's Mail`}></FormControl>
          <FormControl value={password} onChange={(event)=>{changePassword(event.target.value)}} className='inputPassword' placeholder={'Enter the password'}></FormControl>
          <Select options={options} onChange={(value)=>{
            changeService(value.value);
          }} />
          {service === 'custom' && <FormControl placeholder='Enter The Custom Domain' value={custom} onChange={(event)=>{
            changeCustom(event.target.value);
          }}></FormControl>}
        </div>
      </Form.Group>
      <Form.Group controlId="formFile" className="mt-6">
        <p>Input Excel File</p>
        <input onChange={btnHandler} type="file" accept='.xlsx, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' />
      </Form.Group>

    {
      body.length > 0 && 
    <Table >
      <thead>
        <th>
          {table[0]}
        </th>
        <th>
          {table[1]}
        </th>
        <th>
          {table[2]}
        </th>
        <th>
          {table[3]}
        </th>
      </thead>
      <tbody>
        {body.map((singleItem)=>{

            return (
              <tr>
                {singleItem.map((item)=>{
                  return (
                  <td>{item}</td>

                  )
                })}
              </tr>
            )
        })}
      </tbody>
    </Table>
    }
    {body.length > 0 && <Button onClick={submitHandler}>Forward Msg</Button>} 
    </div>
  );
}

export default App;
