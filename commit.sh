#!/bin/bash

# sample command ./commit.sh 'Update commit'

COMMIT="Initial Committed"

if [ "$1" ] ; then
   COMMIT="$1";
fi

git add .

pnpm run format

if [ "$2" ] ; then
   pnpm deploy:prod
fi

git commit -a -m "${COMMIT} at `date +%F-%T`"
git push