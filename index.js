const express = require("express");
const app = express();
app.use(express.json());

const ticketApi = require("./api_project/ticket_api/ticket");
const teamApi = require("./api_project/team_api/team");
const userApi = require("./api_project/user_api/user");


app.use('/ticket',ticketApi);
app.use('/team',teamApi);
app.use('/user',userApi);


app.listen(3000, (error) => {
    if (error){
        console.log('Server start failed')
    }
    console.log(`Server Running on 3000 Production`);
})