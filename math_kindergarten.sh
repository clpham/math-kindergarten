#!/usr/bin/bash
~/.npm-global/bin/pm2 delete math-kindergarten --silent
~/.npm-global/bin/pm2 serve ~/Public/liam/projects/math-kindergarten/build 38080 --name math-kindergarten -spa
