# Deployment

This project uses Google Cloud Build to build and deploy the backend to Cloud Run.

## Environment Variables

- `PROJECT_ID`: Google Cloud project identifier where resources are deployed.
- `SERVICE_NAME`: Cloud Run service name. For this project the service name is `learning-hub`.

## Cloud Build Trigger

Enable a Cloud Build trigger in the Google Cloud console so that pushes to the `main` branch execute the pipeline. See the [Cloud Build trigger documentation](https://cloud.google.com/build/docs/automate-builds/github/create-github-app-triggers) for details.
