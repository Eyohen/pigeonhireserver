const express = require('express');
const db = require ('./models');
const user = require("./route/user");
const auth =  require("./route/auth");
const community =  require('./route/community');
const goal =  require('./route/goal');
const communityType = require('./route/communityType')
const size = require('./route/size');
// import visibility from './route/visibility';
const engagementLevel = require('./route/engagementLevel');
const communicationPlatform = require('./route/communicationPlatform');
// const collaborationType =  require('./route/collaborationType');
const collab = require('./route/collab');
// import submenu from './route/submenu';
// import crockery from './route/crockery';
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');


const app = express();
const port = process.env.API_PORT;


app.use(morgan('dev'))
app.use(helmet());
app.use(express.json());
app.use(cors());

db.sequelize
    .authenticate()
    .then(() => {
        console.log(`postgres connection has been established successfully... ${process.env.NODE_ENV}`)
    })
    .catch((err) => {
        console.log(`unable to connect to the databse ${err.message}`)
        if(
            err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefuseError'
        ){
            console.log('the databse is disconnected please check the connection and try again')
        }
        else{
            console.log(`An error occured while connecting to the database: ${err.message}`)
        }
    })
    

app.use((req, res, next)=>{
    console.log(`incoming request... ${req.method} ${req.path}`)
    next()
})

app.use("/api/auth", auth);
app.use("/api/users", user);
app.use("/api/communities", community);
// app.use("/api/visibility", visibility);
app.use("/api/communityTypes", communityType);
app.use("/api/engagementLevels", engagementLevel);
app.use("/api/communicationPlatforms", communicationPlatform);
// app.use("/api/collaborationTypes", collaborationType)
app.use("/api/collabs", collab);
app.use("/api/goals", goal);
app.use("/api/sizes", size);
// app.use("/api/payments", payment);
// app.use("/api/crockerys", crockery);


if (process.env.NODE_ENV === 'development') {
    // PORT = process.env.TEST_PORT;
    drop = { force: true };
}

db.sequelize.sync({alter:true}).then(() => {
    console.log('All models were synchronized successfully')
    app.listen(port, () => {
        console.log(`App listening on port ${port}`)
    })
})