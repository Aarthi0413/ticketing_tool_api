const express = require("express");
const fs = require("fs");
const path = require("path");
const ticketApi = express.Router();

// const app = express();
// app.use(express.json());

const filePath = path.join(__dirname, "ticket.json");

// get list of tickets
ticketApi.get("/", (req, res) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    console.log(data);
    res.send(data);
  });
});

// add new ticket
ticketApi.post("/addTicket", (req, res) => {
  const newTicket = req.body;
  console.log("New user data:", newTicket);

  // values should not be empty
  if (
    newTicket.title.trim() === "" ||
    newTicket.description.trim() === "" ||
    newTicket.team.trim() === "" ||
    newTicket.status.trim() === "" ||
    newTicket.assignee.trim() === "" ||
    newTicket.reporter.trim() === ""
  ) {
    return res
      .status(400)
      .send("values should not be empty, check where you misssing the value");
    }

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.send("Error reading file");
    }

    let tickets;

    try {
      tickets = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      tickets = [];
    }

    // newTicket.id = tickets.length + 1;

    const existingTicket = tickets.find((ticket) => ticket.id === newTicket.id);
    const existingTicketTitle = tickets.find(
      (ticket) => ticket.title === newTicket.title
    );
    if (existingTicket) {
      return res.status(400).send("Ticket with this ID already exists");
    }
    if (existingTicketTitle) {
      return res.status(400).send("Ticket with this title already exists");
    }

    tickets.push(newTicket);

    // updated data back to the file
    fs.writeFile(filePath, JSON.stringify(tickets, null, 2), "utf8", (err) => {
      if (err) {
        return res.send("Error writing file");
      }
      console.log("User added successfully");
      // res.json({ id: newTicket.id, ...newTicket });
      res.json(newTicket);
    });
  });
});

// get ticket by id
ticketApi.get("/:id", (req, res) => {
  const ticketId = parseInt(req.params.id);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.send("Error reading file");
    }
    let tickets = JSON.parse(data);
    let ticket = tickets.find((each) => each.id === ticketId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(ticket);
  });
});

// update the ticket
ticketApi.put("/:id", (req, res) => {
  const ticketId = parseInt(req.params.id);
  console.log(typeof ticketId);
  const updatedTicket = req.body;

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).send("Error reading file");
    }

    let tickets = JSON.parse(data);

    const ticketIndex = tickets.findIndex((ticket) => ticket.id === ticketId);
    if (ticketIndex === -1) {
      return res.status(404).send("Ticket not found");
    }

    const existingTitle = tickets.find(
      (ticket) => ticket.title === updatedTicket.title && ticket.id !== ticketId
    );
    if (existingTitle) {
      return res.status(400).send("Ticket with this title already exists");
    }

    tickets[ticketIndex] = { ...tickets[ticketIndex], ...updatedTicket };

    fs.writeFile(filePath, JSON.stringify(tickets, null, 2), "utf8", (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return res.status(500).send("Error writing file");
      }
      console.log("Ticket updated successfully");
      res.json(tickets[ticketIndex]);
    });
  });
});

// delete the ticket
ticketApi.delete("/:id", (req, res) => {
  const ticketId = parseInt(req.params.id);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).send("Error reading file");
    }
    let tickets = JSON.parse(data);
    const ticketIndex = tickets.findIndex((ticket) => ticket.id === ticketId);
    if (ticketIndex === -1) {
      return res.send("Ticket not found");
    }
    tickets.splice(ticketIndex, 1);

    fs.writeFile(filePath, JSON.stringify(tickets, null, 2), "utf8", (err) => {
      if (err) {
        return res.send("Error writing file");
      }
      console.log("Ticket deleted successfully");
      res.send("Ticket deleted successfully");
    });
  });
});

module.exports = ticketApi;
