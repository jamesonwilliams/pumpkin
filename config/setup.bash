#!/bin/bash

aws ecs register-task-definition \
    --cli-input-json file://pumpkin-server-task.json

aws ecs run-task \
    --task-definition 'pumpkin:1' \
    --count 1

aws ecs create-service \
    --service-name pumpkin \
    --task-definition 'pumpkin:1' \
    --desired-count 1

