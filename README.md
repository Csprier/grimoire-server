# Grimoire-server

## MERN stack

Live URL: https://csp-grimoire.netlify.com

Client Repo:  https://github.com/Csprier/grimoire-client

## Dependencies
- bcryptjs
- cors
- dotenv
- express
- jsonwebtoken
- mongoose
- morgan
- nodemon
- passport
- passport-jwt
- passport-local

### devDependencies: 
- chai
- chai-http
- cross-env
- mocha

### MongoDB
### Mongoose(ORM)
### Express.js
### Node.js

This is the server to Grimoire. It's a CRUD application built as a solution to a problem I have of using too many scraps of paper to take notes; so I made it digital. 

## Endpoints:
- /api/users
  * POST - Create a new user account

- /api/auth/refres
  * POST - Refresh JWT Auth Token

- /api/notes
  * GET - Get all notes
  * GET/:id - Get note by ID
  * POST - Create a note, and also create tags/folders if they don't exist in the database upon creating a note.
  * PUT/:id - Replace the entire document
  * PATCH/:id - Edit part of a document
  * DELETE/:id - Delete note by ID

- /api/tags
  * GET - Get all tags
  * GET/:id - Get tag by ID
  * POST - Create a tag
  * PUT - Replace the entire document
  * DELETE/:id - Delete tag by ID

- /api/folders
  * GET - Get all folders
  * GET/:id - Get folder by ID
  * POST - Create a folder
  * PUT - Replace the entire document
  * DELETE/:id - Delete folder by ID