const express = require("express");
const fs = require("fs");
const path = require("path");
const userApi = express.Router();

const filePath = path.join(__dirname, "users.json");

// get all users
userApi.get("/", (req, res) => {
  fs.readFile(filePath, "utf-8", (err, data) => {
    console.log(data);
    res.send(data);
  });
});

// add the user
userApi.post("/addUser", (req, res) => {
  const newUser = req.body;
  console.log("New user data:", newUser);

  // values should not be empty
  if (!newUser.firstname || newUser.firstname.trim() === "") {
    return res.status(400).send("Firstname should not be empty");
  }

  // email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newUser.email)) {
      return res.status(400).send('Invalid email format');
  }

  // phone validation
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(newUser.phone)) {
    return res.status(400).send('Phone number must be exactly 10 digits');
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.send("Error reading file");
    }

    let users;

    try {
      users = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      users = [];
    }

    const duplicateId = users.find((user) => user.id === newUser.id);
    const dublicateByFirstname = users.find(
      (user) => user.firstname === newUser.firstname && user.id !== newUser.id
    );
    const duplicateByEmail = users.find(
      (user) => user.email === newUser.email && user.id !== newUser.id
    );
    const duplicateByEmployeeId = users.find(
      (user) => user.employeeId === newUser.employeeId && user.id !== newUser.id
    );
    const duplicateByPhone = users.find(
      (user) => user.phone === newUser.phone && user.id !== newUser.id
    );

    if (duplicateId) {
      return res.status(400).send("User with this ID already exists");
    }
    if (dublicateByFirstname) {
      return res.status(400).send("User with this firstname already exists");
    }
    if (duplicateByEmail) {
      return res.status(400).send("User with this email already exists");
    }
    if (duplicateByPhone) {
      return res.status(400).send("User with this phone number already exists");
    }
    if (duplicateByEmployeeId) {
      return res.status(400).send("User with this employee ID already exists");
    }

    users.push(newUser);
    // updated data back to the file
    fs.writeFile(filePath, JSON.stringify(users, null, 2), "utf8", (err) => {
      if (err) {
        return res.send("Error writing file");
      }
      console.log("User added successfully");
      res.json(newUser);
    });
  });
});

// getting user by id
userApi.get("/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.send("Error reading file");
    }
    let users = JSON.parse(data);
    let user = users.find((each) => each.id === userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  });
});

// update user data
userApi.put("/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const updatedUser = req.body;
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      //console.error(err);
      return res.send("Error reading file");
    }
    let users = JSON.parse(data);
    let userIndex = users.findIndex((each) => each.id === userId);
    if (userIndex === -1) {
      return res.send("User not found");
    }

    const duplicateName = users.find(
      (user) =>
        user.firstname === updatedUser.firstname && user.id !== updatedUser.id
    );
    const empId = users.find(
      (user) =>
        user.employeeId === updatedUser.employeeId && user.id !== updatedUser.id
    );
    const duplicateEmail = users.find(
      (user) => user.email === updatedUser.email && user.id !== updatedUser.id
    );
    const duplicatePhone = users.find(
      (user) => user.phone === updatedUser.phone && user.id !== updatedUser.id
    );

    if (duplicateName) {
      return res.status(400).send("User with this firstname already exists");
    }
    if (empId) {
      return res.status(400).send("User with this employee ID already exists");
    }
    if (duplicateEmail) {
      return res.status(400).send("User with this email already exists");
    }
    if (duplicatePhone) {
      return res.status(400).send("User with this phone number already exists");
    }

    users[userIndex] = { ...users[userIndex], ...updatedUser };

    fs.writeFile(filePath, JSON.stringify(users, null, 2), "utf8", (err) => {
      if (err) {
        //console.error('Error writing file:', err);
        return res.send("Error writing file");
      }
      console.log("User updated successfully");
      res.json(users[userIndex]);
    });
  });
});

// delete user by id
userApi.delete("/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.send("Error reading file");
    }
    let users = JSON.parse(data);
    let userIndex = users.findIndex((each) => each.id === userId);
    if (userIndex === -1) {
      return res.send("User not found");
    }
    users.splice(userIndex, 1);

    fs.writeFile(filePath, JSON.stringify(users, null, 2), "utf8", (err) => {
      if (err) {
        return res.send("Error writing file");
      }
      console.log("User deleted successfully");
      res.send("User deleted successfully");
    });
  });
});

module.exports = userApi;
