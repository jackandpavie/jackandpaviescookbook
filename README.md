# Our little cookbook

A personal birthday cookbook built with Astro and browser-local cooking tools. The four sample recipes are **demonstration content**, not recipes supplied by Pavie. The homepage photograph is an **AI-generated placeholder**. Replace both in Pages CMS.

## What works

- Editorial homepage, recipe library, permanent recipe links and collections.
- Search by recipe, ingredient, category or tag; combined filters; sorting.
- Numerical serving scaling, per-ingredient rounding and fixed quantities.
- Saved recipes, checklists, shopping lists and cooking progress in localStorage.
- One-step-at-a-time cooking mode, step ingredients, optional photos and visual cues.
- Independent deadline-based timers with pause, reset and visible completion.
- Optional screen wake lock with an unsupported-browser fallback.
- Structured cooking timelines with overlapping tasks and optional glossary links.
- Print layouts and a birthday-card generator with downloadable SVG / 1200px PNG QR.
- Full Pages CMS recipe, image and site-settings configuration in `.pages.yml`.
- GitHub Actions workflow that validates, builds, tests and publishes after CMS commits.

## Free publishing, in plain language

GitHub holds the files. GitHub Pages makes them a website. Pages CMS gives you forms to edit the files. GitHub Actions republishes the website when those files change. Visitors need no account.

1. Create a free GitHub account at https://github.com/signup if needed.
2. Create a **public** repository named `jackandpaviescookbook`. The free GitHub Pages path needs a public repository. Your recipes and photos, including draft files, can be seen in that repository.
3. Upload the supplied files, keeping their folder structure and the leading dots in `.pages.yml` and `.github`. GitHub's web uploader may omit hidden files or folders depending on your computer; the GitHub connection in ChatGPT can handle the complete upload for you. Never upload `node_modules`, `dist`, credentials or `.env` files.
4. Open the repository's **Settings → Pages**. Choose **GitHub Actions** under Source.
5. Open **Actions → Publish cookbook → Run workflow**. Choose the `main` branch. Wait for a green tick.
6. Go back to **Settings → Pages** and open the address displayed there. It will usually be `https://YOUR-USERNAME.github.io/jackandpaviescookbook/`.
7. Open that address without signing in and on your phone. Only now is that your confirmed production address.
8. Go to https://app.pagescms.org. Sign in with GitHub. Install the Pages CMS GitHub App with access to this cookbook repository, then open that repository and `main` branch. The `.pages.yml` forms are already included.
9. Open **Site settings**, fill in **Published cookbook address** and **GitHub cookbook repository**, and save.
10. Open your published site's **The birthday card** page. Confirm the published address, edit the message, generate the QR and download SVG or PNG. Test the printed code on both phones. Print at 100%, with browser headers and footers off.

The ChatGPT-hosted edition is a working demonstration. It is separate from GitHub Pages and does not automatically receive Pages CMS changes. The printed birthday QR should point to the GitHub copy that you intend to maintain.

## Add a real recipe

In Pages CMS, open **Recipes → New**. Enter its title and a permanent address such as `pavies-tomato-pasta`. Turn **Published** off while you work. Enter servings and time estimates, upload a photo and describe it. Add ingredient groups and ingredients with numeric quantities. Leave a quantity empty for “to taste”; use a note to explain. `0.5` means half.

Choose **Scale with servings** for normal ingredients. Choose **Keep this quantity fixed** where appropriate. Set rounding to `1` for whole items, `0.5` for half-items, or `0` for normal decimal rounding. Rounding does not change the cooking method or pan size. Tell the cook in the notes if a bigger batch needs different handling.

Add the steps with actions, heat level, timings and visual doneness cues. Use **Ingredient names used in this step** to enter exact ingredient names from the list. Their scaled quantities will appear in cooking mode. Timer minutes are explicit: a mention of “10 minutes” in prose alone does not create a timer. Drag repeated items to reorder them.

Add a timeline only when you have checked the timings. Start/end fields are elapsed minutes, not clock times. Overlap is supported: give concurrent tasks overlapping intervals and explain the relationship in **What can happen at the same time**. Otherwise leave the timeline empty.

Add substitutions, memories, troubleshooting, serving notes and verified food-safety advice if helpful. Turn **Published** on and save. Wait for the green publishing run in GitHub Actions. Refresh the website. Remove all four demos once your own collection is ready.

