# Raw Request & Error Flow Diagram

Below is a clear, raw, step-by-step text diagram showing exactly how a request travels through your code, and how errors are handled.

```text
======================================================================================
                         🚀  SUCCESSFUL REQUEST FLOW  🚀
======================================================================================

 [1] CLIENT (Browser / Postman) 
      │ 
      │ 1. Sends HTTP Request (e.g., POST /api/v1/problems)
      ▼ 
 [2] APP.JS (Express Server) 
      │ 
      │ 2. Request enters the server.
      │ 3. express.json() reads and parses the JSON body.
      ▼
 [3] ROUTES LAYER (index.js -> v1/index.js -> problems.routes.js)
      │
      │ 4. Matches URL '/api' 
      │ 5. Matches URL '/v1/problems'
      │ 6. Finds the correct route & forwards to the Controller.
      ▼
 [4] CONTROLLER LAYER (problem.controller.js)
      │
      │ 7. 'addProblem' function is called.
      │ 8. Extracts data from 'req.body'.
      │ 9. Calls 'problemService.createProblem(req.body)'.
      ▼
 [5] SERVICE LAYER (problem.service.js)
      │
      │ 10. Contains core Business Logic.
      │ 11. Validates data (e.g., checks if title is empty).
      │ 12. Sanitizes description markdown.
      │ 13. Calls 'problemRepository.createProblem(data)'.
      ▼
 [6] REPOSITORY LAYER (problem.repository.js)
      │
      │ 14. Takes the exact data and talks to MongoDB.
      │ 15. Runs DB Query (e.g., Model.create()).
      ▼
 [7] DATABASE (MongoDB)
      │
      │ 16. Saves the data and returns the new document.
      ▼
 (Data travels back up: DB -> Repo -> Service -> Controller)
      │
      ▼
 [8] CONTROLLER SENDS RESPONSE
      │
      │ 17. Returns formatted success response to the client.
      │     (res.status(201).json({ success: true, data: ... }))
      ▼
 [9] CLIENT RECEIVES SUCCESS RESPONSE



======================================================================================
                         🔴  ERROR HANDLING FLOW  🔴
======================================================================================

 [1] ERROR OCCURS ANYWHERE DEEP IN THE CODE
      │ 
      │ Example A: Database fails to connect inside REPOSITORY.
      │ Example B: Title already exists inside SERVICE (ConflictError).
      │ 
      ▼
 [2] ERROR IS THROWN UPWARDS
      │
      │ - Repository throws it to Service.
      │ - Service throws it to Controller.
      │ (No messy try-catch needed in Service layer anymore)
      ▼
 [3] CONTROLLER CATCHES THE ERROR (problem.controller.js)
      │
      │ Inside the controller's try-catch block:
      │ catch (error) {
      │    next(error);  <-- This skips all other routes!
      │ }
      ▼
 [4] GLOBAL ERROR HANDLER (errorHandler.js)
      │
      │ Express automatically forwards next(error) to your global error handler 
      │ registered at the very bottom of app.js.
      │ 
      │ - It analyzes the type of error (e.g. NotImplementedError, ConflictError).
      │ - It builds a clean error JSON object.
      ▼
 [5] CLIENT RECEIVES ERROR RESPONSE
      │
      │ Client gets a proper error response with exact reason and status code.
      │ (res.status(errorStatus).json(errorMessage))

```
