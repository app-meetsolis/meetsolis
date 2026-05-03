# API Specification

### REST API Specification

```yaml
openapi: 3.0.0
info:
  title: MeetSolis API
  version: 3.0.0
  description: Post-meeting intelligence platform API for executive coaches
servers:
  - url: https://meetsolis.vercel.app/api
    description: Production API (Vercel Edge Functions)
  - url: http://localhost:3000/api
    description: Development API

security:
  - ClerkAuth: []

paths:
  /clients:
    get:
      summary: List all clients for authenticated coach
      tags: [Clients]
      responses:
        200:
          description: Array of client cards
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Client'
    post:
      summary: Create new client card
      tags: [Clients]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name]
              properties:
                name:
                  type: string
                  example: "John Smith"
                goal:
                  type: string
                  example: "Build executive presence"
                company:
                  type: string
                role:
                  type: string
                start_date:
                  type: string
                  format: date
                notes:
                  type: string
      responses:
        201:
          description: Client card created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Client'

  /clients/{clientId}:
    get:
      summary: Get client card with session timeline
      tags: [Clients]
      parameters:
        - name: clientId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Client details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Client'
    put:
      summary: Update client card
      tags: [Clients]
    delete:
      summary: Delete client card (cascades to sessions)
      tags: [Clients]

  /clients/{clientId}/sessions:
    post:
      summary: Upload transcript and trigger AI processing
      tags: [Sessions]
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                  description: .txt, .docx, .mp3, .mp4, .m4a, .wav, .webm
                transcript_text:
                  type: string
                  description: Pasted transcript text (alternative to file)
                session_date:
                  type: string
                  format: date
                title:
                  type: string
                  description: Optional, auto-generated if empty
      responses:
        201:
          description: Session created, AI processing queued
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Session'

  /clients/{clientId}/query:
    post:
      summary: Ask Solis Intelligence about client history
      tags: [Solis Intelligence]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [question]
              properties:
                question:
                  type: string
                  example: "What did John say about his relationship with the board?"
      responses:
        200:
          description: AI answer with citations
          content:
            application/json:
              schema:
                type: object
                properties:
                  answer:
                    type: string
                  citations:
                    type: array
                    items:
                      type: object
                      properties:
                        session_id:
                          type: string
                        session_date:
                          type: string
                        excerpt:
                          type: string

components:
  securitySchemes:
    ClerkAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Clerk JWT token

  schemas:
    Client:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
        name:
          type: string
        goal:
          type: string
        company:
          type: string
        role:
          type: string
        start_date:
          type: string
          format: date
        notes:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    Session:
      type: object
      properties:
        id:
          type: string
          format: uuid
        client_id:
          type: string
          format: uuid
        user_id:
          type: string
        session_date:
          type: string
          format: date
        title:
          type: string
        transcript_text:
          type: string
        transcript_file_url:
          type: string
        transcript_audio_url:
          type: string
        summary:
          type: string
        key_topics:
          type: array
          items:
            type: string
        status:
          type: string
          enum: [pending, processing, complete, error]
        created_at:
          type: string
          format: date-time
```
