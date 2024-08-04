import app from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import logger from "./utils/Logger.js";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

const APP_ENV = process.env.APP_ENV || "local";

dotenv.config();

const DB = process.env.DATABASE_URL.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => logger.info("DB connected successfully"))
  .catch((err) => logger.error(`DB connection error: ${err.message}`));

const PORT = process.env.PORT;

const server = http.createServer(app); // Creating HTTP server
const wss = new WebSocketServer({ server }); // Creating WebSocket server

let rooms = {
  room1: 0,
  room2: 0,
  room3: 0,
}; // Object to store room data

let users = {}; // Object to store user data
let gameStates = {}; // Object to store game states
let frozenRooms = {}; // Object to store frozen rooms

// Handling new WebSocket connections
wss.on("connection", (ws) => {
  let currentUsername = null;
  let currentRoom = null;

  // Send initial room data to the client
  ws.send(JSON.stringify({ type: "roomData", rooms }));

  // Handling messages from the client
  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.type === "join") {
        // Check if the room is frozen
        if (frozenRooms[parsedMessage.room]) {
          ws.send(
            JSON.stringify({
              type: "roomFrozenError",
              message: "This room is currently frozen. Please wait 2 minutes.",
            })
          );
          return;
        }

        // Join the room
        currentRoom = parsedMessage.room;
        rooms[currentRoom] = (rooms[currentRoom] || 0) + 1;
        broadcastRoomData();

        // Start the game if there are 2 players in the room
        if (rooms[currentRoom] === 2) {
          startGame(currentRoom);
        }
      }

      if (parsedMessage.type === "leave") {
        // Leave the room
        if (currentRoom && rooms[currentRoom] > 0) {
          rooms[currentRoom]--;
          if (rooms[currentRoom] === 0) {
            if (
              gameStates[currentRoom] &&
              gameStates[currentRoom].round === 9
            ) {
              // Freeze the room for 2 minutes
              frozenRooms[currentRoom] = true;
              setTimeout(() => {
                delete frozenRooms[currentRoom];
                delete gameStates[currentRoom]; // Clear game state after unfreezing
              }, 2 * 60 * 1000); // 2 minutes

              broadcastMessage(currentRoom, { type: "roomFrozen" });
            } else {
              broadcastMessage(currentRoom, { type: "roomClosed" });
              delete gameStates[currentRoom]; // Clear game state if not the 9th round
            }
          }
          broadcastRoomData();
        }
      }

      if (parsedMessage.type === "status") {
        // Update user status
        currentUsername = parsedMessage.username;
        users[currentUsername] = parsedMessage.status;
        broadcastUserStatus();
      }

      if (parsedMessage.type === "crateOpening") {
        // Handle crate opening
        if (
          gameStates[currentRoom] &&
          (gameStates[currentRoom].crateOpening ||
            gameStates[currentRoom].crateOpened)
        ) {
          ws.send(
            JSON.stringify({
              type: "crateOpeningError",
              message:
                "Another crate is being opened or has already been opened in this round.",
            })
          );
        } else {
          if (gameStates[currentRoom]) {
            gameStates[currentRoom].crateOpening = true;
            const { crateId, skin, username } = parsedMessage;
            gameStates[currentRoom].crates =
              gameStates[currentRoom].crates || [];
            gameStates[currentRoom].crates.push({ crateId, skin });
            broadcastMessage(currentRoom, {
              type: "crateOpening",
              crateId,
              skin,
              username,
            });
          }
        }
      }

      if (parsedMessage.type === "crateOpened") {
        // Handle crate opened
        if (gameStates[currentRoom]) {
          gameStates[currentRoom].crateOpening = false;
          gameStates[currentRoom].crateOpened = true;
        }
      }

      if (parsedMessage.type === "roundCompleted") {
        // Handle round completion
        if (gameStates[currentRoom]) {
          gameStates[currentRoom].round++;
          if (gameStates[currentRoom].round <= 9) {
            startRound(currentRoom);
          } else {
            delete gameStates[currentRoom];
          }
        }
      }

      if (parsedMessage.type === "closeModal") {
        // Handle modal close
        broadcastMessage(currentRoom, { type: "closeModal" });
      }
    } catch (error) {
      console.error("Failed to parse message:", message, error);
    }
  });

  // Handling WebSocket disconnection
  ws.on("close", () => {
    if (currentUsername) {
      users[currentUsername] = false;
      broadcastUserStatus();
    }

    if (currentRoom && rooms[currentRoom] > 0) {
      rooms[currentRoom]--;
      if (rooms[currentRoom] === 0) {
        if (gameStates[currentRoom] && gameStates[currentRoom].round === 9) {
          // Freeze the room for 2 minutes
          frozenRooms[currentRoom] = true;
          setTimeout(() => {
            delete frozenRooms[currentRoom];
            delete gameStates[currentRoom]; // Clear game state after unfreezing
          }, 2 * 60 * 1000); // 2 minutes

          broadcastMessage(currentRoom, { type: "roomFrozen" });
        } else {
          broadcastMessage(currentRoom, { type: "roomClosed" });
          delete gameStates[currentRoom]; // Clear game state if not the 9th round
        }
      }
      broadcastRoomData();
    }
  });
});

// Function to start the game
function startGame(room) {
  gameStates[room] = {
    round: 1,
    countdown: 10,
    crateOpening: false,
    crateOpened: false,
    crates: [],
  };
  broadcastMessage(room, { type: "gameStart", round: 1 });
  startRound(room);
}

// Function to start a new round
function startRound(room) {
  if (!gameStates[room] || gameStates[room].round > 9) {
    return;
  }

  gameStates[room].countdown = 10;
  gameStates[room].crateOpening = false;
  gameStates[room].crateOpened = false;
  broadcastMessage(room, { type: "startRound", round: gameStates[room].round });
  startCountdown(room);
}

// Function to start the countdown for crate opening
function startCountdown(room) {
  const interval = setInterval(() => {
    if (!gameStates[room]) {
      clearInterval(interval);
      return;
    }

    gameStates[room].countdown--;
    broadcastMessage(room, {
      type: "countdown",
      countdown: gameStates[room].countdown,
    });

    if (gameStates[room].countdown <= 0) {
      clearInterval(interval);
      broadcastMessage(room, {
        type: "enableCrates",
        round: gameStates[room].round,
      });
    }
  }, 1000);
}

// Function to broadcast room data to all clients
function broadcastRoomData() {
  const data = JSON.stringify({ type: "roomData", rooms });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Function to broadcast user status to all clients
function broadcastUserStatus() {
  const data = JSON.stringify({ type: "userStatus", users });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Function to broadcast a message to all clients
function broadcastMessage(room, message) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Start the server
server.listen(PORT, () => {
  logger.info(`Server started on port ${PORT} in ${APP_ENV} mode`);
});
