const http=require('http')
const server=http.createServer();
const app=require('./app')

app.listen(5000,console.log("server is running 5000"))