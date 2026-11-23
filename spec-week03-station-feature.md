# Kizuna Rail Feature Set 5: Stations - Specification 

## Feature: Station API and Expandable Station Details

### Goal

Implement the Stations feature for the Kizuna Rail application. This is an optional feature set intended for teams with five members.

The feature must allow the application to retrieve all stations or retrieve one station by its custom ID. It must also allow visitors to view detailed information about the starting and ending stations on the trip details page.

Station information must be retrieved from MongoDB using Mongoose and displayed through the existing Stations API.

### 1. Mongoose Schema

Create the station schema in:

`src/models/schemas/stations.js`

The schema must define the following fields:

- `id`: string, required, unique, and trimmed. This is the custom station ID.
- `name`: string, required, and trimmed.
- `prefecture`: string, required, and trimmed.
- `region`: string, required, and trimmed.
- `facilities`: array of strings, required.
- `description`: string, required, and trimmed.

The schema must use Mongoose timestamps to automatically record document creation and update times.

The station model must be exported so it can be used by the station model functions.

### 2. Station Model Functions

Create the model functions in:

`src/models/stations.js`

The functions must use Mongoose and the Station schema to retrieve station information from the MongoDB database.

#### getAllStations()

Purpose: Retrieve all station documents from the `stations` collection.

Requirements:

- Query all station documents using Mongoose.
- Return the station records.
- Return plain JavaScript objects using `.lean()`.

#### getStationById(id)

Purpose: Retrieve one station using its custom station ID.

Requirements:

- Accept a station ID as a parameter.
- Search using the custom `id` field, not MongoDB's `_id` field.
- Return the matching station.
- Return `null` if no matching station exists.
- Return a plain JavaScript object using `.lean()`.

### 3. Station API Controllers

Create the controller functions in:

`src/controllers/stations.js`

The controllers must call the corresponding model functions and send JSON responses with appropriate HTTP status codes.

#### getAllStations

Purpose: Return all stations.

Success:
- Status code: `200`
- Response body: an array of station objects.

Errors:
- `500` if an unexpected server or database error occurs.
- Return a user-friendly JSON error message.

#### getStationById

Purpose: Return one station by its custom ID.

Success:
- Status code: `200`
- Response body: the matching station object.

Errors:
- `404` if no station exists with the requested ID.
- `500` if an unexpected server or database error occurs.
- Return a user-friendly JSON error message.

Unexpected server or database errors must be logged on the server without exposing sensitive technical details in the JSON response.

### 4. Station API Routes

Create the station API routes in:

`src/routes/api-routes.js`

The routes must use Express Router and connect to the appropriate controller functions.

#### GET /api/stations

Purpose: Return all stations.

Success:
- Status code: `200`
- Response body: an array containing all station objects.

Errors:
- `500` if an unexpected server or database error occurs.

#### GET /api/stations/:id

Purpose: Return one station using its custom station ID.

Example:

    GET /api/stations/nagoya

Success:
- Status code: `200`
- Response body: the matching station object.

Errors:
- `404` if the station does not exist.
- `500` if an unexpected server or database error occurs.

The API route paths must be correctly mounted so that the final URLs are:

- `/api/stations`
- `/api/stations/:id`

The routes must not contain duplicated path segments.

### 5. Swagger Documentation

Add Swagger documentation for both station API routes.

Swagger must document:

- `GET /api/stations`
- `GET /api/stations/{id}`

The documentation must include:

- Route purpose and description.
- Expected response data.
- HTTP `200` success response.
- HTTP `404` response for a station that cannot be found.
- HTTP `500` response for an unexpected server or database error.

Both routes must be testable through the Swagger interface at:

`/api-docs`

### 6. Expandable Station Details on the Trip Details Page

Update the trip details page in:

`src/views/trips/details.ejs`

Currently, the page displays only the starting and ending station IDs.

Add a button beside each station that allows visitors to request and view detailed station information.

Each station must have:

- Its starting or ending station label.
- Its station name or ID.
- A button labelled `View Station Details`.
- A hidden container for the station information.

Each button must include a `data-station-id` attribute containing the corresponding station's custom ID.

Example:

    <button
        type="button"
        class="station-details-btn"
        data-station-id="nagoya">
        View Station Details
    </button>

The hidden container must display the station information when the visitor clicks the button.

### 7. Client-Side JavaScript

Implement the station details functionality in:

`public/js/main.js`

Create a function named `hookStationDetails()`.

The function must:

1. Find all elements with the `station-details-btn` class.
2. Add a click event listener to each station details button.
3. Read the station ID from the button's `data-station-id` attribute.
4. Use the Fetch API to request the station from `/api/stations/:id`.
5. Check the API response to confirm that the request was successful.
6. Convert the response into JSON.
7. Display the returned station information in the correct container.
8. Allow visitors to hide the station information by clicking the button again.
9. Display a friendly error message if the request fails.

The function must be called inside the existing `DOMContentLoaded` event listener so that it runs after the webpage has loaded.

### 8. Station Information Display

When visitors click the station details button, the expandable section must display:

- Station name.
- Prefecture.
- Region.
- Available facilities.
- Station description.

The information must appear underneath the correct station.

Visitors must be able to expand and collapse the information without refreshing or reloading the page.

The starting station and ending station must work independently.

### 9. CSS Styling

Add the station details styling to:

`public/css/main.css`

The CSS must provide:

- A clearly visible station details button.
- A different background colour when the visitor hovers over the button.
- A readable background for the expanded information.
- Appropriate spacing and padding.
- Rounded borders.
- Clear styling for the station name and information paragraphs.

The styling must be consistent with the existing Kizuna Rail website design.

### 10. Error Handling and Security

- The API must return appropriate HTTP status codes.
- A missing station must return `404`.
- Unexpected server or database errors must return `500`.
- Error details must not expose sensitive server information.
- Client-side JavaScript must check the API response before displaying the data.
- Station information must be inserted using safe DOM methods such as `textContent`, `createElement()`, and `appendChild()`.

### 11. Deployment and Testing Expectations

After implementation:

- The station schema must work with MongoDB.
- Both station model functions must retrieve the correct records.
- Both station controller functions must return the correct JSON responses.
- Both station API routes must work locally and in the deployed application.
- Swagger must document and allow testing of both station API routes.
- The trip details page must display the station details buttons.
- Clicking the starting station button must retrieve and display the correct starting station information.
- Clicking the ending station button must retrieve and display the correct ending station information.
- Visitors must be able to expand and collapse station information without reloading the page.
- The feature must work in the deployed Render application.