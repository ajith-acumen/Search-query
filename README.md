## Setup Instructions

1. Clone the repository

2. Navigate to project folder:
    cd piaxis_assignment

3. Install dependencies:
    npm install

## How to Run the Application

1. Start the server:
   node server.js

2. Open browser and go to:
   http://localhost:3000


## Example API Request

POST /search

Request Url:
       http://localhost:3000/search

Request Body:
    {
        "query": "windww",
        "host_element": "",
        "adjacent_element": "",
        "exposure": ""
    }

## Example Response
    {
        "results": [
            {
                "detail_id": 2,
                "title": "Window Sill Detail with Drip",
                "score": 1,
                "explanation": "Matched query : windww"
            }
        ]
    }

## Engineering Questions

## 1. If this system needed to support 100,000+ details, what changes would you make?
   -> Use database (MongoDB / PostgreSQL) with proper relationship between details and rules.
   -> Add indexing on searchable fields and implement pagination for efficient data retrieval.
   -> Use a search engine like Elasticsearch for fast and scalable querying.

## 2. What improvements would you make to the search or ranking logic in a production system?
    -> Apply weighted scoring (title > tags > description).
    -> Use advanced fuzzy search libraries or Elasticsearch.
    -> Add semantic search using embeddings for better relevance.

## 3. What additional data or signals could help improve recommendation quality?
   -> User interaction data (clicks, selected results).
   -> Frequently searched result to improve.
   -> Query match type signals (exact match vs fuzzy match) to adjust relevance.

## 4. If this API became a shared service used by multiple applications, what changes would you make to its architecture?
   -> Add authentication (JWT / API keys).
   -> add application-specific field in table(model)for example platform_name.
   -> Implement rate limiting and caching for performance and stability.

## 5. If this system needed to support 100,000+ details, what changes would you make?
   -> Introduce an AI layer(middleware) to enhance user queries and inputs before search.
   -> Improve ranking using user interaction data.
   -> Use vector-based search for semantic similarity.