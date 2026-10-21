# 💕 Date Picker

A small static page for planning a date. The person you invite picks a date, time, activity, food and dessert, and the answers are emailed to you through [FormSubmit](https://formsubmit.co). There's no backend, so it runs on GitHub Pages.

## Setup

1. Open `config.js` and set `fromName` and `formSubmitEmail`. You can also change the activities, foods and desserts there.
2. Open `index.html` in a browser and send one test submission.
3. FormSubmit emails you a one-time **activation link**. Click it. Submissions are only delivered after you activate.
4. Optional: the activation email also gives you a random alias. Put that alias in `formSubmitEmail` so your real address isn't visible in the public page source.

## Deploy to GitHub Pages

```bash
git init && git add . && git commit -m "Date picker"
git branch -M main
git remote add origin https://github.com/<you>/date-picker.git
git push -u origin main
```

Then on GitHub go to **Settings → Pages → Build and deployment**, set **Source: Deploy from a branch**, choose **Branch: main / (root)**, and save. After about a minute the site is live at `https://<you>.github.io/date-picker/`.
