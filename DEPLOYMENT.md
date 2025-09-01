# Deployment

This project uses Google Cloud Build to build, test, and deploy the backend to Cloud Run.

## Environment Variables

When configuring the Cloud Build trigger, supply the following variables. They are injected into the Cloud Run service during deployment:

- `PROJECT_ID`: Google Cloud project identifier where resources are deployed.
- `_SERVICE_NAME`: Cloud Run service name. For this project the service name is `learning-hub`.
- `_REGION`: Cloud Run region (for example `us-central1`).
- `GOOGLE_CLIENT_ID`: OAuth client ID used to verify incoming ID tokens.
- `GOOGLE_CLIENT_SECRET`: Client secret paired with the OAuth client ID.
- `GOOGLE_REDIRECT_URI`: Redirect URI configured for the OAuth client.
- `FIREBASE_SERVICE_ACCOUNT`: JSON service account credentials for Firestore.

You can store these values as **Cloud Build variables** or use [Secret Manager](https://cloud.google.com/secret-manager) and reference the secrets in the trigger configuration.

## Rollout Process

1. Push changes to the `main` branch.
2. Cloud Build runs `npm ci`, executes tests, builds the Docker image, and deploys it to Cloud Run.
3. The Cloud Run service `learning-hub` creates a new revision and directs all traffic to it.
4. Verify the deployment in the Cloud Build logs and Cloud Run console.
5. To roll back, redeploy a previous revision using `gcloud run deploy`.

## Manual Deployment

To build and deploy the backend manually run:

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions _SERVICE_NAME=$SERVICE_NAME,_REGION=$REGION,PROJECT_ID=$PROJECT_ID,\
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET,GOOGLE_REDIRECT_URI=$GOOGLE_REDIRECT_URI,FIREBASE_SERVICE_ACCOUNT=$FIREBASE_SERVICE_ACCOUNT
```

## Cloud Build Trigger

Create a trigger in the Google Cloud console so that pushes to the `main` branch execute the pipeline:

1. Open **Cloud Build → Triggers** and click **Create trigger**.
2. Choose this repository and set the event to **Push to a branch** with the branch pattern `main`.
3. Use `cloudbuild.yaml` as the build configuration file.
4. Supply the substitutions and environment variables listed above.

Alternatively, create the trigger with the `gcloud` CLI:

```bash
gcloud beta builds triggers create github \
  --name=backend-deploy \
  --repo-name=gbsenterprise-sora \
  --repo-owner=YOUR_GITHUB_ACCOUNT \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=learning-hub,_REGION=us-central1
```

See the [Cloud Build trigger documentation](https://cloud.google.com/build/docs/automate-builds/github/create-github-app-triggers) for more details.
