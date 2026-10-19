// Uploads the built site (dist/) to S3 and clears CloudFront's cached copies.
// Run it with `npm run deploy`, which builds first. Add `-- --dry-run` to list what would
// be uploaded without changing anything.
//
// The bucket and distribution come from `terraform output` (run this on the machine where
// you ran Terraform), or from the S3_BUCKET and CLOUDFRONT_DISTRIBUTION_ID environment variables.
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

process.chdir(fileURLToPath(new URL('..', import.meta.url)))
const dryRun = process.argv.includes('--dry-run')

function fail(message) {
    console.error(`\n${message}\n`)
    process.exit(1)
}

function run(command, args, { capture = false } = {}) {
    const result = spawnSync(command, args, {
        encoding: 'utf8',
        stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    })
    return { missing: result.error?.code === 'ENOENT', status: result.status, stdout: result.stdout ?? '' }
}

function terraformOutput(name) {
    const result = run('terraform', ['-chdir=terraform', 'output', '-raw', name], { capture: true })
    return result.missing || result.status !== 0 ? null : result.stdout.trim()
}

if (!existsSync('dist/index.html')) {
    fail('dist/ is missing. Run `npm run deploy`, which builds the site first.')
}

const identity = run('aws', ['sts', 'get-caller-identity'], { capture: true })
if (identity.missing) fail('The AWS CLI was not found. Install it, open a new terminal, and sign in with `aws login`.')
if (identity.status !== 0) fail('You are not signed in to AWS. Run `aws login` and try again.')

const bucket = process.env.S3_BUCKET || terraformOutput('bucket_name')
const distribution = process.env.CLOUDFRONT_DISTRIBUTION_ID || terraformOutput('distribution_id')
if (!bucket || !distribution) {
    fail(
        'Could not find the bucket and distribution. Run `terraform apply` in terraform/ first, ' +
            'or set S3_BUCKET and CLOUDFRONT_DISTRIBUTION_ID.',
    )
}

const dry = dryRun ? ['--dryrun'] : []
const uploads = [
    // Vite fingerprints everything under assets/, so it can be cached for a year.
    ['s3', 'sync', 'dist/assets', `s3://${bucket}/assets`, '--cache-control', 'public,max-age=31536000,immutable', ...dry],
    // index.html and favicon.svg are not fingerprinted, so they keep a short cache.
    ['s3', 'sync', 'dist', `s3://${bucket}`, '--exclude', 'assets/*', '--delete', '--cache-control', 'public,max-age=300', ...dry],
]
for (const args of uploads) {
    if (run('aws', args).status !== 0) fail('The upload failed. See the message above.')
}

if (dryRun) {
    console.log('\nDry run: nothing was uploaded and no cache was cleared.')
    process.exit(0)
}

const invalidation = run('aws', [
    'cloudfront', 'create-invalidation', '--distribution-id', distribution, '--paths', '/*',
    '--query', 'Invalidation.Status', '--output', 'text',
])
if (invalidation.status !== 0) fail('The files were uploaded, but clearing the CloudFront cache failed. See the message above.')

const url = terraformOutput('site_url')
console.log(`\nDone. CloudFront needs about a minute to show the new version${url ? `: ${url}` : '.'}`)
