# Set up Firebase rules deployment

The [rules workflow](../.github/workflows/firebase-rules.yml) deploys to `dev` before `prod`. It runs when Firebase config or rule files change on `main`, or when a maintainer dispatches it on `main`. A development failure prevents the production deploy. A shared concurrency group prevents overlapping rules deployments.

Complete this setup as a maintainer before the first deployment. Creating the cloud identity, granting IAM access, setting repository variables, and running the first deploy are maintainer tasks. This change does not perform them.

## Create the deploy service account

Use a signed-in `gcloud` maintainer account that can enable APIs, create service accounts and workload identity pools, and grant IAM roles on both projects.

Enable authentication APIs in the identity project and the APIs checked by the pinned Firebase CLI in both projects:

```bash
gcloud services enable iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com \
  --project=bypass-links-dev

for project in bypass-links-dev bypass-links; do
  gcloud services enable firebase.googleapis.com firebasedatabase.googleapis.com \
    firebaserules.googleapis.com firebasestorage.googleapis.com \
    serviceusage.googleapis.com cloudresourcemanager.googleapis.com \
    --project="$project"
done

gcloud iam service-accounts create firebase-rules-ci \
  --project=bypass-links-dev \
  --display-name='GitHub Firebase rules deploy'

FIREBASE_RULES_SERVICE_ACCOUNT='firebase-rules-ci@bypass-links-dev.iam.gserviceaccount.com'
FIREBASE_RULES_PROJECT_NUMBER="$(gcloud projects describe bypass-links-dev --format='value(projectNumber)')"
```

Grant the service account these predefined roles on each project:

| Role                                    | Purpose                                                                            |
| --------------------------------------- | ---------------------------------------------------------------------------------- |
| `roles/firebasedatabase.admin`          | Validate and publish Realtime Database rules. Includes Firebase project discovery. |
| `roles/firebaserules.admin`             | Validate and publish Storage rulesets and releases.                                |
| `roles/firebasestorage.viewer`          | Discover the existing default bucket using `firebasestorage.defaultBucket.get`.    |
| `roles/serviceusage.serviceUsageViewer` | Check that required APIs are enabled using `serviceusage.services.get`.            |

```bash
for project in bypass-links-dev bypass-links; do
  for role in roles/firebasedatabase.admin roles/firebaserules.admin \
    roles/firebasestorage.viewer roles/serviceusage.serviceUsageViewer; do
    gcloud projects add-iam-policy-binding "$project" \
      --member="serviceAccount:$FIREBASE_RULES_SERVICE_ACCOUNT" \
      --role="$role" --condition=None
  done
done
```

These roles cover the pinned CLI's project, database, and default-bucket discovery calls. The workflow does not need object access, Storage Admin, Editor, or permission to enable APIs. A previous local dry run reached valid database syntax but failed Storage discovery with `serviceusage.services.get` denied. The Service Usage Viewer grant addresses that check. Any API that is disabled must be enabled by the maintainer before running CI.

See the official [Realtime Database roles](https://docs.cloud.google.com/iam/docs/roles-permissions/firebasedatabase), [Rules roles](https://docs.cloud.google.com/iam/docs/roles-permissions/firebaserules), [Storage discovery roles](https://docs.cloud.google.com/iam/docs/roles-permissions/firebasestorage), and [Service Usage roles](https://docs.cloud.google.com/iam/docs/roles-permissions/serviceusage). The CLI's [bucket discovery](https://github.com/firebase/firebase-tools/blob/v15.34.1/src/gcp/storage.ts) uses the Firebase default-bucket endpoint.

## Restrict federation to this workflow on main

Create a dedicated pool and GitHub OIDC provider in `bypass-links-dev`. The provider admits only owner ID `51703039`, repository ID `296827945`, branch `main`, and this workflow. Numeric IDs prevent a new account or repository that reuses an old name from inheriting access.

```bash
gcloud iam workload-identity-pools create github-firebase-rules \
  --project=bypass-links-dev --location=global \
  --display-name='GitHub Firebase rules'

gcloud iam workload-identity-pools providers create-oidc github \
  --project=bypass-links-dev --location=global \
  --workload-identity-pool=github-firebase-rules \
  --issuer-uri='https://token.actions.githubusercontent.com' \
  --attribute-mapping='google.subject=assertion.sub,attribute.repository_id=assertion.repository_id,attribute.repository_owner_id=assertion.repository_owner_id,attribute.ref=assertion.ref,attribute.workflow_ref=assertion.workflow_ref' \
  --attribute-condition="attribute.repository_owner_id == '51703039' && attribute.repository_id == '296827945' && attribute.ref == 'refs/heads/main' && attribute.workflow_ref == 'amitsingh-007/bypass-links/.github/workflows/firebase-rules.yml@refs/heads/main'"

gcloud iam service-accounts add-iam-policy-binding "$FIREBASE_RULES_SERVICE_ACCOUNT" \
  --project=bypass-links-dev \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$FIREBASE_RULES_PROJECT_NUMBER/locations/global/workloadIdentityPools/github-firebase-rules/attribute.repository_id/296827945"

FIREBASE_WORKLOAD_IDENTITY_PROVIDER="$(gcloud iam workload-identity-pools providers describe github \
  --project=bypass-links-dev --location=global \
  --workload-identity-pool=github-firebase-rules --format='value(name)')"
```

Keep the default provider audience. Do not grant the whole pool access to the service account. The provider condition rejects forks, other repositories, other branches, and other workflows. Preserve these restrictions if the workflow is renamed.

The [Google federation setup guide](https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines) and [authentication action documentation](https://github.com/google-github-actions/auth#indirect-wif) describe service account impersonation. The action creates temporary Application Default Credentials, exports their path, and deletes the file after the job. The [pinned Firebase CLI](https://github.com/firebase/firebase-tools/blob/v15.34.1/src/requireAuth.ts) reads those credentials through `google-auth-library`.

## Set repository variables and hand off

Set these GitHub Actions repository variables in `amitsingh-007/bypass-links`. They contain identity names, not credentials:

```bash
gh variable set FIREBASE_RULES_SERVICE_ACCOUNT \
  --repo amitsingh-007/bypass-links --body "$FIREBASE_RULES_SERVICE_ACCOUNT"
gh variable set FIREBASE_WORKLOAD_IDENTITY_PROVIDER \
  --repo amitsingh-007/bypass-links --body "$FIREBASE_WORKLOAD_IDENTITY_PROVIDER"
```

The provider value has the form `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-firebase-rules/providers/github`. The service account value is `firebase-rules-ci@bypass-links-dev.iam.gserviceaccount.com`. No JSON key, `FIREBASE_TOKEN`, or other cloud secret is required.

Stop here until the maintainer has completed the setup and reviewed the rule files against the active console rules. Allow at least five minutes for federation and IAM changes to propagate.

After the workflow reaches `main`, dispatch it with GitHub network access:

```bash
gh workflow run firebase-rules.yml --repo amitsingh-007/bypass-links --ref main
```

Confirm that development succeeds before production starts. Check Realtime Database and Storage rules history in both Firebase projects. The first deployment must show the CI deployment identity and no rule content change. An unchanged Storage ruleset may be skipped by the CLI. Confirm its active content still matches the repo. Record the run URL and both projects' verification in the PR before closing #4346. A failed run requires a maintainer to fix the setup and rerun it.
