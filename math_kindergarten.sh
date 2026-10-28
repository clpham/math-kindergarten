#!/usr/bin/bash
~/.npm-global/bin/pm2 delete math_kindergarten --silent
~/.npm-global/bin/pm2 serve ~/Public/liam/projects/math_kindergarten/build 38080 --name math_kindergarten -spa
