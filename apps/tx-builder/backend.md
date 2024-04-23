# Connect to backend
## 1. Setup env
Create `.env` file from `.env.example`, make sure `.env` file contains
`REACT_APP_SUPABASE_URL` & `REACT_APP_SUPABASE_KEY`

## 2. Example of Proof requests
### GET
Simple request without params

url: `${process.env.REACT_APP_SUPABASE_URL}/rest/v1/proofs`

example response
`[
{
"id": 1,
"created_at": "2024-04-23T19:22:56.658117+00:00",
"proof": {
"data": "custom proof data"
},
"root": {
"data": "custom root data"
}
},
{
"id": 2,
"created_at": "2024-04-23T19:23:12.004768+00:00",
"proof": {
"data": "custom proof data"
},
"root": {
"data": "custom root data"
}
},
{
"id": 3,
"created_at": "2024-04-23T19:23:21.91342+00:00",
"proof": {
"data": "custom proof data"
},
"root": {
"data": "custom root data"
}
}
]`

can be filtered, need pass params like this
`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/proofs?id=eq.1&select=*`
where `id` is column name

### POST
url
`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/proofs`

example body 
`{ proof: {data: 'custom proof data'}, root: {data: 'custom root data'} }`

`proof` & `root` in Json object, can be any

if want insert a lot of rows, body can be passed as array

### Delete
url
`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/proofs?id=eq.1`
where `id` is column name


## 3. Example of Transactions requests
### GET
Simple request without params

url: `${process.env.REACT_APP_SUPABASE_URL}/rest/v1/transactions`

example response
`[
{
"id": 1,
"created_at": "2024-04-23T19:43:40.823017+00:00",
"address_to": "0x",
"value": "1111",
"memory_data": {
"data": "memory data"
},
"proofs": [
{
"data": "proof 1"
},
{
"data": "proof 2"
},
{
"data": "proof 3"
}
],
"operation": {
"data": "operation data"
}
},
{
"id": 2,
"created_at": "2024-04-23T19:43:49.094059+00:00",
"address_to": "0x",
"value": "1111",
"memory_data": {
"data": "memory data"
},
"proofs": [
{
"data": "proof 1"
},
{
"data": "proof 2"
},
{
"data": "proof 3"
}
],
"operation": {
"data": "operation data"
}
},
{
"id": 3,
"created_at": "2024-04-23T19:43:50.06553+00:00",
"address_to": "0x",
"value": "1111",
"memory_data": {
"data": "memory data"
},
"proofs": [
{
"data": "proof 1"
},
{
"data": "proof 2"
},
{
"data": "proof 3"
}
],
"operation": {
"data": "operation data"
}
}
]`

can be filtered, need pass params like this
`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/transactions?id=eq.1&select=*`
where `id` is column name

### POST
url
`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/transactions`

example body
`{ address_to: '0x', value: '1111', memory_data: {data: 'memory data'}, proofs: [{data: 'proof 1'}, {data: 'proof 2'}, {data: 'proof 3'}], operation: {data: 'operation data'} }`

`address_to` - string address wallet
`value` - string value
`memory_data` - can be any json
`proofs` - can be any array json
`operation` - can be any json




if want insert a lot of rows, body can be passed as array

### Delete
url
`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/transactions?id=eq.1`
where `id` is column name
