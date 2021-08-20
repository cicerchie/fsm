# Cicerchie FSM

A fast and **carefree** Typescript state machine.<br><br>

![Lastest release](https://badgen.net/github/release/cicerchie/fsm)
![License](https://badgen.net/github/license/cicerchie/fsm)
![Github repo dependents](https://badgen.net/github/dependents-repo/cicerchie/fsm)
![Github pkg dependents](https://badgen.net/github/dependents-pkg/cicerchie/fsm)
![Github open issues](https://badgen.net/github/open-issues/cicerchie/fsm)
![Github status](https://badgen.net/github/checks/cicerchie/fsm/master/Release)
![Bundlephobia MinZip](https://badgen.net/bundlephobia/minzip/@cicerchie/fsm)
![Bundlephobia dependency count](https://badgen.net/bundlephobia/dependency-count/@cicerchie/fsm)
![Snyk](https://badgen.net/snyk/cicerchie/fsm)
![Npm version](https://badgen.net/npm/v/@cicerchie/fsm)
![Npm DT](https://badgen.net/npm/dt/@cicerchie/fsm)
![Npm dependents](https://badgen.net/npm/dependents/@cicerchie/fsm)
![Npm types](https://badgen.net/npm/types/@cicerchie/fsm)
![David DM dep](https://badgen.net/david/dep/cicerchie/fsm)
![David DM dev-dep](https://badgen.net/david/dev/cicerchie/fsm)
![David DM peer-dep](https://badgen.net/david/peer/cicerchie/fsm)

---

### <span style="color:red">WARNING!</span>

These components are still "experimental" (`v0.x.x`).<br>
Some of them are not tested as rigourously as it should be and none of them have been through code review.<br>
Use them at your own risk and check that them do what you want them to do.

---

## Demo

TBD

## Getting started

```
npm install -D @cicerchie/fsm
```

## Features

[x] Finite states (non-nested)
[x] Initial state
[x] Transitions (object)
[x] Transitions (string target)
[x] Delayed transitions
[x] Context
[x] Entry actions
[x] Exit actions
[x] Transition actions
[x] Parameterized actions
[x] Async actions with onDone/onError
[-] Typescript ready (still incomplete and so many `any`!)
[ ] Docs (HELP!)

## Motivation

This project was born after looking for a good typed library for massive use in low-end devices.

Neither [Robot](https://github.com/matthewp/robot) (it is not written in Typescript) nor [XState](https://github.com/statelyai/xstate) (too big) nor its "mini version" [@xstate/fsm](https://xstate.js.org/docs/packages/xstate-fsm/) (lacking essential features) did satisfy us.

By chance we found [the great article](https://imfeld.dev/writing/simple_state_machines) by [@dimfeld](https://github.com/dimfeld) that lit the way: what a golden boy!

## Changelog

Is automagically updated with each release and [you can read it here](https://github.com/cicerchie/fsm/blob/master/CHANGELOG.md).
