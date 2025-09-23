# API Specification

### REST API Specification

```yaml
openapi: 3.0.0
info:
  title: MeetSolis API
  version: 1.0.0
  description: Full-stack video conferencing platform API with real-time collaboration features
servers:
  - url: https://meetsolis.vercel.app/api
    description: Production API (Vercel Edge Functions)
  - url: http://localhost:3000/api
    description: Development API

security:
  - ClerkAuth: []

paths:
  /meetings:
    post:
      summary: Create new meeting
      tags: [Meetings]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [title]
              properties:
                title:
                  type: string
                  example: "Weekly Team Standup"
                description:
                  type: string
                  example: "Sprint planning and updates"
                scheduled_start:
                  type: string
                  format: date-time
                settings:
                  $ref: '#/components/schemas/MeetingSettings'
      responses:
        201:
          description: Meeting created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Meeting'

  /meetings/{meetingId}:
    get:
      summary: Get meeting details
      tags: [Meetings]
      parameters:
        - name: meetingId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Meeting details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Meeting'

components:
  securitySchemes:
    ClerkAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Clerk JWT token

  schemas:
    Meeting:
      type: object
      properties:
        id:
          type: string
          format: uuid
        host_id:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
        status:
          type: string
          enum: [scheduled, active, ended]
        settings:
          $ref: '#/components/schemas/MeetingSettings'

    MeetingSettings:
      type: object
      properties:
        allow_screen_share:
          type: boolean
          default: true
        allow_whiteboard:
          type: boolean
          default: true
        auto_record:
          type: boolean
          default: false
```
