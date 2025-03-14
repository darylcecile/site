---
title: PF February Update ⚡️🧙🏽‍♂️
date: "2020-02-29"
snippet: Life updates - February
---

This month's entry is comparatively short to the last, as it is not what I had initially planned to post. This is due to me spending almost an hour and half doing the write up for the original post to then decide at the very last minute that I needed more time to refine the wording of the content. So here is a short post 😂

As of two weeks ago, Rizwana and I have made the decision to overhaul the ProjectFunction website. This decision is a result of the increased intake in students. When I first wrote the original website, It was done very haphazardly. At the time, it felt more important to launch something that the learners could make use of to enhance their experience of ProjectFunction; and so I prioritised meeting a delivery deadline over maintainability, and as you can guess, this has not gone down well. 🤦🏽‍♂️

The backend for the original database was written in PHP and the data was maintained in a (very) _loosely_ relational MySQL database. Even though this allowed me to make changes to the database structure within minutes without losing any data, it did lead to a lot of redundant data. During the development of the website, I knew deep down it would need rewriting from the ground up. After all, the website was made as a proof-of-concept, and it was so well received that we ended up adding more features instead of re-writing. But now it is time.

Due to our future plans and use-cases involving user-automated-tests, we have decided to move over to a NodeJS backend. This would mean we could re-use some of the libraries we have created over the year in both the front and backend, as well as run all user-automated-tests on our own end (instead of using heroku and hooks and hacky magic stuff 🧙🏽‍♂️)

Last week, I started some work on the new system, setting up the server, services, and database structure. The number one difficulty I had with this process was moving the data we had over from the current (un)relational database, to our new one. Because of how much redundant data there was, as well as the lack of relations between some of the tables, I ended up having to create a data dump of the old database, then use a js script to read, analyse and re-associate each of the data entries so that they could be seeded into the new fully-relational database. Surprisingly, this process only took 4 minutes.

So far, the database is fully set up and functional. All that is left to do now is move-over some of the old php-based views to EJS, and create routers for the new website. As for the design of the new website, we intend to keep the same look and feel, so the stylesheets we already have will be reused.

As we've done in the past, we wont be minifying or obfuscating any of the resources. This was a conscious decision to enable learners to view the source of our website and see an untouched version of the resources. And based on the feedback we got from some learners, this was a good move as it enabled them to understand how we implemented some parts of our website.⚡️

Over the next few weeks, we intend on working solely on the LMS side of the ProjectFunction website, so that it is ready for use in June. During this time, some parts of the website may change (for the better) as we decide what to keep, remove, and update. Once the site is ready for launch, we shall decomission the old LMS, and start working on moving the current visitor-facing site (i.e. The ProjectFunction homepage) over to NodeJS.

Until then... ✌🏽

--

_P.S. I realise now that this wasn't exactly a "short" entry, but I know if I go back to make changes, this post wont be out on time... So, here_ 🤷🏽‍♂️

_P.P.S. We got us some customized ProjectFunction business cards!_


![Me holding my new PF business card](/images/business_card_1.jpeg)