## Change photographs and the homepage

In a recipe, choose the main photo, step photo or gallery and upload the replacement. Use JPG, PNG, WebP or AVIF. Convert HEIC to JPG first. Aim for images around 1,200–1,600px wide and under 1MB. Uploads are stored in `public/images`; Astro adjusts paths for the GitHub repository subfolder.

Open **Site settings** for the cookbook title, subtitle, dedication, welcome message, signature, cover photograph, introduction photo, footer and categories. Turn off **Cover is an AI-generated placeholder** after replacing the image. Choose featured recipes and collection recipes by their titles. Change the four hex colours if desired, keeping dark text on a light background.

## Keep old links working

Leave a published recipe's address unchanged when editing it. Titles, photos and instructions can change freely. If you change an address, first add the previous address in **Previous recipe addresses**. The old recipe page will keep serving the same recipe. Keep the GitHub account username and repository name unchanged to preserve the homepage QR address.

Deleting a recipe removes its page; unpublishing it removes it from the next build. Deleting an image still used by a recipe stops the build with a clear error rather than publishing broken images.

## Timers, progress and device limits

Timers compare the current time with a stored finish time. Returning after a suspended tab catches the display up. Sound requires a user gesture and an active browser audio context. iOS and Android may suspend the page or silence audio in the background. Keep the page visible. Use your phone's alarm for critical reminders. The visible “Time's up” state works as a fallback.

The timer doesn't prove food is cooked. Follow the recipe's visual cues and checked safety instructions. The screen-wake button only works on supported browsers, secure HTTPS pages and while the page is visible.

Local favourites, shopping lists and progress are not synced across devices. Clearing site data removes them. A browser that blocks localStorage can still read the recipes; persistence is best effort. Ingredients and progress use stable IDs generated by Pages CMS, so reordering steps does not discard completion marks.

## Backup and recovery

Monthly: in GitHub choose **Code → Download ZIP**. Keep the ZIP somewhere safe, along with original photos. GitHub history records CMS commits. A previous file version can be recovered from its History page; ask for help with a revert if unsure. Use two-factor authentication and keep account recovery codes safe.

If a publishing run shows a red cross, the previous published website normally remains online. Open **Actions**, select the failed run and find the content error. Fix the highlighted field in Pages CMS and save again. Common causes are duplicate recipe addresses, a step ingredient name that doesn't match, a missing image, or a timeline end earlier than its start.

Free service policies can change. This architecture has no paid database, server, QR redirect, domain or image service. It uses current GitHub Free/public Pages and hosted Pages CMS; no service can promise perpetual availability. Keep your backups so the static site can be moved if necessary.

## Before the birthday: prove the publishing loop

- Open Pages CMS and create one real recipe.
- Upload a real photograph.
- Save and wait for a green GitHub Actions run.
- Find that recipe in the public library, open it on your phone, and try cooking mode.
- Edit one sentence and save again; check that the published sentence changes.
- Generate the QR using the final public address, scan a printed copy, then add another recipe and scan the same copy again.

This account-connected workflow must be tested after GitHub and Pages CMS are connected. It has not been claimed as completed during local development.

## Development

Node 22 or newer:

```sh
npm ci
npm run build
npm test
npm run dev
```

Tests use the generated HTML, so build before testing. For GitHub subpath verification:

```sh
SITE_URL=https://pavieselvaraj.github.io BASE_PATH=/jackandpaviescookbook npm run build
BASE_PATH=/jackandpaviescookbook npm test
```

The workflow obtains the real origin and base path from `actions/configure-pages`, avoiding manual Astro configuration. No secret is stored in the public client. Dependencies are locked in `package-lock.json`.

## Documentation checked

- https://docs.astro.build/en/guides/deploy/github/
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://pagescms.org/docs/quick-start/
- https://pagescms.org/docs/configuration/
- https://pagescms.org/docs/configuration/content/list/
- https://pagescms.org/docs/configuration/fields/reference/

## Image provenance

`public/images/cover.webp` is a built-in image-generator placeholder, optimized for the website. It does not depict Pavie's cooking. Brief: realistic independent-cookbook still life of tomato pasta and basil on pale linen, warm natural light, olive napkin, cream pottery, no text. Recipe illustrations are code-native SVG placeholders. Replace these with your own food photographs through Pages CMS.
