# Contributions

Every member has to complete at least 2 meaningful tasks per week, where a
single development task should have a granularity of 0.5-1 day. The completed
tasks have to be shown in the weekly TA meetings. You have one "Joker" to miss
one weekly TA meeting and another "Joker" to once skip continuous progress over
the remaining weeks of the course. Please note that you cannot make up for
"missed" continuous progress, but you can "work ahead" by completing twice the
amount of work in one week to skip progress on a subsequent week without using
your "Joker". Please communicate your planning **ahead of time**.

Note: If a team member fails to show continuous progress after using their
Joker, they will individually fail the overall course (unless there is a valid
reason).

**You MUST**:

- Have two meaningful contributions per week.

**You CAN**:

- Have more than one commit per contribution.
- Have more than two contributions per week.
- Link issues to contributions descriptions for better traceability.

**You CANNOT**:

- Link the same commit more than once.
- Use a commit authored by another GitHub user.

---

## Contributions Week 1 - 21.3.26 to 24.4.26

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@Nils557]** | 24.3.26   | [0c562a1](https://github.com/Nils557/sopra-fs26-group-32-client/commit/0c562a1b93bafe1c4bce200a2a43b1fadba4be35) | Created landingPage | A player needs to start somewhere |
|                    | 24.3.26   | [412eef1](https://github.com/Nils557/sopra-fs26-group-32-client/commit/412eef1ec9ae4ff31a1a530b869f00479986804f) | implemented handleLogin function | because the server needs to know the playername |
|                    | 24.3.26   | [f4a9f46](https://github.com/Nils557/sopra-fs26-group-32-client/commit/f4a9f4678273728b9714a18095a4d4f78c7a0473) | added a username taken warning | Because a user can't take an already taken username |
| **[@vanix-dm]** | 27.03.26   | [5b42379](https://github.com/Nils557/sopra-fs26-group-32-server/commit/5b42379368f0dff7ac2b195e45c0865a30347c70), [aac0771](https://github.com/Nils557/sopra-fs26-group-32-server/commit/aac07714cfc32dbf604a1b2d2e65948a08c376c0) | Aligned User entity and repository with M2 report, removed all unnecessary fields from all files | To ensure that the user has the correct parameters (username, Id, etc) |
|                    | 27.03.26   | [3c7f844](https://github.com/Nils557/sopra-fs26-group-32-server/commit/3c7f844c1beeca1e29fc4b08fb88424cf637c6fb) | Implemented user creation and validation logic | To ensure that a user can be created only with a valid username (unique and not empty) |
| **[@faiaz18]** | 28.03.26  | [069345a](https://github.com/Nils557/sopra-fs26-group-32-server/commit/069345aac942cf163d44cedb9ba7250cdfc40d99) | Implemented automatic user deletion on disconnect | Players who leave should not persist in the system |
|                    | 28.03.26   | [9d495ae](https://github.com/Nils557/sopra-fs26-group-32-server/commit/9d495aecb41ba30ce4b669490c8c91f7c290b9e7) | Created Lobby entity with status field | The game needs to track active lobbies and their state |
| **[@Bleronn4]** | 29.03.26   | [e1e0f81](https://github.com/Nils557/sopra-fs26-group-32-client/commit/e1e0f81) | created the Home Page and the Lobby Creation Page| The Player needs to have the option to host or join, if he hosts, he should be able to choose game parameters |
|                    | 29.03.2026   | [b2e2193](https://github.com/Nils557/sopra-fs26-group-32-client/commit/b2e21935a1a9c487d3682f8a8e7691fc549854c8) | [created waiting room and rerouting] | [The host should be able to wait for other players in a waiting room] |
|                    | 29.03.2026   | [4bc5298](https://github.com/Nils557/sopra-fs26-group-32-client/commit/4bc5298c425d8a2db770cbbc669e1cf9db37876b) | [created the lobby code display in the waiting room ] | [The Host has to see the code to share with his friends] |
| **[@scthisko]** | 29.03.26   | [76677dc](https://github.com/Nils557/sopra-fs26-group-32-server/commit/76677dc) | Implemented POST /lobbies endpoint including DTOs and service skeleton | The frontend needs an endpoint to create lobbies |
|                 | 29.03.26   | [890c0e3](https://github.com/Nils557/sopra-fs26-group-32-server/commit/890c0e3) | Implemented unique lobby code generation | A unique code is needed so players can find and join the correct lobby |
|                 | 29.03.26   | [c930fc5](https://github.com/Nils557/sopra-fs26-group-32-server/commit/c930fc5) | Stored lobby configuration in database including validation | Lobby data must persist so players can join and the game can start |
---

## Contributions Week 2 - 30.3.26 to 5.4.26

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@Nils557]** | 02.04.2026   | [e533114](https://github.com/Nils557/sopra-fs26-group-32-client/commit/e533114fb54a32df7d1b3de18ad7f8c34c46810c) | show error message when joining a full lobby | information for users |
|                    | 02.04.2026   | [190a0e6](https://github.com/Nils557/sopra-fs26-group-32-client/commit/190a0e6405bb1f7351ff2fafe37ac545587d076d) | [error message for game has already started and invalid lobbyname] | The player needs to know why he can't join |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@faiaz18]** | 05.04.2026   | [901d60b](https://github.com/Nils557/sopra-fs26-group-32-server/commit/901d60b5b6e3b8479f67106908aa98a9aef7d5e6) | Implemented host disconnection logic | Game/Lobby needs to get closed when the host leaves |
|                    | 05.04.2026   | [86ee73e](https://github.com/Nils557/sopra-fs26-group-32-server/commit/86ee73eb6079f81a8f292b6130be829f10bf9411) | Blocked the joins to an already started lobby | Noone should be able to join an ongoing game |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 3 - 13.4.26 to 19.4.26

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 4 - 20.4.26 to 26.4.26

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 5 - 27.4.26 to 3.5.26

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 6 - 4.5.26 to 10.5.26

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
