# Deployment

This project uses Google Cloud Build to build and deploy the backend to Cloud Run.

## Environment Variables

Set the following variables in your Cloud Build trigger or substitutions:

- `PROJECT_ID`: Google Cloud project identifier where resources are deployed.
- `SERVICE_NAME`: Cloud Run service name. For this project the service name is `learning-hub`.

## Manual Deployment

To build and deploy the backend manually run:

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions _SERVICE_NAME=$SERVICE_NAME,PROJECT_ID=$PROJECT_ID
```

## Cloud Build Trigger

Enable a Cloud Build trigger in the Google Cloud console so that pushes to the `main` branch execute the pipeline. See the [Cloud Build trigger documentation](https://cloud.google.com/build/docs/automate-builds/github/create-github-app-triggers) for details.
