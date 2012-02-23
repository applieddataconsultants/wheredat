.PHONY: watch tmux tmux_setup deploy_live
project=wheredat
path=/var/www/wheredat
instance=\033[32;01m${project}\033[m

watch:
	@always app.js

deploy_live: server = sawyer@172.25.20.120
deploy_live:
	@rsync -az --exclude=".git" --delete * ${server}:${path}
	@echo " ${instance} | copied files to ${server}"
	@ssh ${server} "sudo restart ${project}"
	@echo " ${instance} | restarting app on ${server}"

tmux_setup:
	@tmux new-session -s ${project} -d -n workspace
	@tmux split-window -t ${project} -h
	@tmux select-layout -t ${project} main-vertical
	@tmux send-keys -t ${project}:1.0 'vim' C-m
	@tmux send-keys -t ${project}:1.1 'make' C-m
	@tmux select-pane -t ${project}:1.0

tmux:
	@if ! tmux has-session -t ${project}; then exec make tmux_setup; fi
	@tmux attach -t ${project}
