# specs/

`petstore.json` is a vendored copy of the [Swagger Petstore v3](https://github.com/swagger-api/swagger-petstore)
OpenAPI 3.0 spec, adapted for the local Docker container.

Key adaptations from the canonical spec:
- `servers[0].url` points to `http://localhost:8080/api/v3`
- `"default"` response codes replaced with explicit HTTP status codes
  so playswag can track which codes are actually exercised
- `POST /pet/{petId}` (update with form) includes `200` alongside `405`

## Refreshing the spec

To re-download the live spec from a running container (useful when the image is updated):

```bash
docker compose up -d   # start the container
npm run refresh-spec   # fetches /api/v3/openapi.json and writes specs/petstore.json
```

The vendored file is committed so CI can run without network access after the initial pull of the Docker image.
