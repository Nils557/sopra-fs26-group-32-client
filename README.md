# 🌍 GeoGuess City (Client)

> This is a real-time, multiplayer geography game in which players race to identify mystery cities by placing a pin on an interactive map.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

---

## Table of Contents

- [Introduction](#introduction)
- [Technologies](#technologies)
- [High-Level Components](#high-level-components)
- [Scoring](#-scoring)
- [Music & Sound Effects](#-music--sound-effects)
- [Illustrations](#illustrations)
- [Launch & Deployment](#launch--deployment)
- [Roadmap](#-roadmap)
- [Authors & Acknowledgment](#-authors--acknowledgment)
- [License](#license)

---

## Introduction

**GeoGuess City** is a fast-paced, real-time, multiplayer web game that was developed as part of the Software Praktikum course at the University of Zurich. Players are shown street-level images of a mystery city sourced from the Mapillary API, and must place a pin on an interactive world map to guess the location. The game is fully synchronised in real time via WebSocket, so there is no waiting or refreshing. It is fully playable on both mobile and desktop. No app required, just a browser.

This is the **client repository**. The backend lives [here](https://github.com/Nils557/sopra-fs26-group-32-server).

---

## Technologies

* **[Next.js 15](https://nextjs.org/)** (with Turbopack)  React framework, routing, SSR
* **[TypeScript](https://www.typescriptlang.org/)**  Type-safe JavaScript
* **[Ant Design](https://ant.design/)** (antd v6)  UI component library
* **[Leaflet](https://leafletjs.com/)** + **[OpenStreetMap](https://www.openstreetmap.org/)**  Interactive map for pin placement
* **[STOMP.js](https://stomp-js.github.io/stomp-websocket/)** over SockJS  Real-time WebSocket communication
* **[Vercel](https://vercel.com/)**  Frontend hosting and CI/CD

---

## High-Level Components

The client is structured around four main areas, each corresponding to a stage in the game flow.

### 1. [`WebSocketContext`](app/contexts/WebSocketContext.tsx)
The central nervous system of the application. This React context (mounted via `ClientProviders`) manages a persistent STOMP connection to the backend via SockJS. It provides a generic `subscribe`/`unsubscribe`/`disconnect` API that screen components use to register listeners on lobby-specific topics (timer, images, player lists, scores and game state). All real-time synchronisation such as starting a game, pushing new images every nine seconds, ending rounds and transitioning between screens flows through here.

### 2. [`GameScreen`](app/game/[code]/page.tsx)
This is the core gameplay component. It renders the Mapillary street-level image carousel, where a new image of the same location is revealed every nine seconds via WebSocket. It also renders the synchronised countdown timer and the interactive Leaflet map, where players drop their pin. Player indicators turn green when a guess has been submitted.

### 3. [`WaitingRoom`](app/lobbies/[code]/page.tsx)
Handles both host and player views of the pre-game lobby. The host sees a "Start Game" button that activates once at least two players have joined; regular players see a waiting message. The player list updates in real time as new players join.

### 4. [`RoundSummary`](app/game/[code]/round-summary/page.tsx)
Shown after each round ends. Displays the correct location on the map and a live scoreboard sorted by total score. Transitions automatically to the next round or the final results screen after a fixed countdown.

> **Session Management:** The player's `userId` and `username` are stored in `sessionStorage` via a `useSessionStorage` hook and read by components across the app.

---

## 📍 Scoring

Points are awarded based on how close your pin is to the actual location:

| Accuracy | Points |
|---|---|
| Within the correct **city** | 2000 Points ✅ |
| Within the correct **country** | 1000 - 1999 Points 🟡 |
| Within **1000km radius** | 0 - 999 Points ❌ |

Pin placement is locked the moment you confirm. No take-backs, choose wisely!

---

## 🎵 Music & Sound Effects

GeoGuess City features a full audio experience that can be controlled independently for music and sound effects.

**Music** plays contextually throughout the game:
- Lobby music while creating lobbies or waiting for players to join
- In-game music during active rounds

**Sound Effects** trigger on key game moments:
- A gong strike at the start of every new round
- Celebration sound on the final results screen
- Click sounds on every interaction with buttons

Both can be toggled independently via the audio controls. Mute the music, keep the effects, or silence everything. Your call. 
Note: the audio controls are only visible on non-game pages. They are hidden during active rounds, the round summary, and the final results screen.

---

## Illustrations

GeoGuess City follows a linear, guided user flow across seven screens.

#### Landing / Username Entry
A new player enters a unique username to create a temporary profile. The input is pre-filled with a randomly generated name (adjective + animal + number, e.g. `SleepyCapybara42`) that can be re-rolled with a button. Alternatively, the user can choose their own name by writing it into the name field. If the username is already taken, an inline error is shown. On success, the player is redirected to the home screen.

<img width="2560" height="1255" alt="landingpage" src="https://github.com/user-attachments/assets/fb5eda87-e503-4f95-88a4-dd222a34e7e1" />

#### Home Screen
From here, a player can either **create a new lobby** (leading to the lobby configuration screen) or **join an existing one** by entering a lobby code.

<img width="2560" height="1253" alt="homescreen" src="https://github.com/user-attachments/assets/4775a419-714f-4a6c-ae3f-d49b1111cd89" />

#### Lobby Configuration (Host only)
The host sets the number of rounds (1–10) and the maximum number of players (2–10). After clicking "Create Lobby", a unique lobby code is generated and the host is redirected to the waiting room.

<img width="2560" height="1254" alt="lobbycreation" src="https://github.com/user-attachments/assets/92b88ebc-5df9-40e6-9dd7-f2d49b861b24" />

#### Waiting Room
The host sees the shareable lobby code and a "Start Game" button (only active with ≥ 2 players). Regular players see a waiting message. The player list updates live via WebSocket as people join.

Host:

<img width="2543" height="1256" alt="lobby(Host)" src="https://github.com/user-attachments/assets/c82b4325-a92a-44c1-bdeb-8b4421446c95" />

Normal player:

<img width="2560" height="1257" alt="lobby (normal player)" src="https://github.com/user-attachments/assets/6b61c99e-1749-43ca-ae7f-eae115b19312" />

#### Game Screen / Round in Progress
The main game screen shows:
- A street-level image from Mapillary (a new image of the same city is pushed every 9 seconds)
- A 45-second countdown timer synchronized across all players (5 images per round)
- Player indicators that turn **green** when a guess has been submitted
- An interactive Leaflet map where the player drops their pin

Once the pin is placed it is locked in and cannot be changed.

<img width="2560" height="1254" alt="game" src="https://github.com/user-attachments/assets/abba129d-9344-4fb6-b088-54f18de82e71" />

#### Round Summary
After each round, all players see the correct location on the map and the current leaderboard. The next round starts automatically after a short countdown, or if it was the last round, all players are redirected to the final results screen.

<img width="2560" height="1254" alt="round-summary" src="https://github.com/user-attachments/assets/0ee4d675-f0c4-4f30-aa1e-edbfaa16f8dc" />

#### Final Results
The final standings screen announces the winner and allows players to return to home.

<img width="1248" height="692" alt="Final-Result-Screen" src="https://github.com/user-attachments/assets/239adafa-e975-46e1-b031-4cfd21917a21" />


---

## Launch & Deployment

### Prerequisites

- Node.js ≥ 18
- The [backend server](https://github.com/Nils557/sopra-fs26-group-32-server) running locally or accessible at a configured URL

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/Nils557/sopra-fs26-group-32-client.git
cd sopra-fs26-group-32-client

# 2. Install dependencies
npm install
# or use the convenience script:
source setup.sh

# 3. Configure environment
# Create a .env.local file in the project root:
echo "NEXT_PUBLIC_PROD_API_URL=http://localhost:8080" > .env.local
# Replace with the production URL if connecting to the deployed backend

# 4. Start the development server (Next.js with Turbopack)
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Tests

The frontend does not currently have a dedicated test suite. Client-side logic is covered by the backend integration and REST interface tests in the [server repository](https://github.com/Nils557/sopra-fs26-group-32-server).

### Production Build

```bash
npm run build
npm run start
```

### Deployment & Releases (Vercel)

The frontend is deployed on [Vercel](https://vercel.com/). Every push to `main` triggers an automatic production deployment — there is no manual release step required. To set up a new environment:

1. Connect the repository to Vercel via the Vercel dashboard.
2. Set the environment variable in the Vercel project settings:
   ```
   NEXT_PUBLIC_PROD_API_URL=https://sopra-fs26-group-32-server.oa.r.appspot.com
   ```
3. Vercel will automatically run `npm run build` and deploy the output.

---

## 📋 Roadmap

The following features would be the most impactful additions for new contributors:

1. **Friend System & Private Lobbies**
   Currently, players share a lobby code manually to play together. A friend system with persistent accounts would let players add each other, see who's online, and launch private lobbies directly no code-sharing needed. This would require persistent user accounts on the backend and a friends/presence API.

2. **Spectator Mode**
   Players who arrive after a game has started are currently blocked with an error. A spectator role would let latecomers watch the ongoing game:    Images, timer, and player indicators (without submitting answers).

3. **Region & Difficulty Filters**
   Mystery locations are currently drawn from an internal dataset at random. Letting the host restrict a session to a specific continent, country, or difficulty tier (major cities vs. rural areas) would make each session much more customizable.

---

## 👥 Authors & Acknowledgment

Group 32 - University of Zurich, Software Praktikum FS26

- [Faiaz Islam](https://github.com/faiaz18) - Group Leader, Backend
- [Bleron Neziri](https://github.com/Bleronn4) - Frontend
- [Nils Schmid](https://github.com/Nils557) - Frontend, Infrastructure
- [Danish Mughal](https://github.com/vanix-dm) - Backend
- [Thissan Iyadurai](https://github.com/scthisko) - Backend

---

## 🙏 Acknowledgments

- SOPRA team at UZH
- [Mapillary](https://www.mapillary.com/) for the street-level imagery API
- [Leaflet](https://leafletjs.com/) and [OpenStreetMap](https://www.openstreetmap.org/copyright) for the open mapping stack
- [Pixabay](https://pixabay.com/music/) for royalty-free in-game music

---

## License

This project is licensed under the [Apache License 2.0](LICENSE).
