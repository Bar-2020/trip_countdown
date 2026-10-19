# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # Type-check (tsc -b) then Vite production build
npm run lint       # ESLint across all TS/TSX files
npm run preview    # Serve the production build locally
```

There is no test runner configured in this project.

## Architecture

This is a single-page React + TypeScript + Vite app — a personal trip countdown timer. All application logic lives in one file: `src/App.tsx`.

**How it works:**
- A hardcoded takeoff datetime string is defined at the top of `App.tsx` as a constant (e.g. `GREECE_TAKEOFF`).
- `fromZonedTime` from `date-fns-tz` converts that local datetime string from `'Asia/Jerusalem'` to UTC, which is fed to `FlipClockCountdown`.
- When the countdown reaches zero, `onComplete` triggers confetti via `react-confetti`.
- Layout is responsive: `useWindowSize` from `react-use` drives inline style adjustments for font sizes and padding.
- Background images live in `public/` and are referenced directly as `/filename.jpg`.

**To update the trip date**, change the constant at the top of `src/App.tsx` and swap the background image path in the `backgroundImage` style prop. Previous trip dates are left as commented-out constants in the file for reference.

## Deployment

The site is hosted on AWS: a private S3 bucket behind CloudFront (Origin Access Control), served on the free `*.cloudfront.net` domain. The infrastructure is defined in `terraform/` (S3, CloudFront, a GitHub OIDC role in IAM, and an AWS Budgets alert through SNS).

- **Deploys are automatic.** Pushing to `main` runs `.github/workflows/deploy.yml`: lint, build, sync `dist/` to S3, then invalidate CloudFront. The workflow assumes an IAM role through OIDC, so there are no AWS keys in GitHub. It reads `AWS_ROLE_ARN`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID` (and optionally `AWS_REGION`) from the repo's Actions variables.
- **Trips are not deployed.** A visitor's destination, photo and takeoff time live in their own browser (see Architecture above), so changing a trip never needs a deploy or a Terraform run. Only code changes merged to `main` go out.
- **Caching:** files under `assets/` are fingerprinted by Vite and cached for a year. `index.html` and the images in `public/` are cached for 5 minutes and also invalidated on every deploy.

One-time setup (needs AWS credentials for an admin user or SSO profile, never root; Terraform 1.10 or newer):

```bash
# 1. State bucket (name must be globally unique)
aws s3api create-bucket --bucket <state-bucket> --region eu-north-1 \
  --create-bucket-configuration LocationConstraint=eu-north-1
aws s3api put-bucket-versioning --bucket <state-bucket> --versioning-configuration Status=Enabled
aws s3api put-public-access-block --bucket <state-bucket> \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# 2. Provision
cd terraform
terraform init -backend-config="bucket=<state-bucket>"   # commit the generated .terraform.lock.hcl
terraform apply -var="alert_email=you@example.com"   # then confirm the SNS subscription email

# 3. Copy the outputs into GitHub: Settings > Secrets and variables > Actions > Variables
terraform output
```

Tear down with `terraform destroy`, then delete the state bucket.

## Key conventions

- All styles are inline — there is no CSS-in-JS library or external stylesheet beyond `App.css` (resets/globals) and the flip clock's own `dist/index.css`.
- The `@ts-expect-error` comment on the `--fcc-digit-block-width` CSS custom property is intentional; the flip clock component exposes that variable but it isn't typed.
