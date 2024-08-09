const express = require('express');
const fs = require('fs');
const path = require('path');
const teamApi = express.Router();

// const app = express();
// app.use(express.json());

const filePath = path.join(__dirname, 'team.json');

//get the team details
teamApi.get('/', (req, res) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
        console.log(data);
        res.send(data);
    })
})

//add a new member to the team

teamApi.post('/addTeam', (req, res) => {
    const newTeam = req.body;
    console.log('New team data:', newTeam);

    if (!newTeam || !newTeam.name || !newTeam.id || !newTeam.members) {
        return res.status(400).send('Invalid team data');
    }

    // Read JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading file');
        }

        let teams;
        try {
            teams = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            teams = [];
        }

        // Check if a team with the same id and name already exists 
        const existingTeam = teams.find(team => team.id === newTeam.id);
        const existingTeamName = teams.find(team => team.name === newTeam.name);

        if (existingTeam) {
            return res.status(400).send('Team with this ID already exists');
        }
        if(existingTeamName){
            return res.status(400).send('Team with this name already exists');
        }

        const memberSet = new Set(newTeam.members);
        if (memberSet.size !== newTeam.members.length) {
            return res.status(400).send('Duplicate members are not allowed');
        }
        
        // chack members are already exists
        const allMembers = teams.flatMap(team => team.members);
        const duplicateMembersInOtherTeams = newTeam.members.some(member => allMembers.includes(member));
        if (duplicateMembersInOtherTeams) {
            return res.status(400).send('One or more members already exist in other teams');
        }

        teams.push(newTeam);

        fs.writeFile(filePath, JSON.stringify(teams, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('Error writing file');
            }
            console.log('New team added successfully');
            res.status(201).json(newTeam); // Return the created team with status 201
        });
    });
});




// get team members by their name
teamApi.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }

        let teams = JSON.parse(data);
        let getTeam = teams.find(team => team.id === id);
        if (!getTeam) {
            return res.status(404).send('Team not found');
        }
        res.json(getTeam);
    });
});


// update team member's details
teamApi.put('/:id', (req, res) => {
    const teamId = parseInt(req.params.id);
    const updatedTeam = req.body;
    console.log(teamId);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.send('Error reading file');
        }

        let teams;
        try {
            teams = JSON.parse(data);
        } catch {
            teams = []
        }
        const teamIndex = teams.findIndex(team => team.id === teamId);
        if (teamIndex === -1) {
            return res.status(404).send('Team not found');
        }

        // check team name if it exists
        const duplicateName = teams.find(team => team.name === updatedTeam.name && team.id !== teamId);
        if (duplicateName) {
            return res.status(400).send('Team with this name already exists');
        }
        
        // check members are already exists
        const allMembers = teams.flatMap(team => team.members);
        const duplicateMembersInOtherTeams = updatedTeam.members.some(member => allMembers.includes(member) &&!teams[teamIndex].members.includes(member));
        if (duplicateMembersInOtherTeams) {
            return res.status(400).send('One or more members already exist in other teams');
        }

        teams[teamIndex] = {...teams[teamIndex],...updatedTeam};

        fs.writeFile(filePath, JSON.stringify(teams, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).send('Error writing file');
            }
            res.send("Team updated successfully");
        })
    })
})


// delete team 
teamApi.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }

        let teams = JSON.parse(data);

        const teamIndex = teams.findIndex(team => team.id === id);
        if (teamIndex === -1) {
            return res.status(404).send('Team not found');
        }

        teams.splice(teamIndex, 1);

        fs.writeFile(filePath, JSON.stringify(teams, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).send('Error writing file');
            }
            res.send('Team deleted successfully');
        });
    });
});


module.exports = teamApi;