---
title: Notes on React Europe 2016
date: 2016-06-04
tags: conferences
---

The second [React Europe](https://www.react-europe.org/) conference has just finished and this is a jotting-down
of some thoughts on the conference and my favorite talks whilst the Parisian red wine and almond croissants clear out of my system.

The organizers are kindly **[putting up videos on
YouTube](https://www.youtube.com/channel/UCorlLn2oZfgOJ-FUcF2eZ1A)** as I write
this.

## The Conference

This was a two-day conference preceded by a hackathon kindly hosted by Mozilla
and a welcome event hosted by [Red Badger](https://twitter.com/redbadgerteam). It was well organized and ran smoothly, the main
part consisted purely of 30 minute talks with a few lightning-talk spots. There
was plenty of time in-between for discussions.

For the hackathon attendees made project suggestions on a wiki and the organizers also set an optional challenge that involved working on specific React/React Native GitHub issues. For me the important part is not the specific project being worked on but the chance to work alongside someone you haven't met before and see how they think and use their tools. That's something I tend to miss out on working remotely.

The conference is of course about React and most of the talks are about React or related parts of the ecosystem. What interests me most though is the broader exploration around the benefits for users and developers of applying
functional programming ideas to the front-end.

I think it is because of the functional leaning that this conference and [Reactive
2015](https://reactive2015.com/) last year attracted quite a number of people who work
with different but like-minded technologies (eg. Rust, Clojure, Elm). One fun hackathon output was [rust-redux](https://github.com/fanderzon/rust-redux)!

## Talk Highlights

These are summaries of some of my favorite talks:

### [Dan Abramov](https://twitter.com/dan_abramov) - [The Redux Journey](https://www.youtube.com/watch?v=uvAXVMwHJXU)

Dan gave a very good distillation of what made Redux as successful as it has been
in a very short space of time. The first thing he pointed out is that it isn't because of
its feature set - the library is tiny and a basic version of the code fits
on a couple of slides. However the constraints that it imposes on the application
make it easier to reason about what is going on, makes debugging and testing workflows
easy and enables all kinds of interesting tooling which led to an ecosystem growing around it very quickly.

The part I found most interesting is that the design was ultimately a product of
two 'stress tests' that had to be satisfied - the ability to reload the
application without losing state during development and the ability to do
time-travelling debugging. These two tests sound like cool albeit non-essential
features. It turns out though that a design which meets these needs also makes
a lot of other features with user or developer-facing value easy: Undo/redo,
optimistic UI updates, persisting and restoring app state and cross-device
synchronization.

Whilst this is all true, I think the success also owes much to more practical
things like very good documentation and the fact that there is enough
flexibility and guidance on what to do when the app goes beyond the TodoMVC
example.

Oh, and there was a throwaway comment at the end that the "time travelling" requirement
came out of a change in the title of his talk last year at React Europe just to make it sound more
interesting 😀. Richard Branson [would approve](http://www.goodreads.com/quotes/898551-if-somebody-offers-you-an-amazing-opportunity-but-you-are).

### [Cheng Lou](https://twitter.com/_chenglou) - [The Spectrum of Abstraction](https://www.youtube.com/watch?v=mVVNJKv9esE)

Cheng's talk provided a useful way to evaluate technology choices in different
contexts by placing them on a spectrum of abstraction and understanding the
trade-offs that come with choosing technologies at different points on that
spectrum. The "spectrum of abstraction" refers to the fact that some technologies
solve very specific problems (eg. The clock app on a phone) and others
are much more abstract but are useful for a broader class of uses (eg. a Promises
library for JavaScript).

Cheng framed it as a kind of optimization problem to minimize the overall
cognitive costs of the codebase in order to satisfy an evolving set of use
cases. On the one hand, choosing unnecessary abstractions imposes a cognitive
cost because of the gap between the abstraction and the problem being solved.
On the other hand choosing too many problem-specific tools imposes other costs.

There was an interesting look at the trade-offs around the power that different
abstractions have. eg. Declarative systems for specifying things limit the
developer's freedom but often enable useful tooling and optimizations because
of those constraints.

The talk then went on to discuss how to use this to deal with common
choices that front-end developers need to make. This included specific
choices such as imperative build systems (Gulp) vs declarative (Grunt) ones,
templates vs. functions for transforming models into views, mutable vs. immutable data structures.
It also included broader questions of when to even use an abstraction versus
just copying, pasting and tweaking code.

I think having these kinds of frameworks for looking at problems is pretty handy, especially
if you can visualize them, because then you can see gaps where there might
be solutions that have not been considered.

### [Jeff Morrison](https://twitter.com/lbljeffmo) - [A deep dive into Flow](https://www.youtube.com/watch?v=VEaDsKyDxkY)

This was a technical dive into how the Flow type checker for JavaScript works,
how its approach differs from the type checking phase of a traditional compiler
and the possibilities that opens up for detecting classes of bug that a typical
compiler might not be able to. For example, detecting all the places that unsanitized
user input might reach in a program via taint analysis.

Beforehand I'd talked to many people who had some interest in trying type systems
for JavaScript and wanted recommendations for one or the other. Frankly I think both
are good options that you can't go wrong with, but before this talk I only really
understood the more practical surface-level issues (like platform support) rather
than the deeper ones that stem from the differing priorities of the projects
and the fundamentally different ways that the tools understand code.

A couple of times Jeff mentioned semantic differences between the type systems.
[This presentation](http://djcordhose.github.io/flow-vs-typescript/2016_hhjs.html) from [Oliver Zeigermann](http://twitter.com/djcordhose)
shows a couple of concrete examples (although note that the upcoming TypeScript 2.0 release
_does_ have non-nullable types).

### [Christopher Chedeau](https://twitter.com/Vjeux) - Being Successful at Open Source

The React community have produced several of the most successful projects on
GitHub, where "successful" in this context was taken to mean widely adopted/having direct impact.
This talk provided specific advice for project maintainers on how to help their
projects gain traction. Many of the points were things that would be obvious to
entrepreneurs behind new startups but are often forgotten in open source:

 1. Talk to your users. It doesn't matter which channel you use
    but you need to be present on them and active. In the React project,
    different members (and active contributors) tended to focus on
    specific channels (GitHub issues, StackOverflow).

 2. Ask as many of your users as you can two specific questions:
   1. **_What did you struggle with?_** - Find out what they had problems with,
     aggregate the feedback and prioritize. The phrasing of this question
     is important because you need to break the implicit social barrier
     that prevents users from criticising your work.
   1. **_What cool stuff are you building?_** - Show genuine interest in what your
     users are doing. Ask them to share what they have been up to (eg. by writing blog
     posts) and then promote their work.

 3. Create the perception of a community. When evaluating a technology
    choice, the perceived level of community activity is often an important
    factor.
    In the early days of a project, it helps to create this perception by
    asking users to blog about what they have been doing, writing community round-ups etc.
    Over time, this perceception becomes its own reality.

Speaking of making users feel loved, the organizers produced personalized
T-shirts with GitHub handles for attendees who had made contributions to the
code or docs for various React-related projects. I thought that was a pretty
cool touch. **Thank-you!**

## Also worth watching

Plus a couple of others from my notebook that I'd recommend seeing when
they are up on YouTube:

* [Andrew Clark](https://twitter.com/acdlite)'s talk on recompose was a useful introduction to
  the concept of higher order components, what you can do with them,
  the performance costs they can impose and how to mitigate these.

* [Lin Clark](https://twitter.com/linclark)'s [talk](https://www.youtube.com/watch?v=-t8eOoRsJ7M) was useful if you want to understand what actually happens
  when a component is "rendered" and _why_ some of the performance tips
  in the React documentation matter. Also it had cool cartoons.

## Takeaways

* The debate about basic app architecture from last year seems to have
  largely been resolved in a pretty short time in favor of
  the [Redux/Elm model](http://redux.js.org/docs/introduction/ThreePrinciples.html). [Lee Byron's talk](https://vimeo.com/album/3953264/video/166790294)
  from RenderConf was cited a couple of times as a good overview of this architecture. The current
  exploration has moved on to building all kinds of
  useful tooling that assumes this model of state
  management.

* The exploration of how best to manage effects
  nicely in Redux/Elm-like applications is ongoing
  and there isn't a clear winner yet.

* React Native has been around long enough now that
  people outside of Facebook have been able to build and ship reasonably sizable applications
  with it and provide a decent appraisal of where
  it works well, where it still needs improvement
  and where it isn't the right choice. [Brent Vatne's](https://twitter.com/notbrent) talk about
  [li'st](https://li.st/) is worth watching.

* One of the main React/React Native focus areas right now is performance
  especially for the common use case of apps that need to render large lists of
  complex _stuff_ whilst animating smoothly and responding instantly to user
  input.
