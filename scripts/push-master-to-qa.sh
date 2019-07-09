#!/bin/bash
echo ""
echo "          Internal server                       Production server"
echo ""
echo "     +------------+-----------+          +-------------+----------------+"
echo "     |   master   |    qa     |          |   staging   |   production   |"
echo "     +------------+-----------+          +-------------+----------------+"
echo ""
echo "        Working     Internal                 Client         Online"
echo "        branch      review                   review         version"
echo ""
echo "           +           ^"
echo "           |           |"
echo "           +-----------+"
echo ""
echo "This script will merge master into qa and start a build."
echo "If the build is successful, the branch will be deployed to the internal server."
echo ""
read -r -p "Are you sure? [y/N] " response
if ! [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]
then
    exit
fi

echo "> Merging master to qa...";
git fetch . master:qa

echo "> Pushing qa..."
git push origin qa
